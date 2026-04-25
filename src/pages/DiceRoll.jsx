import { useEffect, useState } from "react";
import "./DiceRoll.css";

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

export default function DiceRoll() {
  const { setBalances } = useBalance();

  const MIN_BETS = {
    TZS: 2600,
    USDT: 1,
    USD: 1,
    KES: 130,
    UGX: 3800,
    RWF: 1300,
    BIF: 2900,
    ZMW: 27,
    MWK: 1700,
    MZN: 64,
    SSP: 1300,
    BWP: 14,
    MGA: 4500
  };

  const STEP_BETS = { ...MIN_BETS };

  const WIN_TARGET = 85;
  const PROFIT_PERCENT = 25;

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);

  const [rolled, setRolled] = useState(null);
  const [message, setMessage] = useState("");
  const [rolling, setRolling] = useState(false);

  const currentMinBet = MIN_BETS[currency] || 0;
  const currentStep = STEP_BETS[currency] || currentMinBet;

  const formatMoney = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const getCurrencyBalanceField = (curr) => {
    const map = {
      TZS: "tshBalance",
      USDT: "usdtBalance",
      USD: "USDBalance",
      KES: "KESBalance",
      UGX: "UGXBalance",
      RWF: "RWFBalance",
      BIF: "BIFBalance",
      ZMW: "ZMWBalance",
      MWK: "MWKBalance",
      MZN: "MZNBalance",
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
    };

    const validBalances = Object.entries(allBalances).filter(
      ([, amount]) => amount > 0
    );

    if (validBalances.length === 0) return "0.00 TZS";

    const highest = validBalances.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return `${highest[1].toFixed(2)} ${highest[0]}`;
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;

    const q = query(collection(db, "users"), where("username", "==", username));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const main = getMainBalance(userData);
        const [value, curr] = main.split(" ");

        setCredit(Number(value));
        setCurrency(curr);
        setDisplayBalance(`${formatMoney(value)} ${curr}`);
        setBalances(getAllBalancesFromUser(userData));

        const min = MIN_BETS[curr] || 0;
        setBet((prev) => (prev === 0 ? min : prev < min ? min : prev));
      }
    });

    return () => unsubscribe();
  }, [setBalances]);

  const updateUserBalance = async (newBalance) => {
    try {
      const username = localStorage.getItem("username");
      if (!username) return;

      const q = query(collection(db, "users"), where("username", "==", username));
      const snapshot = await getDocs(q);
      const field = getCurrencyBalanceField(currency);

      for (const item of snapshot.docs) {
        await updateDoc(doc(db, "users", item.id), {
          [field]: Number(newBalance)
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveHistory = async (payload) => {
    try {
      await addDoc(collection(secondaryDb, "casinos"), {
        game: "diceRoll",
        username: localStorage.getItem("username") || "guest",
        currency,
        timestamp: serverTimestamp(),
        ...payload
      });
    } catch (error) {
      console.log(error);
    }
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

  const handleMinus = () => {
    if (rolling) return;
    setBet((prev) => Math.max(currentMinBet, Number(prev) - Number(currentStep)));
  };

  const handlePlus = () => {
    if (rolling) return;
    setBet((prev) => Number(prev) + Number(currentStep));
  };

  const rollDice = async () => {
    if (rolling) return;

    const amount = Number(bet || 0);
    const error = validateBet(amount);

    if (error) {
      alert(error);
      return;
    }

    setRolling(true);
    setMessage("Rolling...");
    setRolled(null);

    const deductedBalance = Number((credit - amount).toFixed(2));
    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    await updateUserBalance(deductedBalance);

    let spinCount = 0;
    const interval = setInterval(() => {
      setRolled(Math.floor(Math.random() * 100) + 1);
      spinCount += 1;

      if (spinCount >= 12) {
        clearInterval(interval);
      }
    }, 80);

    setTimeout(async () => {
      const rolledNumber = Math.floor(Math.random() * 100) + 1;

      let updatedBalance = deductedBalance;
      let profit = 0;
      let totalReturn = 0;
      let outcome = "lost";

      if (rolledNumber >= WIN_TARGET) {
        profit = Number((amount * (PROFIT_PERCENT / 100)).toFixed(2));
        totalReturn = Number((amount + profit).toFixed(2));
        updatedBalance = Number((deductedBalance + totalReturn).toFixed(2));
        outcome = "won";
        setMessage(`🎉 You win ${formatMoney(profit)} ${currency}`);
      } else {
        setMessage("❌ You lose");
      }

      setRolled(rolledNumber);
      setCredit(updatedBalance);
      setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);
      setBalances((prev) => ({
        ...prev,
        [currency]: updatedBalance
      }));

      await updateUserBalance(updatedBalance);

      await saveHistory({
        bet: amount,
        winTarget: WIN_TARGET,
        rolledNumber,
        profitPercent: PROFIT_PERCENT,
        profit,
        totalReturn,
        winAmount: profit,
        outcome
      });

      setRolling(false);
    }, 1200);
  };

  return (
    <div className="dice-page">
      <div className="dice-top">
        <div className="dice-box">
          <p>Balance</p>
          <h3>{displayBalance}</h3>
        </div>

        <div className="dice-box">
          <p>Rolled</p>
          <h3>{rolled ?? "-"}</h3>
        </div>
      </div>

      <div className="dice-card">
        <p>Bet Amount</p>

        <div className="dice-bet-row">
          <button onClick={handleMinus} disabled={rolling}>-</button>

          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            disabled={rolling}
          />

          <button onClick={handlePlus} disabled={rolling}>+</button>
        </div>

        <div className="dice-info">
          <p>Win Target: {WIN_TARGET} - 100</p>
          <p>Minimum: {formatMoney(currentMinBet)} {currency}</p>
        </div>

        <button onClick={rollDice} disabled={rolling}>
          {rolling ? "ROLLING..." : "ROLL"}
        </button>
      </div>

      <div className="dice-message">
        {message || `Roll ${WIN_TARGET} or above to win`}
      </div>
    </div>
  );
}