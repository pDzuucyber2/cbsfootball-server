import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Aviator.css";
import planeImg from "../assets/plane.png";

import { db } from "../firebase";
import { secondaryDb } from "../firebaseSecondary";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

import { useBalance } from "../context/BalanceContext";

export default function AviatorGame() {
  const navigate = useNavigate();
  const { balances, setBalances } = useBalance();

  const [balance, setBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [currency, setCurrency] = useState("TZS");

  const [bet, setBet] = useState("");
  const [betError, setBetError] = useState("");
  const [currentBet, setCurrentBet] = useState(0);

  const [multiplier, setMultiplier] = useState(1);
  const [running, setRunning] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);

  const [players, setPlayers] = useState(0);
  const [allPlayers, setAllPlayers] = useState([]);
  const [visiblePlayers, setVisiblePlayers] = useState(20);

  const [oddsHistory, setOddsHistory] = useState([]);

  const crashPoint = useRef(0);
  const intervalRef = useRef(null);
  const planeRef = useRef(null);
  const endedRef = useRef(false);

  const MIN_BETS = {
    TZS: 2600,
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

  const SHORTCUTS = {
    TZS: [2600, 5000, 10000, 20000, 50000],
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

  const currentMinBet = MIN_BETS[currency] || 0;
  const currentShortcuts = SHORTCUTS[currency] || [currentMinBet];

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

  const formatMoney = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const generateOdds = () => {
    const r = Math.random();
    let value;

    if (r < 0.8) {
      value = (Math.random() * 4 + 1).toFixed(2);
    } else if (r < 0.95) {
      value = (Math.random() * 5 + 5).toFixed(2);
    } else {
      value = (Math.random() * 20 + 10).toFixed(2);
    }

    return parseFloat(value);
  };

  useEffect(() => {
    const oddsInterval = setInterval(() => {
      setOddsHistory((prev) => {
        const newOdd = generateOdds();
        const updated = [newOdd, ...prev];
        return updated.length > 500 ? updated.slice(0, 500) : updated;
      });
    }, 2000);

    return () => clearInterval(oddsInterval);
  }, []);

  const generateCrash = () => {
    const r = Math.random();

    if (r < 0.6) return Number((Math.random() * 1 + 1).toFixed(2));
    if (r < 0.85) return Number((Math.random() * 3 + 2).toFixed(2));
    if (r < 0.97) return Number((Math.random() * 5 + 5).toFixed(2));

    return Number((Math.random() * 20 + 10).toFixed(2));
  };

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

    if (validBalances.length === 0) {
      return "0.00 TZS";
    }

    const highest = validBalances.reduce((max, current) => {
      return current[1] > max[1] ? current : max;
    });

    return `${highest[1].toFixed(2)} ${highest[0]}`;
  };

  const validateBet = (amount) => {
    const numericBet = Number(amount);

    if (!numericBet || numericBet <= 0) {
      return `Min bet is ${currentMinBet} ${currency}`;
    }

    if (numericBet < currentMinBet) {
      return `Min bet is ${currentMinBet} ${currency}`;
    }

    if (numericBet > balance) {
      return "Insufficient balance";
    }

    return "";
  };

  const handleBetChange = (value) => {
    setBet(value);

    if (value === "") {
      setBetError("");
      return;
    }

    setBetError(validateBet(value));
  };

  const handleShortcutClick = (amount) => {
    setBet(amount);
    setBetError("");
  };

  const resetPlane = () => {
    setMultiplier(1);
    endedRef.current = false;

    if (planeRef.current) {
      planeRef.current.style.transform = "translate(0px,0px)";
    }

    setRunning(false);
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

        setBalance(Number(value));
        setCurrency(curr);
        setDisplayBalance(`${Number(value).toFixed(2)} ${curr}`);

        setBalances(getAllBalancesFromUser(data));
      }
    });

    return () => unsubscribe();
  }, [setBalances]);

  const generatePlayer = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";

    const first = letters[Math.floor(Math.random() * letters.length)];
    const last =
      Math.random() > 0.5
        ? letters[Math.floor(Math.random() * letters.length)]
        : Math.floor(Math.random() * 9);

    const betAmount = (Math.random() * 12000 + 2000).toFixed(2);

    return {
      user: `${first}*****${last}`,
      bet: betAmount
    };
  };

  useEffect(() => {
    if (!running) {
      setPlayers(0);
      setAllPlayers([]);
      return;
    }

    const playersInterval = setInterval(() => {
      setPlayers((prev) => prev + Math.floor(Math.random() * 80) + 30);

      setAllPlayers((prev) => {
        let updated = [...prev];

        for (let i = 0; i < 5; i++) {
          updated.unshift(generatePlayer());
        }

        if (updated.length > 200) {
          updated = updated.slice(0, 200);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(playersInterval);
  }, [running]);

  useEffect(() => {
    if (!planeRef.current) return;

    const x = multiplier * 30;
    const y = multiplier * 18;

    planeRef.current.style.transform = `translate(${x}px,-${y}px)`;
  }, [multiplier]);

  const liveCashoutValue =
    running && Number(currentBet) > 0
      ? Number(((Number(currentBet) * Number(multiplier)) / 100).toFixed(2))
      : 0;

  const startRound = () => {
    if (running) return;

    const numericBet = Number(bet);
    const error = validateBet(numericBet);

    if (error) {
      setBetError(error);
      return;
    }

    endedRef.current = false;

    setRunning(true);
    setMultiplier(1);
    setCashedOut(false);
    setCurrentBet(numericBet);
    setBetError("");

    crashPoint.current = generateCrash();

    intervalRef.current = setInterval(() => {
      setMultiplier((prev) => {
        let increment;

        if (prev < 2) {
          increment = 0.01;
        } else if (prev < 5) {
          increment = 0.02;
        } else {
          increment = 0.05;
        }

        const next = Number((prev + increment).toFixed(2));

        if (!cashedOut) {
          const profitPreview = parseFloat(
            ((numericBet * next) / 100).toFixed(2)
          );
          setDisplayBalance(`${(balance + profitPreview).toFixed(2)} ${currency}`);
        }

        if (next >= crashPoint.current) {
          clearInterval(intervalRef.current);

          if (!endedRef.current) {
            endedRef.current = true;

            const lossAmount = parseFloat(
              ((numericBet * crashPoint.current) / 100).toFixed(2)
            );
            const newBalance = balance - lossAmount;

            setBalance(newBalance);
            setDisplayBalance(`${newBalance.toFixed(2)} ${currency}`);

            setBalances((prevBalances) => ({
              ...prevBalances,
              [currency]: newBalance
            }));

            endRound(false, -lossAmount, newBalance, numericBet, crashPoint.current);
          }

          setTimeout(() => resetPlane(), 1500);
          return prev;
        }

        return next;
      });
    }, 100);
  };

  const cashOut = () => {
    if (!running || endedRef.current) return;

    const numericBet = Number(currentBet || bet);

    endedRef.current = true;
    clearInterval(intervalRef.current);

    const profit = parseFloat(((numericBet * multiplier) / 100).toFixed(2));
    const newBalance = balance + profit;

    setBalance(newBalance);
    setDisplayBalance(`${newBalance.toFixed(2)} ${currency}`);
    setCashedOut(true);

    setBalances((prevBalances) => ({
      ...prevBalances,
      [currency]: newBalance
    }));

    endRound(true, profit, newBalance, numericBet, crashPoint.current);

    setTimeout(() => resetPlane(), 1500);
  };

  const endRound = async (
    won,
    winAmount = 0,
    finalBalance,
    usedBet = 0,
    usedCrashPoint = 0
  ) => {
    const username = localStorage.getItem("username");

    if (endedRef.current === "saved") return;
    endedRef.current = "saved";

    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const snapshot = await getDocs(q);

      const balanceField = getCurrencyBalanceField(currency);

      for (const docSnap of snapshot.docs) {
        await updateDoc(doc(db, "users", docSnap.id), {
          [balanceField]: finalBalance
        });
      }
    } catch (e) {
      console.log(e);
    }

    try {
      await addDoc(collection(secondaryDb, "aviators"), {
        game: "aviator",
        username,
        currency,
        bet: usedBet,
        multiplier,
        winAmount,
        outcome: won ? "won" : "lost",
        crashPoint: usedCrashPoint,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.log(e);
    }

    setCurrentBet(0);
    setCashedOut(false);
  };

  return (
    <div className="aviator">
      <div className="odds-bar">
        {oddsHistory.slice(0, 20).map((odd, index) => (
          <span key={index} className="odd">
            {odd}x
          </span>
        ))}
      </div>

      <div className="top">
        <div>
          BALANCE
          <h2>{displayBalance}</h2>
        </div>

        <div className="title">AVIATOR CONTRABET</div>

        <div>
          CRASH
          <h2>{running ? multiplier.toFixed(2) + "x" : "WAIT"}</h2>
        </div>
      </div>

      <div className="plane-area">
        <div className="multiplier">{multiplier.toFixed(2)}x</div>
        <img ref={planeRef} src={planeImg} className="plane" alt="plane" />
        <div className="graph"></div>

        {running && <div className="players-box">👤 {players}</div>}
      </div>

      <div className="bet-input-box">
        <input
          type="number"
          placeholder={`Min ${currentMinBet} ${currency}`}
          value={bet}
          onChange={(e) => handleBetChange(e.target.value)}
          className="bet-input"
          min={currentMinBet}
        />

        {betError && <div className="bet-error">{betError}</div>}
      </div>

      <div className="bet-shortcuts">
        {currentShortcuts.map((amount, i) => (
          <button
            key={i}
            onClick={() => handleShortcutClick(amount)}
            className="shortcut-btn"
          >
            {amount} {currency}
          </button>
        ))}
      </div>

      <div className="bet-panel">
        <button className="bet-btn-large" onClick={startRound}>
          BUY {bet || 0} {currency}
        </button>
      </div>

      <div className="bet-panel">
        <button className="bet-btn-large" onClick={cashOut}>
          {running
            ? `CASHOUT ${formatMoney(liveCashoutValue)} ${currency}`
            : "CASHOUT"}
        </button>
      </div>

      <div className="players-table">
        <div className="table-header">
          <span>User</span>
          <span>Bet</span>
          <span>Collect</span>
          <span>Win</span>
        </div>

        {allPlayers.slice(0, visiblePlayers).map((p, index) => (
          <div key={index} className="table-row">
            <span>{p.user}</span>
            <span>
              {p.bet} {currency}
            </span>
            <span>--</span>
            <span>--</span>
          </div>
        ))}
      </div>

      <div className="aviator-tabs">
        <span className="active">Players</span>
        <span onClick={() => navigate("/aviator-history")}>History</span>
        <span onClick={() => navigate("/aviator-my-bets")}>My Bets</span>
        <span>Chat</span>
        <span>Statistics</span>
      </div>
    </div>
  );
}