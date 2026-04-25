import { useEffect, useState } from "react";
import "./MinesGames.css";

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

export default function MinesGame() {
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

  const STEP_BETS = {
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

  const GRID_SIZE = 25;
  const TOTAL_MINES = 8;

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);

  const [mines, setMines] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [clickedMine, setClickedMine] = useState(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const currentMinBet = MIN_BETS[currency] || 0;
  const currentStep = STEP_BETS[currency] || currentMinBet;

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
      const balanceField = getCurrencyBalanceField(currency);

      for (const item of snapshot.docs) {
        await updateDoc(doc(db, "users", item.id), {
          [balanceField]: Number(newBalance)
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveHistory = async (payload) => {
    try {
      await addDoc(collection(secondaryDb, "casinos"), {
        game: "minesGame",
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

  const generateMines = () => {
    const picked = [];
    while (picked.length < TOTAL_MINES) {
      const rand = Math.floor(Math.random() * GRID_SIZE);
      if (!picked.includes(rand)) picked.push(rand);
    }
    return picked;
  };

  const startGame = async () => {
    const error = validateBet(bet);
    if (error) {
      alert(error);
      return;
    }

    const usedBet = Number(bet);
    const newBalance = Number((credit - usedBet).toFixed(2));

    setCredit(newBalance);
    setDisplayBalance(`${formatMoney(newBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: newBalance
    }));

    await updateUserBalance(newBalance);

    setMines(generateMines());
    setRevealed([]);
    setClickedMine(null);
    setGameStarted(true);
    setGameOver(false);
    setMessage("Game started");
  };

  const openTile = async (index) => {
    if (!gameStarted || gameOver || revealed.includes(index)) return;

    if (mines.includes(index)) {
      setClickedMine(index);
      setGameStarted(false);

      setTimeout(async () => {
        setGameOver(true);
        setMessage("💣 BOOM! You lost");

        await saveHistory({
          bet: Number(bet),
          openedTiles: revealed.length,
          totalMines: TOTAL_MINES,
          winAmount: 0,
          outcome: "lost"
        });
      }, 500);

      return;
    }

    const nextRevealed = [...revealed, index];
    setRevealed(nextRevealed);

    const safeLeft = GRID_SIZE - TOTAL_MINES - nextRevealed.length;
    setMessage(`Safe tile opened. Remaining safe tiles: ${safeLeft}`);
  };

  const cashOut = async () => {
    if (!gameStarted || gameOver || revealed.length === 0) return;

    const usedBet = Number(bet);
    const profitOnly = Number((usedBet * 0.25).toFixed(2));
    const totalReturn = Number((usedBet + profitOnly).toFixed(2));
    const updatedBalance = Number((credit + totalReturn).toFixed(2));

    setCredit(updatedBalance);
    setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: updatedBalance
    }));

    await updateUserBalance(updatedBalance);

    setGameStarted(false);
    setGameOver(true);
    setMessage(`💰 You win ${formatMoney(profitOnly)} ${currency} (25%)`);

    await saveHistory({
      bet: usedBet,
      openedTiles: revealed.length,
      totalMines: TOTAL_MINES,
      winAmount: profitOnly,
      totalReturn,
      outcome: "won"
    });
  };

  const handleMinus = () => {
    if (gameStarted) return;
    setBet((prev) => Math.max(currentMinBet, Number(prev) - Number(currentStep)));
  };

  const handlePlus = () => {
    if (gameStarted) return;
    setBet((prev) => Number(prev) + Number(currentStep));
  };

  return (
    <div className="mines-page">
      <div className="mines-topbar">
        <div className="mines-box">
          <p>Balance</p>
          <h3>{displayBalance}</h3>
        </div>

        <div className="mines-box">
          <p>Profit</p>
          <h3>25%</h3>
        </div>
      </div>

      <div className="mines-bet-row">
        <button onClick={handleMinus} disabled={gameStarted}>-</button>

        <div className="mines-bet-center">
          <p>Bet Amount</p>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            disabled={gameStarted}
          />
          <small>
            Min: {formatMoney(currentMinBet)} {currency}
          </small>
        </div>

        <button onClick={handlePlus} disabled={gameStarted}>+</button>
      </div>

      <div className="mines-actions">
        {!gameStarted ? (
          <button className="start-btn" onClick={startGame}>
            START
          </button>
        ) : (
          <button className="cash-btn" onClick={cashOut}>
            CASHOUT {formatMoney(Number(bet) * 0.25)} {currency}
          </button>
        )}
      </div>

      <div className="mines-grid">
        {Array.from({ length: GRID_SIZE }).map((_, index) => {
          const isOpen = revealed.includes(index);
          const isClickedMine = clickedMine === index;
          const showAllMines = gameOver && mines.includes(index);

          return (
            <div
              key={index}
              className={`mines-tile ${isOpen ? "open" : ""} ${isClickedMine || showAllMines ? "mine" : ""}`}
              onClick={() => openTile(index)}
            >
              {!gameOver && isOpen && !mines.includes(index) && "💎"}
              {isClickedMine && "💣"}
              {gameOver && !isOpen && mines.includes(index) && "💣"}
            </div>
          );
        })}
      </div>

      <div className="mines-message">{message}</div>
    </div>
  );
}