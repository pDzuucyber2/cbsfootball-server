import { useEffect, useRef, useState } from "react";
import "./CrashRocket.css";

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

export default function CrashRocket() {
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

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);

  const [multiplier, setMultiplier] = useState(1);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [currentBet, setCurrentBet] = useState(0);
  const [lastProfit, setLastProfit] = useState(0);

  const intervalRef = useRef(null);
  const crashPointRef = useRef(0);
  const cashedOutRef = useRef(false);

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

    const validBalances = Object.entries(allBalances).filter(([, amount]) => amount > 0);
    if (validBalances.length === 0) return "0.00 TZS";

    const highest = validBalances.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return`${highest[1].toFixed(2)} ${highest[0]}`;
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
        game: "crashRocket",
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

    if (!finalBet || finalBet <= 0) return `Minimum bet is ${currentMinBet} ${currency}`;
    if (finalBet < currentMinBet) return `Minimum bet is ${currentMinBet} ${currency}`;
    if (finalBet > credit) return "Insufficient balance";

    return "";
  };

  const generateCrashPoint = () => {
    const r = Math.random();

    if (r < 0.45) return Number((1 + Math.random() * 0.8).toFixed(2));
    if (r < 0.75) return Number((1.8 + Math.random() * 1.5).toFixed(2));
    if (r < 0.93) return Number((3.3 + Math.random() * 3).toFixed(2));
    return Number((6.5 + Math.random() * 8).toFixed(2));
  };

  const startRound = async () => {
    if (running) return;

    const error = validateBet(bet);
    if (error) {
      alert(error);
      return;
    }

    const usedBet = Number(bet);
    const deductedBalance = Number((credit - usedBet).toFixed(2));

    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    await updateUserBalance(deductedBalance);

    crashPointRef.current = generateCrashPoint();
    cashedOutRef.current = false;

    setCurrentBet(usedBet);
    setMultiplier(1);
    setLastProfit(0);
    setRunning(true);
    setMessage("Rocket started 🚀");

    intervalRef.current = setInterval(() => {
      setMultiplier((prev) => {
        const increase = prev < 2 ? 0.05 : prev < 4 ? 0.08 : 0.12;
        const next = Number((prev + increase).toFixed(2));

        if (next >= crashPointRef.current) {
          clearInterval(intervalRef.current);
          setRunning(false);

          if (!cashedOutRef.current) {
            setMessage(`💥 CRASHED at ${crashPointRef.current.toFixed(2)}x`);

            saveHistory({
              bet: usedBet,
              crashAt: crashPointRef.current,
              cashoutAt: null,
              profitPercent: 0,
              profitOnly: 0,
              totalReturn: 0,
              winAmount: 0,
              outcome: "lost"
            });
          }

          return crashPointRef.current;
        }

        return next;
      });
    }, 150);
  };

  const cashOut = async () => {
    if (!running || cashedOutRef.current) return;

    cashedOutRef.current = true;
    clearInterval(intervalRef.current);

    const usedBet = Number(currentBet);

    // Odds 5.00x = 5% profit
    const profitPercent = Number(multiplier);
    const profitOnly = Number(((usedBet * profitPercent) / 100).toFixed(2));
    const totalReturn = Number((usedBet + profitOnly).toFixed(2));
    const newBalance = Number((credit + totalReturn).toFixed(2));

    setLastProfit(profitOnly);
    setCredit(newBalance);
    setDisplayBalance(`${formatMoney(newBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: newBalance
    }));

    await updateUserBalance(newBalance);

    setRunning(false);
    setMessage(
      `💰 You win ${formatMoney(profitOnly)} ${currency} (${profitPercent.toFixed(2)}%)`
    );

    await saveHistory({
      bet: usedBet,
      crashAt: crashPointRef.current,
      cashoutAt: multiplier,
      profitPercent,
      profitOnly,
      totalReturn,
      winAmount: profitOnly,
      outcome: "won"
    });
  };

  const handleMinus = () => {
    if (running) return;
    setBet((prev) => Math.max(currentMinBet, Number(prev) - Number(currentStep)));
  };

  const handlePlus = () => {
    if (running) return;
    setBet((prev) => Number(prev) + Number(currentStep));
  };

  return (
    <div className="crash-page">
      <div className="crash-top">
        <div className="crash-card">
          <p>Balance</p>
          <h3>{displayBalance}</h3>
        </div>

        <div className="crash-card">
          <p>Current Odds</p>
          <h3>{multiplier.toFixed(2)}%</h3>
        </div>
      </div>

      <div className="crash-screen">
        <div className={`rocket ${running ? "fly" : ""}`}>🚀</div>
        <h1>{multiplier.toFixed(2)}%</h1>
      </div>

      <div className="crash-bet-row">
        <button onClick={handleMinus} disabled={running}>-</button>

        <div className="crash-bet-center">
          <p>Amount</p>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            disabled={running}
          />
          <small>
            Min: {formatMoney(currentMinBet)} {currency}
          </small>
        </div>

        <button onClick={handlePlus} disabled={running}>+</button>
      </div>

      <div className="crash-actions">
        <button className="start-btn" onClick={startRound} disabled={running}>
          START
        </button>

        <button className="cash-btn" onClick={cashOut} disabled={!running}>
          CASHOUT {formatMoney((currentBet * multiplier) / 100)} {currency}
        </button>
      </div>

      <div className="crash-bottom-info">
        <div className="crash-card">
          <p>Bet</p>
          <h3>{formatMoney(currentBet || bet)} {currency}</h3>
        </div>

        <div className="crash-card">
          <p>Last Profit</p>
          <h3>{formatMoney(lastProfit)} {currency}</h3>
        </div>
      </div>

      <div className="crash-message">
        {message || "Start and cash out before crash"}
      </div>
    </div>
  );
}