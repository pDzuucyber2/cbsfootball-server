import { useEffect, useMemo, useRef, useState } from "react";
import "./PlinkoGame.css";

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

export default function PlinkoGame() {
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

  // harder version
  const multipliers = [5.6, 2.1, 1.2, 0.8, 0, 0.8, 1.2, 2.1, 5.6];

  const rows = 10;
  const ballSize = 18;
  const boardWidth = 320;
  const startX = boardWidth / 2 - ballSize / 2;
  const startY = 20;
  const slotSpacing = 38;

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);

  const [message, setMessage] = useState("");
  const [dropping, setDropping] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [ballPos, setBallPos] = useState({ x: startX, y: startY });
  const [activeSlot, setActiveSlot] = useState(null);

  const animationRef = useRef(null);
  const username = localStorage.getItem("username");

  const currentMinBet = MIN_BETS[currency] || 0;
  const currentStep = STEP_BETS[currency] || currentMinBet;

  const pegs = useMemo(() => {
    const list = [];
    const centerX = boardWidth / 2;
    const rowGap = 38;
    const pegGap = 38;

    for (let r = 0; r < rows; r++) {
      const count = r + 3;
      const totalWidth = (count - 1) * pegGap;
      const startRowX = centerX - totalWidth / 2;

      for (let c = 0; c < count; c++) {
        list.push({
          x: startRowX + c * pegGap,
          y: 70 + r * rowGap
        });
      }
    }

    return list;
  }, []);

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

    return `${highest[1].toFixed(2)} ${highest[0]}`;
  };

  useEffect(() => {
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
  }, [username, setBalances]);

  const updateUserBalance = async (newBalance) => {
    try {
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
        game: "plinkoGame",
        username: username || "guest",
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
    if (dropping) return;
    setBet((prev) => Math.max(currentMinBet, Number(prev) - Number(currentStep)));
  };

  const handlePlus = () => {
    if (dropping) return;
    setBet((prev) => Number(prev) + Number(currentStep));
  };

  const getBiasedMove = (currentX) => {
    const centerX = boardWidth / 2 - ballSize / 2;
    const distance = currentX - centerX;

    // ukiwa mbali na center, chance ya kurudi center inaongezeka
    if (distance < -40) {
      return Math.random() < 0.78 ? 18 : -18;
    }

    if (distance > 40) {
      return Math.random() < 0.78 ? -18 : 18;
    }

    // ukiwa karibu na center, tunafanya ishie katikati zaidi
    const rand = Math.random();
    if (rand < 0.42) return -18;
    if (rand < 0.84) return 18;
    return 0;
  };

  const getHardSlotIndex = (xPos) => {
    const centerX = boardWidth / 2;
    const rawIndex =
      Math.round((xPos + ballSize / 2 - centerX) / slotSpacing) +
      Math.floor(multipliers.length / 2);

    let slotIndex = Math.max(0, Math.min(multipliers.length - 1, rawIndex));

    // harder chance: mara nyingi rudi center
    const hardRand = Math.random();

    if (hardRand < 0.45) slotIndex = 4; // 0x
    else if (hardRand < 0.68) slotIndex = Math.random() < 0.5 ? 3 : 5; // 0.8x
    else if (hardRand < 0.84) slotIndex = Math.random() < 0.5 ? 2 : 6; // 1.2x
    else if (hardRand < 0.96) slotIndex = Math.random() < 0.5 ? 1 : 7; // 2.1x
    else slotIndex = Math.random() < 0.5 ? 0 : 8; // 5.6x rare sana

    return slotIndex;
  };

  const handleDrop = async () => {
    if (dropping) return;

    const usedBet = Number(bet || 0);
    const error = validateBet(usedBet);

    if (error) {
      alert(error);
      return;
    }

    setDropping(true);
    setMessage("Ball dropping...");
    setLastWin(0);
    setActiveSlot(null);

    const deductedBalance = Number((credit - usedBet).toFixed(2));
    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    await updateUserBalance(deductedBalance);

    let currentX = startX;
    let currentY = startY;
    const path = [{ x: currentX, y: currentY }];

    for (let r = 0; r < rows; r++) {
      const move = getBiasedMove(currentX);
      currentX += move;
      currentY += 38;

      // boundary
      if (currentX < 0) currentX = 0;
      if (currentX > boardWidth - ballSize) currentX = boardWidth - ballSize;

      path.push({ x: currentX, y: currentY });
    }

    const slotIndex = getHardSlotIndex(currentX);
    const hitMultiplier = multipliers[slotIndex];

    let finalX =
      boardWidth / 2 -
      ballSize / 2 +
      (slotIndex - Math.floor(multipliers.length / 2)) * slotSpacing;

    if (finalX < 0) finalX = 0;
    if (finalX > boardWidth - ballSize) finalX = boardWidth - ballSize;

    path[path.length - 1] = {
      x: finalX,
      y: currentY
    };

    let step = 0;
    const animate = () => {
      if (step < path.length) {
        setBallPos(path[step]);
        step += 1;
        animationRef.current = setTimeout(animate, 180);
      } else {
        finishDrop(hitMultiplier, slotIndex, usedBet, deductedBalance);
      }
    };

    animate();
  };

  const finishDrop = async (hitMultiplier, slotIndex, usedBet, deductedBalance) => {
    const winAmount = Number((usedBet * hitMultiplier).toFixed(2));
    const profit = Number((winAmount - usedBet).toFixed(2));
    const updatedBalance = Number((deductedBalance + winAmount).toFixed(2));
    const outcome = hitMultiplier > 1 ? "won" : "lost";

    setActiveSlot(slotIndex);
    setLastWin(winAmount);
    setCredit(updatedBalance);
    setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);

    if (hitMultiplier === 0) {
      setMessage(`Ball landed on 0x • You lost everything`);
    } else if (hitMultiplier > 1) {
      setMessage(
        `Ball landed on ${hitMultiplier}x • You win ${formatMoney(winAmount)} ${currency} • Profit ${formatMoney(profit)}`
      );
    } else {
      setMessage(
        `Ball landed on ${hitMultiplier}x • You got ${formatMoney(winAmount)} ${currency} • Loss`
      );
    }

    setBalances((prev) => ({
      ...prev,
      [currency]: updatedBalance
    }));

    await updateUserBalance(updatedBalance);

    await saveHistory({
      bet: usedBet,
      multiplier: hitMultiplier,
      slotIndex,
      winAmount,
      profit,
      finalBalance: updatedBalance,
      outcome
    });

    setDropping(false);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="plinko-page">
      <div className="plinko-top">
        <div className="plinko-box">
          <p>Balance</p>
          <h3>{displayBalance}</h3>
        </div>

        <div className="plinko-box">
          <p>Last Win</p>
          <h3>{formatMoney(lastWin)} {currency}</h3>
        </div>
      </div>

      <div className="plinko-stage">
        <div className="plinko-side left-side">x1000</div>
        <div className="plinko-side right-side">x1000</div>

        <div className="plinko-board" style={{ width: `${boardWidth}px` }}>
          <div className="plinko-dropper" />

          {pegs.map((peg, index) => (
            <div
              key={index}
              className="peg"
              style={{ left: peg.x, top: peg.y }}
            />
          ))}

          <div
            className="plinko-ball"
            style={{
              left: `${ballPos.x}px`,
              top: `${ballPos.y}px`
            }}
          />

          <div className="slots-row">
            {multipliers.map((multi, index) => (
              <div
                key={index}
                className={`slot-box ${activeSlot === index ? "active-slot" : ""}`}
              >
                {multi}x
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="plinko-controls">
        <button onClick={handleMinus} disabled={dropping}>-</button>

        <div className="plinko-bet-box">
          <p>Bet Amount</p>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            disabled={dropping}
          />
          <small>Min: {formatMoney(currentMinBet)} {currency}</small>
        </div>

        <button onClick={handlePlus} disabled={dropping}>+</button>
      </div>

      <div className="plinko-actions">
        <button className="play-btn" onClick={handleDrop} disabled={dropping}>
          {dropping ? "PLAYING..." : "PLAY"}
        </button>
      </div>

      <div className="plinko-message">
        {message || "Drop the ball and win multipliers"}
      </div>
    </div>
  );
}
