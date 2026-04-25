import { useEffect, useMemo, useRef, useState } from "react";
import "./CasinoLuckySpin.css";

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

export default function LuckySpin() {
  const { setBalances } = useBalance();

  /* BASE MINIMUM = USDT 1 */
  const BASE_MIN_USDT = 1;
  const BASE_STEP_USDT = 1;

  /* 1 USDT = kiasi gani kwa kila currency */
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

  /* step za kuround kiasi */
  const ROUND_STEPS = {
    TZS: 100,
    USDT: 0.1,
    USD: 0.1,
    KES: 1,
    UGX: 100,
    RWF: 10,
    BIF: 10,
    ZMW: 1,
    MWK: 10,
    MZN: 1,
    SSP: 1,
    BWP: 0.5,
    MGA: 10
  };

  /* values hizi ni za base ya USDT, kisha ziconvert */
  const BASE_SEGMENTS_USDT = [
    { label: "0.05", baseUsdt: 0.05, type: "cash", color: "#11b8c9", colorKey: "cyan", weight: 8 },
    { label: "1.5", baseUsdt: 1.5, type: "cash", color: "#5f27cd", colorKey: "blue", weight: 4 },
    { label: "0.2", baseUsdt: 0.2, type: "cash", color: "#b8c415", colorKey: "lime", weight: 7 },
    { label: "2", baseUsdt: 2, type: "cash", color: "#3dcf3d", colorKey: "green", weight: 3 },
    { label: "0.6", baseUsdt: 0.6, type: "cash", color: "#16a34a", colorKey: "darkgreen", weight: 5 },
    { label: "0.3", baseUsdt: 0.3, type: "cash", color: "#65a30d", colorKey: "olive", weight: 6 },
    { label: "FREE SPIN", baseUsdt: 0, type: "free", color: "#e11d48", colorKey: "pink", weight: 2 },
    { label: "0.1", baseUsdt: 0.1, type: "cash", color: "#c026d3", colorKey: "purple", weight: 8 },
    { label: "4", baseUsdt: 4, type: "cash", color: "#0ea5e9", colorKey: "sky", weight: 2 },
    { label: "0.4", baseUsdt: 0.4, type: "cash", color: "#4f46e5", colorKey: "indigo", weight: 5 },
    { label: "1", baseUsdt: 1, type: "cash", color: "#c0ca33", colorKey: "yellowgreen", weight: 4 },
    { label: "0", baseUsdt: 0, type: "zero", color: "#f97316", colorKey: "orange", weight: 10 },
    { label: "10", baseUsdt: 10, type: "cash", color: "#e91e63", colorKey: "magenta", weight: 1 },
    { label: "0.15", baseUsdt: 0.15, type: "cash", color: "#ef4444", colorKey: "red", weight: 7 },
    { label: "15", baseUsdt: 15, type: "cash", color: "#d4a017", colorKey: "gold", weight: 1 },
    { label: "20", baseUsdt: 20, type: "cash", color: "#a21caf", colorKey: "violet", weight: 1 }
  ];

  const colorChoices = [
    { key: "red", label: "Red", hex: "#ef4444" },
    { key: "blue", label: "Blue", hex: "#5f27cd" },
    { key: "green", label: "Green", hex: "#3dcf3d" },
    { key: "orange", label: "Orange", hex: "#f97316" },
    { key: "purple", label: "Purple", hex: "#c026d3" },
    { key: "pink", label: "Pink", hex: "#e11d48" },
    { key: "cyan", label: "Cyan", hex: "#11b8c9" },
    { key: "gold", label: "Gold", hex: "#d4a017" }
  ];

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);
  const [betInput, setBetInput] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [lastWin, setLastWin] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [tickerText, setTickerText] = useState("");
  const [selectedColor, setSelectedColor] = useState("red");

  const autoSpinRef = useRef(false);
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
      value: item.type === "cash" ? convertFromUSDT(item.baseUsdt, currency) : 0,
      displayLabel:
        item.type === "cash"
          ? formatMoney(convertFromUSDT(item.baseUsdt, currency))
          : item.label
    }));
  }, [currency]);

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

        setBet((prev) => {
          const newBet = prev === 0 ? min : prev < min ? min : prev;
          setBetInput(String(newBet));
          return newBet;
        });
      }
    });

    return () => unsubscribe();
  }, [setBalances]);

  useEffect(() => {
    const names = [
      "Alex", "John", "Victor", "Musa", "Ali", "James", "Samuel",
      "David", "Peter", "Kelvin", "Brian", "Asha", "Neema", "Zawadi"
    ];

    const fakeWinUsdt = [0.2, 0.3, 0.5, 1, 2, 3, 5];

    const interval = setInterval(() => {
      const pickedName = names[Math.floor(Math.random() * names.length)];
      const maskedName = `${pickedName[0]}****${pickedName[pickedName.length - 1]}`;
      const pickedBase = fakeWinUsdt[Math.floor(Math.random() * fakeWinUsdt.length)];
      const convertedPrize = convertFromUSDT(pickedBase, currency);

      setTickerText(
        `${maskedName} just won ${formatMoney(convertedPrize)} ${currency} on Lucky Spin`
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [currency]);

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

    if (!selectedColor) {
      return "Choose color first";
    }

    if (!finalBet || finalBet <= 0) {
      return `Minimum bet is ${formatMoney(currentMinBet)} ${currency}`;
    }

    if (finalBet < currentMinBet) {
      return `Minimum bet is ${formatMoney(currentMinBet)} ${currency}`;
    }

    if (finalBet > credit && freeSpins <= 0) {
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
      await addDoc(collection(secondaryDb, "casinos"), {
        game: "luckySpin",
        username: localStorage.getItem("username") || "guest",
        currency,
        timestamp: serverTimestamp(),
        ...spinData
      });
    } catch (err) {
      console.log("Error saving lucky spin:", err);
    }
  };

  const handleMinus = () => {
    if (spinning) return;
    const newBet = Math.max(currentMinBet, Number((bet - currentStep).toFixed(2)));
    setBet(newBet);
    setBetInput(String(newBet));
  };

  const handlePlus = () => {
    if (spinning) return;
    const newBet = Number((bet + currentStep).toFixed(2));
    setBet(newBet);
    setBetInput(String(newBet));
  };

  const handleMaxBet = () => {
    if (spinning) return;
    const newBet = Number(credit || currentMinBet);
    setBet(newBet);
    setBetInput(String(newBet));
  };

  const handleBetInputChange = (e) => {
    const value = e.target.value;
    setBetInput(value);

    if (value === "") return;

    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setBet(numericValue);
    }
  };

  const handleBetInputBlur = () => {
    let numericValue = Number(betInput || 0);

    if (!numericValue || numericValue < currentMinBet) {
      numericValue = currentMinBet;
    }

    numericValue = Number(numericValue.toFixed(2));

    setBet(numericValue);
    setBetInput(String(numericValue));
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

    const usingFreeSpin = freeSpins > 0;
    let deductedBalance = credit;

    if (usingFreeSpin) {
      setFreeSpins((prev) => prev - 1);
    } else {
      deductedBalance = Number((credit - usedBet).toFixed(2));
      setCredit(deductedBalance);
      setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
      setBalances((prev) => ({
        ...prev,
        [currency]: deductedBalance
      }));
    }

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

      const colorMatched = wonSegment.colorKey === selectedColor;

      if (colorMatched) {
        if (wonSegment.type === "cash" && wonSegment.value > 0) {
          winAmount = Number(wonSegment.value);
          updatedBalance = Number((deductedBalance + winAmount).toFixed(2));
          resultMessage = `YOU WIN ${formatMoney(winAmount)} ${currency}`;
          setLastWin(winAmount);
          outcome = "won";
        } else if (wonSegment.type === "free") {
          setFreeSpins((prev) => prev + 1);
          resultMessage = "YOU GOT FREE SPIN";
          setLastWin(0);
          outcome = "freeSpin";
        } else {
          resultMessage = "YOU LOST";
          setLastWin(0);
          outcome = "lost";
        }
      } else {
        resultMessage = `YOU LOST • landed on ${wonSegment.colorKey.toUpperCase()}`;
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
        chosenColor: selectedColor,
        landedColor: wonSegment.colorKey,
        usedFreeSpin: usingFreeSpin,
        resultType: wonSegment.type,
        resultLabel: wonSegment.displayLabel,
        resultValue: wonSegment.value,
        baseUsdt: wonSegment.baseUsdt,
        minUsdtBase: BASE_MIN_USDT,
        winAmount,
        finalBalance: updatedBalance,
        outcome
      });

      setSpinning(false);

      if (autoSpinRef.current) {
        setTimeout(() => {
          startSpin();
        }, 1200);
      }
    }, 5500);
  };

  const toggleAuto = () => {
    const next = !autoSpin;
    setAutoSpin(next);
    autoSpinRef.current = next;

    if (next && !spinning) {
      startSpin();
    }
  };

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="lucky-spin-page">
      <div className="lucky-ticker">
        <span>{tickerText}</span>
      </div>

      <div className="wheel-stage">
        <div className="wheel-pointer" />

        <div
          className="lucky-wheel"
          style={{ transform: `rotate(${rotation}deg) `}}
        >
          {segments.map((segment, index) => {
            const angle = (360 / segments.length) * index;

            return (
              <div
                key={index}
                className="wheel-segment"
                style={{
                  transform: `rotate(${angle}deg) skewY(-67.5deg)`,
                  background: segment.color
                }}
              >
                <div
                  className="segment-content"
                  style={{
                    transform: "skewY(67.5deg) rotate(11.25deg)"
                  }}
                >
                  <span>{segment.displayLabel}</span>
                  <small>{segment.type === "cash" ? currency : segment.label}</small>
                </div>
              </div>
            );
          })}

          <div className="wheel-center">
            <span>LUCKY</span>
            <span>SPIN!</span>
          </div>
        </div>
      </div>

      <div className="color-picker-box">
        <p className="color-picker-title">Choose Color</p>
        <div className="color-picker-grid">
          {colorChoices.map((item) => (
            <button
              key={item.key}
              className={`color-pick-btn ${selectedColor === item.key ? "active-color" : ""}`}
              style={{ background: item.hex }}
              onClick={() => !spinning && setSelectedColor(item.key)}
              disabled={spinning}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bet-board">
        <button className="bet-adjust-btn" onClick={handleMinus} disabled={spinning}>
          −
        </button>

        <div className="bet-display-box">
          <p>Total Notes</p>

          <input
            type="number"
            className="bet-input-middle"
            value={betInput}
            onChange={handleBetInputChange}
            onBlur={handleBetInputBlur}
            disabled={spinning}
            min={currentMinBet}
            step="any"
            placeholder={`Min ${formatMoney(currentMinBet)}`}
          />

          <h2>{currency} {formatMoney(bet)}</h2>
          <strong>Chosen: {selectedColor?.toUpperCase()}</strong>
          <span>Minimum: {formatMoney(currentMinBet)} {currency}</span>
          {freeSpins > 0 && <span>Free Spins: {freeSpins}</span>}
        </div>

        <button className="bet-adjust-btn" onClick={handlePlus} disabled={spinning}>
          +
        </button>
      </div>

      <div className="lucky-actions">
        <button className="max-btn" onClick={handleMaxBet} disabled={spinning}>
          MAX BET
        </button>

        <button className="spin-main-btn" onClick={startSpin} disabled={spinning}>
          {spinning ? "SPINNING..." : "SPIN"}
        </button>

        <button
          className={`auto-btn ${autoSpin ? "active-auto" : ""}`}
          onClick={toggleAuto}
        >
          {autoSpin ? "STOP" : "AUTO"}
        </button>
      </div>

      <div className="lucky-bottom-bar">
        <div className="bottom-box">
          <p>Balance</p>
          <h3>{displayBalance}</h3>
        </div>

        <div className="bottom-box">
          <p>Last Win</p>
          <h3>{formatMoney(lastWin)} {currency}</h3>
        </div>
      </div>

      <div className="lucky-message">
        {message || "Choose color, place your bet and spin"}
      </div>
    </div>
  );
}

