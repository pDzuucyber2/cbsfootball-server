import { useEffect, useState } from "react";
import "./CardFlip.css";

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

export default function CardFlip() {
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

  const WIN_PROFIT_PERCENT = 25; // HII NDIYO YA KWELI KWENYE HESABU
  const TOTAL_CARDS = 8;
  const WINNING_CARDS = 1;

  const [currency, setCurrency] = useState("TZS");
  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [bet, setBet] = useState(0);

  const [cards, setCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [revealedIndex, setRevealedIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingPick, setLoadingPick] = useState(false);

  // asilimia ya kuonekana tu kwenye mfumo
  const [displayProfitPercent, setDisplayProfitPercent] = useState(25);

  const currentMinBet = MIN_BETS[currency] || 0;

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

  // Hii ni ya kuonyesha tu 25% hadi 100%
  useEffect(() => {
    const interval = setInterval(() => {
      const randomPercent = Math.floor(Math.random() * 76) + 25; // 25 - 100
      setDisplayProfitPercent(randomPercent);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

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
        game: "cardFlip",
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

  const makeDeck = () => {
    const deck = Array(TOTAL_CARDS).fill("lose");

    let placed = 0;
    while (placed < WINNING_CARDS) {
      const rand = Math.floor(Math.random() * TOTAL_CARDS);
      if (deck[rand] !== "win") {
        deck[rand] = "win";
        placed++;
      }
    }

    return deck;
  };

  const startGame = async () => {
    if (gameStarted || loadingPick) return;

    const amount = Number(bet || 0);
    const error = validateBet(amount);

    if (error) {
      alert(error);
      return;
    }

    const deductedBalance = Number((credit - amount).toFixed(2));

    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    await updateUserBalance(deductedBalance);

    setCards(makeDeck());
    setGameStarted(true);
    setRevealedIndex(null);
    setMessage("Pick one premium card");
  };

  const pickCard = async (index) => {
    if (!gameStarted || loadingPick || revealedIndex !== null) return;

    setLoadingPick(true);
    setRevealedIndex(index);

    const picked = cards[index];
    let updatedBalance = credit;
    let profit = 0;
    let totalReturn = 0;
    let outcome = "lost";

    // HAPA HESABU HALISI INABAKI 25% TU
    if (picked === "win") {
      profit = Number((Number(bet) * (WIN_PROFIT_PERCENT / 100)).toFixed(2));
      totalReturn = Number((Number(bet) + profit).toFixed(2));
      updatedBalance = Number((credit + totalReturn).toFixed(2));
      outcome = "won";
      setMessage(`🎉 You win ${formatMoney(profit)} ${currency}`);
    } else {
      setMessage("❌ Wrong card");
    }

    setCredit(updatedBalance);
    setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: updatedBalance
    }));

    await updateUserBalance(updatedBalance);

    await saveHistory({
      bet: Number(bet),
      pickedIndex: index,
      cardResult: picked,
      totalCards: TOTAL_CARDS,
      winningCards: WINNING_CARDS,
      shownProfitPercent: displayProfitPercent, // ya kuonekana tu
      realProfitPercent: WIN_PROFIT_PERCENT, // ya kweli
      profit,
      totalReturn,
      winAmount: profit,
      outcome
    });

    setTimeout(() => {
      setGameStarted(false);
      setLoadingPick(false);
      setCards([]);
      setRevealedIndex(null);
    }, 1800);
  };

  return (
    <div className="cardflip-page">
      <div className="cardflip-hero">
        <div className="cardflip-glow cardflip-glow-left" />
        <div className="cardflip-glow cardflip-glow-right" />

        <div className="cardflip-topbar">
          <div className="cardflip-balance-card">
            <p>Balance</p>
            <h3>{displayBalance}</h3>
          </div>

          <div className="cardflip-balance-card">
            <p>Profit</p>
            <h3>{displayProfitPercent}%</h3>
          </div>
        </div>

        <div className="cardflip-banner">
          <div className="cardflip-banner-left">
            <h2>Card Flip</h2>
            <span>High risk • low chance • {displayProfitPercent}% profit</span>
          </div>

          <div className="cardflip-banner-right">
            <div className="mini-chip">Cards {TOTAL_CARDS}</div>
            <div className="mini-chip danger">Win Cards {WINNING_CARDS}</div>
          </div>
        </div>

        <div className="cardflip-main-card">
          <div className="cardflip-bet-panel">
            <p>Enter Bet</p>

            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={gameStarted}
            />

            <small>Minimum: {formatMoney(currentMinBet)} {currency}</small>

            {!gameStarted ? (
              <button className="cardflip-start-btn" onClick={startGame}>
                START GAME
              </button>
            ) : (
              <div className="cardflip-tip">Choose 1 card only</div>
            )}
          </div>

          <div className="cardflip-cards-grid">
            {Array.from({ length: TOTAL_CARDS }).map((_, index) => {
              const revealed = revealedIndex === index;
              const isWin = cards[index] === "win";

              return (
                <div
                  key={index}
                  className={`flip-card ${revealed ? "revealed" : ""} ${
                    revealed && isWin ? "win-card" : ""
                  } ${revealed && !isWin ? "lose-card" : ""} ${
                    gameStarted ? "clickable" : ""
                  }`}
                  onClick={() => pickCard(index)}
                >
                  {!revealed ? (
                    <div className="flip-card-front">
                      <span>VIP</span>
                    </div>
                  ) : (
                    <div className="flip-card-back">
                      {isWin ? "💎" : "❌"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="cardflip-message">
          {message || "Start game and pick the correct card"}
        </div>
      </div>
    </div>
  );
}