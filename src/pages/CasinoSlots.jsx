import { useEffect, useMemo, useState } from "react";
import "./CasinoSlots.css";

import { db } from "../firebase";
import { secondaryDb } from "../firebaseSecondary";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

import { useBalance } from "../context/BalanceContext";

export default function CasinoSlots() {
  const { setBalances } = useBalance();

  const MIN_BETS = {
    TZS: 2500,
    USDT: 1,
    KES: 130,
    UGX: 3800,
    RWF: 1300,
    BIF: 2900,
    ZMW: 27,
    MWK: 1700,
    MZN: 64,
    USD: 1,
    SSP: 1300,
    BWP: 13.5,
    MGA: 4500
  };

  const BET_SHORTCUTS = {
    TZS: [2500, 5000, 10000, 20000, 50000],
    USDT: [1, 5, 10, 20, 25],
    KES: [130, 500, 1000, 2000, 5000],
    UGX: [3800, 10000, 20000, 50000, 100000],
    RWF: [1300, 3000, 5000, 10000, 20000],
    BIF: [2900, 5000, 10000, 20000, 50000],
    ZMW: [27, 50, 100, 200, 500],
    MWK: [1700, 3000, 5000, 10000, 20000],
    MZN: [64, 100, 200, 500, 1000],
    USD: [1, 5, 10, 20, 50],
    SSP: [1300, 3000, 5000, 10000, 20000],
    BWP: [13.5, 25, 50, 100, 200],
    MGA: [4500, 10000, 20000, 50000, 100000]
  };

  // HARDER MODE
  const symbols = [
    { id: "cherry", icon: "🍒", weight: 26, multi: 2 },
    { id: "lemon", icon: "🍋", weight: 24, multi: 2 },
    { id: "grape", icon: "🍇", weight: 16, multi: 3 },
    { id: "plum", icon: "🍑", weight: 12, multi: 3 },
    { id: "bell", icon: "🔔", weight: 6, multi: 5 },
    { id: "seven", icon: "7️⃣", weight: 3, multi: 8 },
    { id: "wild", icon: "⭐", weight: 1, multi: 10 }
  ];

  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [currency, setCurrency] = useState("TZS");

  const [bet, setBet] = useState(2500);
  const [manualBet, setManualBet] = useState(2500);

  const [reels, setReels] = useState(["🍒", "🍋", "🍇", "🔔", "⭐"]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [lastWin, setLastWin] = useState(0);
  const [bonusWin, setBonusWin] = useState(0);

  const currentMinBet = MIN_BETS[currency] || 0;
  const currentButtons = BET_SHORTCUTS[currency] || [currentMinBet];

  const formatMoney = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getCurrencyBalanceField = (curr) => {
    const map = {
      TZS: "tshBalance",
      USDT: "usdtBalance",
      KES: "KESBalance",
      UGX: "UGXBalance",
      RWF: "RWFBalance",
      BIF: "BIFBalance",
      ZMW: "ZMWBalance",
      MWK: "MWKBalance",
      MZN: "MZNBalance",
      USD: "USDBalance",
      SSP: "SSPBalance",
      BWP: "BWPBalance",
      MGA: "MGABalance"
    };

    return map[curr] || "tshBalance";
  };

  const getAllBalancesFromUser = (data) => ({
    TZS: Number(data.tshBalance || 0),
    USDT: Number(data.usdtBalance || 0),
    USD: Number(data.USDBalance || 0),
    KES: Number(data.KESBalance || 0),
    UGX: Number(data.UGXBalance || 0),
    RWF: Number(data.RWFBalance || 0),
    BIF: Number(data.BIFBalance || 0),
    ZMW: Number(data.ZMWBalance || 0),
    MWK: Number(data.MWKBalance || 0),
    MZN: Number(data.MZNBalance || 0),
    SSP: Number(data.SSPBalance || 0),
    BWP: Number(data.BWPBalance || 0),
    MGA: Number(data.MGABalance || 0)
  });

  const getMainBalance = (data) => {
    const allBalances = {
      TZS: Number(data.tshBalance || 0),
      USDT: Number(data.usdtBalance || 0),
      KES: Number(data.KESBalance || 0),
      UGX: Number(data.UGXBalance || 0),
      RWF: Number(data.RWFBalance || 0),
      BIF: Number(data.BIFBalance || 0),
      ZMW: Number(data.ZMWBalance || 0),
      MWK: Number(data.MWKBalance || 0),
      MZN: Number(data.MZNBalance || 0),
      USD: Number(data.USDBalance || 0),
      SSP: Number(data.SSPBalance || 0),
      BWP: Number(data.BWPBalance || 0),
      MGA: Number(data.MGABalance || 0)
    };

    const validBalances = Object.entries(allBalances).filter(
      ([, amount]) => amount > 0
    );

    if (validBalances.length === 0) return "0.00 TZS";

    const highest = validBalances.reduce((max, current) => {
      return current[1] > max[1] ? current : max;
    });

    return `${highest[1].toFixed(2)} ${highest[0]}`;
  };

  const validateBet = (amount) => {
    const finalBet = Number(amount || 0);

    if (!finalBet || finalBet <= 0) {
      return `Minimum bet is ${currentMinBet} ${currency}`;
    }

    if (finalBet < currentMinBet) {
      return `Minimum bet is ${currentMinBet} ${currency}`;
    }

    if (finalBet > credit) {
      return "Insufficient balance";
    }

    return "";
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;

    const q = query(collection(db, "users"), where("username", "==", username));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();

        const main = getMainBalance(data);
        const [value, curr] = main.split(" ");

        setCredit(Number(value));
        setCurrency(curr);
        setDisplayBalance(`${formatMoney(value)} ${curr}`);
        setBalances(getAllBalancesFromUser(data));

        const newMin = MIN_BETS[curr] || 0;
        const newButtons = BET_SHORTCUTS[curr] || [newMin];

        setBet(newButtons[0] || newMin);
        setManualBet(newButtons[0] || newMin);
      }
    });

    return () => unsubscribe();
  }, [setBalances]);

  const weightedPool = useMemo(() => {
    const pool = [];
    symbols.forEach((s) => {
      for (let i = 0; i < s.weight; i++) {
        pool.push(s);
      }
    });
    return pool;
  }, []);

  const getRandomSymbol = () => {
    const picked = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    return picked;
  };

  const randomReels = () => {
    return Array.from({ length: 5 }, () => getRandomSymbol());
  };

  // HARDER WIN RULES
  const calculateWin = (line, usedBet) => {
    const ids = line.map((item) => item.id);

    const countMap = {};
    ids.forEach((id) => {
      countMap[id] = (countMap[id] || 0) + 1;
    });

    const wildCount = countMap.wild || 0;
    const helperWild = Math.min(wildCount, 1);

    let bestWin = 0;
    let bestLabel = "No win";

    symbols.forEach((symbol) => {
      if (symbol.id === "wild") return;

      const total = (countMap[symbol.id] || 0) + helperWild;

      if (total >= 4) {
        let multiplier = 0;

        if (total === 4) multiplier = symbol.multi;
        if (total >= 5) multiplier = symbol.multi * 2;

        const amount = usedBet * multiplier;

        if (amount > bestWin) {
          bestWin = amount;
          bestLabel = `${symbol.icon} x${multiplier}`;
        }
      }
    });

    if ((countMap.wild || 0) === 5) {
      bestWin = usedBet * 20;
      bestLabel = "⭐ JACKPOT x20";
    }

    return {
      amount: Number(bestWin.toFixed(2)),
      label: bestLabel
    };
  };

  const spin = async () => {
    if (spinning) return;

    const finalBet = Number(manualBet || bet);
    const error = validateBet(finalBet);

    if (error) {
      alert(error);
      return;
    }

    setSpinning(true);
    setMessage("");

    const deductedBalance = Number((credit - finalBet).toFixed(2));
    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    let animationCount = 0;

    const anim = setInterval(() => {
      const temp = Array.from({ length: 5 }, () => getRandomSymbol().icon);
      setReels(temp);

      animationCount += 1;
      if (animationCount > 18) {
        clearInterval(anim);
      }
    }, 120);

    setTimeout(async () => {
      const finalSymbols = randomReels();
      setReels(finalSymbols.map((item) => item.icon));

      const result = calculateWin(finalSymbols, finalBet);
      const win = result.amount;
      const updatedBalance = Number((deductedBalance + win).toFixed(2));
      const outcome = win > 0 ? "won" : "lost";

      if (win > 0) {
        setCredit(updatedBalance);
        setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);
        setLastWin(win);
        setBonusWin((prev) => Number((prev + win).toFixed(2)));
        setMessage(`YOU WIN ${formatMoney(win)} ${currency} • ${result.label}`);
      } else {
        setCredit(deductedBalance);
        setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
        setLastWin(0);
        setMessage("YOU LOST");
      }

      setBalances((prev) => ({
        ...prev,
        [currency]: updatedBalance
      }));

      try {
        const username = localStorage.getItem("username");
        if (username) {
          const q = query(collection(db, "users"), where("username", "==", username));
          const snapshot = await getDocs(q);
          const balanceField = getCurrencyBalanceField(currency);

          for (const docSnap of snapshot.docs) {
            const userRef = doc(db, "users", docSnap.id);
            await updateDoc(userRef, {
              [balanceField]: updatedBalance
            });
          }
        }
      } catch (err) {
        console.log("Error updating balance:", err);
      }

      try {
        await addDoc(collection(secondaryDb, "casinos"), {
          game: "slotMachine",
          username: localStorage.getItem("username") || "guest",
          currency,
          bet: finalBet,
          reels: finalSymbols.map((item) => item.id),
          reelsIcons: finalSymbols.map((item) => item.icon),
          winAmount: win,
          outcome,
          message: result.label,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.log("Error saving slot result:", err);
      }

      setSpinning(false);
    }, 2500);
  };

  return (
    <div className="slot-page">
      <div className="slot-top">
        <div className="slot-top-box red-box">
          <p>BONUS WIN</p>
          <h2>{formatMoney(bonusWin)} {currency}</h2>
        </div>

        <div className="slot-top-center">
          <h1>Red Fate 5</h1>
          <span>Slot Machine</span>
        </div>

        <div className="slot-top-box blue-box">
          <p>BALANCE</p>
          <h2>{displayBalance}</h2>
        </div>
      </div>

      <div className="slot-machine">
        <div className="slot-header-row">
          <div>
            <span className="small-label">BALANCE</span>
            <h3>{displayBalance}</h3>
          </div>

          <div className="slot-message-box">
            {spinning ? "Spinning..." : message || "Place your bet"}
          </div>

          <div>
            <span className="small-label">LAST WIN</span>
            <h3>{formatMoney(lastWin)} {currency}</h3>
          </div>
        </div>

        <div className="reels-wrap">
          {reels.map((symbol, i) => (
            <div key={i} className={`reel ${spinning ? "spinning" : ""}`}>
              <span>{symbol}</span>
            </div>
          ))}
        </div>

        <div className="bet-buttons">
          {currentButtons.map((b) => (
            <button
              key={b}
              className={Number(manualBet) === Number(b) ? "active" : ""}
              onClick={() => {
                setBet(b);
                setManualBet(b);
              }}
              disabled={spinning}
            >
              <small>BET</small>
              <strong>{b}</strong>
              <span>{currency}</span>
            </button>
          ))}
        </div>

        <div className="manual-bet-box">
          <input
            type="number"
            min={currentMinBet}
            value={manualBet}
            onChange={(e) => setManualBet(Number(e.target.value))}
            placeholder={`Min ${currentMinBet} ${currency}`}
            disabled={spinning}
          />
        </div>

        <div className="slot-actions">
          <button className="bonus-btn" disabled={spinning}>
            BUY BONUS
          </button>

          <button className="spin-btn" onClick={spin} disabled={spinning}>
            {spinning
              ? "SPINNING..."
              : `SPIN ${formatMoney(manualBet)} ${currency}`}
          </button>

          <button className="wild-btn" disabled={spinning}>
            ACTIVATE WILD
          </button>
        </div>

        <div className="slot-footer-bar">
          <span>Total Bet: {formatMoney(manualBet)} {currency}</span>
          <span>Total Win: {formatMoney(lastWin)} {currency}</span>
        </div>
      </div>
    </div>
  );
}