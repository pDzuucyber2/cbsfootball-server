import { useEffect, useMemo, useRef, useState } from "react";
import "./AviatorSpin.css";

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

export default function AviatorSpin() {
  const { setBalances } = useBalance();

  const BASE_MIN_USDT = 1;
  const BASE_STEP_USDT = 1;

  const USDT_TO_CURRENCY = {
    TZS: 2600,
    USDT: 1,
    USD: 1,
    KES: 129,
    UGX: 3700,
    RWF: 1400,
    BIF: 2900,
    ZMW: 27,
    MWK: 1700,
    MZN: 64,
    SSP: 130,
    BWP: 14,
    MGA: 4600
  };

  const ROUND_STEPS = {
    TZS: 100,
    USDT: 0.1,
    USD: 0.1,
    KES: 10,
    UGX: 100,
    RWF: 100,
    BIF: 100,
    ZMW: 1,
    MWK: 100,
    MZN: 5,
    SSP: 10,
    BWP: 1,
    MGA: 100
  };

  const BASE_SEGMENTS_USDT = [
    { label: "1.10x", multiplier: 1.1, color: "#22c55e", weight: 14 },
    { label: "1.25x", multiplier: 1.25, color: "#06b6d4", weight: 12 },
    { label: "1.50x", multiplier: 1.5, color: "#3b82f6", weight: 10 },
    { label: "1.80x", multiplier: 1.8, color: "#8b5cf6", weight: 8 },
    { label: "2.00x", multiplier: 2.0, color: "#a855f7", weight: 7 },
    { label: "2.50x", multiplier: 2.5, color: "#ec4899", weight: 5 },
    { label: "3.00x", multiplier: 3.0, color: "#f97316", weight: 4 },
    { label: "4.00x", multiplier: 4.0, color: "#eab308", weight: 3 },
    { label: "5.00x", multiplier: 5.0, color: "#ef4444", weight: 2 },
    { label: "10.00x", multiplier: 10.0, color: "#14b8a6", weight: 1 }
  ];

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [lastWin, setLastWin] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState(null);
  const [tickerText, setTickerText] = useState("");

  const spinTimeoutRef = useRef(null);

  const formatMoney = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const roundByCurrency = (amount, curr) => {
    const step = ROUND_STEPS[curr] || 1;
    return Number((Math.ceil(amount / step) * step).toFixed(2));
  };

  const convertFromUSDT = (amountUsdt, curr) => {
    const rate = USDT_TO_CURRENCY[curr] || 1;
    return roundByCurrency(amountUsdt * rate, curr);
  };

  const currentMinBet = useMemo(() => {
    return convertFromUSDT(BASE_MIN_USDT, currency);
  }, [currency]);

  const currentStep = useMemo(() => {
    return convertFromUSDT(BASE_STEP_USDT, currency);
  }, [currency]);

  const segments = useMemo(() => {
    return BASE_SEGMENTS_USDT.map((item) => ({
      ...item,
      oddsText: item.label
    }));
  }, []);

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

        const min = convertFromUSDT(BASE_MIN_USDT, curr);
        setBet((prev) => (prev === 0 ? min : prev < min ? min : prev));
      }
    });

    return () => unsubscribe();
  }, [setBalances]);

  useEffect(() => {
    const names = [
      "Alex", "John", "Victor", "Musa", "Ali",
      "James", "Samuel", "David", "Peter", "Kelvin"
    ];

    const fakeOdds = ["1.10x", "1.25x", "1.50x", "2.00x", "3.00x", "5.00x"];

    const interval = setInterval(() => {
      const pickedName = names[Math.floor(Math.random() * names.length)];
      const maskedName = `${pickedName[0]}****${pickedName[pickedName.length - 1]}`;
      const pickedOdd = fakeOdds[Math.floor(Math.random() * fakeOdds.length)];

      setTickerText(`${maskedName} just won on Aviator Spin at ${pickedOdd}`);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const weightedSegments = useMemo(() => {
    const pool = [];
    segments.forEach((seg, index) => {
      for (let i = 0; i < seg.weight; i++) {
        pool.push(index);
      }
    });
    return pool;
  }, [segments]);

  const validateBet = (amount) => {
    const finalBet = Number(amount || 0);

    if (!selectedMultiplier) {
      return "Choose odds first";
    }

    if (!finalBet || finalBet <= 0) {
      return `Minimum bet is ${formatMoney(currentMinBet)} ${currency}`;
    }

    if (finalBet < currentMinBet) {
      return `Minimum bet is ${formatMoney(currentMinBet)} ${currency}`;
    }

    if (finalBet > credit) {
      return "Insufficient balance";
    }

    return "";
  };

  const updateUserBalance = async (newBalance) => {
    try {
      const username = localStorage.getItem("username");
      if (!username) return;

      const q = query(collection(db, "users"), where("username", "==", username));
      const snapshot = await getDocs(q);
      const balanceField = getCurrencyBalanceField(currency);

      for (const docSnap of snapshot.docs) {
        const userRef = doc(db, "users", docSnap.id);
        await updateDoc(userRef, {
          [balanceField]: Number(newBalance)
        });
      }
    } catch (err) {
      console.log("Error updating balance:", err);
    }
  };

  const saveSpinHistory = async (spinData) => {
    try {
      await addDoc(collection(secondaryDb, "aviatorspin"), {
        game: "aviatorSpin",
        username: localStorage.getItem("username") || "guest",
        currency,
        timestamp: serverTimestamp(),
        ...spinData
      });
    } catch (err) {
      console.log("Error saving aviator spin:", err);
    }
  };

  const handleMinus = () => {
    if (spinning) return;
    setBet((prev) => Math.max(currentMinBet, Number((prev - currentStep).toFixed(2))));
  };

  const handlePlus = () => {
    if (spinning) return;
    setBet((prev) => Number((prev + currentStep).toFixed(2)));
  };

  const handleManualBet = (value) => {
    const num = Number(value || 0);
    setBet(num);
  };

  const handleMaxBet = () => {
    if (spinning) return;
    setBet(Number(credit || currentMinBet));
  };

  const startSpin = async () => {
    if (spinning) return;

    const usedBet = Number(bet || 0);
    const error = validateBet(usedBet);

    if (error) {
      alert(error);
      return;
    }

    setSpinning(true);
    setMessage("");

    const deductedBalance = Number((credit - usedBet).toFixed(2));
    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    const winnerIndex =
      weightedSegments[Math.floor(Math.random() * weightedSegments.length)];

    const slice = 360 / segments.length;
    const targetBase = winnerIndex * slice + slice / 2;
    const finalDeg = 360 * 6 + (360 - targetBase);

    setRotation((prev) => prev + finalDeg);

    spinTimeoutRef.current = setTimeout(async () => {
      const wonSegment = segments[winnerIndex];

      let winAmount = 0;
      let resultMessage = "";
      let updatedBalance = deductedBalance;
      let outcome = "lost";

      const oddsMatched = Number(wonSegment.multiplier) === Number(selectedMultiplier);

      if (oddsMatched) {
        winAmount = Number((usedBet * wonSegment.multiplier).toFixed(2));
        updatedBalance = Number((deductedBalance + winAmount).toFixed(2));
        resultMessage = `YOU WIN ${formatMoney(winAmount)} ${currency} at ${wonSegment.oddsText}`;
        setLastWin(winAmount);
        outcome = "won";
      } else {
        resultMessage = `YOU LOST • landed on ${wonSegment.oddsText}`;
        setLastWin(0);
        outcome = "lost";
      }

      setCredit(updatedBalance);
      setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);
      setMessage(resultMessage);

      setBalances((prev) => ({
        ...prev,
        [currency]: updatedBalance
      }));

      await updateUserBalance(updatedBalance);

      await saveSpinHistory({
        bet: usedBet,
        chosenOdds: selectedMultiplier,
        landedOdds: wonSegment.multiplier,
        landedLabel: wonSegment.oddsText,
        winAmount,
        finalBalance: updatedBalance,
        outcome
      });

      setSpinning(false);
    }, 5500);
  };

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="aviator-spin-page">
      <div className="aviator-spin-ticker">
        <span>{tickerText}</span>
      </div>

      <div className="aviator-spin-stage">
        <div className="aviator-spin-pointer" />

        <div
          className="aviator-spin-wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((segment, index) => {
            const angle = (360 / segments.length) * index;

            return (
              <div
                key={index}
                className="aviator-spin-segment"
                style={{
                  transform: `rotate(${angle}deg) skewY(-54deg)`,
                  background: segment.color
                }}
              >
                <div
                  className="aviator-spin-content"
                  style={{
                    transform: "skewY(54deg) rotate(18deg)"
                  }}
                >
                  <span>{segment.oddsText}</span>
                </div>
              </div>
            );
          })}

          <div className="aviator-spin-center">
            <img src="/aviator.png" alt="aviator" className="aviator-center-plane" />
            <strong>AVIATOR</strong>
            <span>SPIN</span>
          </div>
        </div>
      </div>

      <div className="odds-picker-box">
        <p className="odds-picker-title">Choose Winning Odds</p>
        <div className="odds-picker-grid">
          {segments.map((item, index) => (
            <button
              key={index}
              className={`odds-pick-btn ${selectedMultiplier === item.multiplier ? "active-odds" : ""}`}
              onClick={() => !spinning && setSelectedMultiplier(item.multiplier)}
              disabled={spinning}
            >
              {item.oddsText}
            </button>
          ))}
        </div>
      </div>

      <div className="aviator-bet-board">
        <button className="aviator-bet-adjust-btn" onClick={handleMinus} disabled={spinning}>
          −
        </button>

        <div className="aviator-bet-display-box">
          <p>Enter Amount</p>

          <input
            type="number"
            value={bet}
            onChange={(e) => handleManualBet(e.target.value)}
            className="aviator-bet-input"
            disabled={spinning}
          />

          <h2>{currency} {formatMoney(bet)}</h2>
          <strong>Chosen Odds: {selectedMultiplier ? `${selectedMultiplier.toFixed(2)}x `: "-"}</strong>
          <span>Minimum: {formatMoney(currentMinBet)} {currency}</span>
        </div>

        <button className="aviator-bet-adjust-btn" onClick={handlePlus} disabled={spinning}>
          +
        </button>
      </div>

      <div className="aviator-actions">
        <button className="aviator-max-btn" onClick={handleMaxBet} disabled={spinning}>
          MAX BET
        </button>

        <button className="aviator-spin-main-btn" onClick={startSpin} disabled={spinning}>
          {spinning ? "SPINNING..." : "SPIN"}
        </button>
      </div>

      <div className="aviator-bottom-bar">
        <div className="aviator-bottom-box">
          <p>Balance</p>
          <h3>{displayBalance}</h3>
        </div>

        <div className="aviator-bottom-box">
          <p>Last Win</p>
          <h3>{formatMoney(lastWin)} {currency}</h3>
        </div>
      </div>

      <div className="aviator-message">
        {message || "Choose odds, place your bet and spin"}
      </div>
    </div>
  );
}