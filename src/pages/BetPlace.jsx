import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./BetPlace.css";

import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

import { useBalance } from "../context/BalanceContext";

const failedLogos = new Set();

const BetPlaceLoader = () => (
  <div className="betplace-loader-screen">
    <img src="/images/player.png" className="betplace-loader-bg" alt="loading" />

    <div className="betplace-loader-overlay"></div>

    <div className="betplace-loader-content">
      <div className="betplace-solar-system">
        <div className="betplace-orbit betplace-orbit-one">
          <span className="betplace-planet-ball">⚽</span>
        </div>

        <div className="betplace-orbit betplace-orbit-two">
          <span className="betplace-planet-ball small">⚽</span>
        </div>

        <div className="betplace-sun">
          <img src="/favicon.ico" alt="logo" />
        </div>
      </div>

      <p>Processing Bet...</p>
    </div>
  </div>
);

export default function BetPlace() {
  const { state } = useLocation();

  const match = state?.match;
  const selection = state?.selection;

  const [amount, setAmount] = useState("");
  const [correctPercent, setCorrectPercent] = useState(25);

  const { balances, setBalances } = useBalance();

  const [activeCurrency, setActiveCurrency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
       : "https://cbsfootball.onrender.com";

  const MINIMUMS = {
    TZS: 10000,
    USDT: 5,
    KES: 900,
    UGX: 25500,
    RWF: 10500,
    BIF: 21000,
    ZMW: 135,
    MWK: 14000,
    MZN: 450,
    USD: 7,
    SSP: 42500,
    BWP: 94,
    MGA: 2900,
  };

  useEffect(() => {
    if (!activeCurrency && balances) {
      const available = Object.entries(balances).filter(([_, v]) => v > 0);

      if (available.length > 0) {
        setActiveCurrency(available[0][0]);
      }
    }
  }, [balances, activeCurrency]);

  if (!match || !selection) {
    return <div className="loading">No Bet Data</div>;
  }

  const currentBalance = activeCurrency ? balances[activeCurrency] || 0 : 0;

  const isCorrectScore = selection?.mode === "correct";

  const percent = isCorrectScore
    ? correctPercent
    : Number(selection?.odds ?? 0);

  const profit =
    amount && percent ? ((Number(amount) * percent) / 100).toFixed(2) : 0;

  const totalWin =
    amount && percent
      ? (Number(amount) + Number(profit)).toFixed(2)
      : 0;

  const getQuickAmounts = () => {
    const min = MINIMUMS[activeCurrency] || 1;
    return [1, 2, 5, 10, 20, 50, 100].map((m) => min * m);
  };

  const generateBetId = () => {
    return "#" + Math.floor(100000000000 + Math.random() * 900000000000);
  };

  const getInitials = (name) => {
    if (!name) return "FC";
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const TeamLogo = ({ logo, name, side }) => {
    const [error, setError] = useState(false);

    const proxyUrl = logo
      ? `${BASE_URL}/logo?url=${encodeURIComponent(logo)}`
      : null;

    const aMissing = !match.logoA || failedLogos.has(match.logoA);
    const bMissing = !match.logoB || failedLogos.has(match.logoB);

    let bgColor = "#000";

    if (aMissing && bMissing) {
      bgColor = side === "left" ? "#000" : "#ff0000";
    }

    if (!logo || error || failedLogos.has(logo)) {
      return (
        <div className="logo-fallback" style={{ background: bgColor }}>
          {getInitials(name)}
        </div>
      );
    }

    return (
      <img
        src={proxyUrl}
        alt={name}
        className="team-logo"
        loading="lazy"
        onError={(e) => {
          if (!e.target.dataset.try1 && logo) {
            e.target.dataset.try1 = "1";
            e.target.src = logo;
          } else {
            failedLogos.add(logo);
            setError(true);
          }
        }}
      />
    );
  };

  const dateObj = new Date(match.date.replace(" ", "T") + "Z");

  const formattedDate = dateObj.toLocaleDateString("en-GB");
  const formattedTime = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const day = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const handleBet = async () => {
    if (loading) return;

    const numericAmount = Number(amount);

    if (!activeCurrency) {
      alert("Please select currency with balance");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    const min = MINIMUMS[activeCurrency] || 0;

    if (numericAmount < min) {
      alert(`Minimum bet for ${activeCurrency} is ${min}`);
      return;
    }

    if (numericAmount > currentBalance) {
      alert("Insufficient balance");
      return;
    }

    try {
      setLoading(true);
      setShowSpinner(true);

      setBalances((prev) => ({
        ...prev,
        [activeCurrency]: (prev[activeCurrency] || 0) - numericAmount,
      }));

      const username = localStorage.getItem("username");

      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("User not found");

      const userDoc = snapshot.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      const data = userDoc.data();

      const fieldMap = {
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
        MGA: "MGABalance",
      };

      const field = fieldMap[activeCurrency];

      await updateDoc(userRef, {
        [field]: Number(data[field] || 0) - numericAmount,
      });

      const matchDateObj = new Date(match.date.replace(" ", "T") + "Z");

      const betId = generateBetId();

      const betData = {
        betId,
        username,
        teamA: match.A,
        teamB: match.B,
        league: match.league,
        score: selection.score,
        odds: percent,
        amount: numericAmount,
        profit: Number(profit),
        totalWin: Number(totalWin),
        currency: activeCurrency,
        matchDate: matchDateObj.toISOString().split("T")[0],
        matchTime: matchDateObj.toTimeString().slice(0, 5),
        matchTimestamp: Timestamp.fromDate(matchDateObj),
        type: isCorrectScore ? "correctscore" : "antscore",
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(standardDb, isCorrectScore ? "correctscore" : "antscore"),
        betData
      );

      setTimeout(() => {
        setShowSpinner(false);
        alert(`Bet placed ✅\n${betId}`);
        setAmount("");
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Error placing bet");

      setBalances((prev) => ({
        ...prev,
        [activeCurrency]: (prev[activeCurrency] || 0) + numericAmount,
      }));

      setLoading(false);
      setShowSpinner(false);
    }
  };

  return (
    <div className="betplace">
      {showSpinner && <BetPlaceLoader />}

      <div className="match-box">
        <div className="teams">
          <TeamLogo logo={match.logoA} name={match.A} side="left" />
          <span>VS</span>
          <TeamLogo logo={match.logoB} name={match.B} side="right" />
        </div>

        <h2>
          {match.A} vs {match.B}
        </h2>

        <p>{match.league}</p>

        <div className="date">
          {day}, {formattedDate} - {formattedTime}
        </div>
      </div>

      <div className="selection-box">
        <div className="label">
          {isCorrectScore ? "Correct Score" : "Ant Score"}
        </div>

        <div className="selection">{selection.score}</div>

        <div className="odds">
          {isCorrectScore ? Percent: `${percent}% : Odds: ${selection.odds}`}
        </div>
      </div>

      {isCorrectScore && (
        <div className="correct-options">
          <button type="button" onClick={() => setCorrectPercent(25)}>
            25%
          </button>

          <button type="button" onClick={() => setCorrectPercent(35)}>
            35%
          </button>

          <button type="button" onClick={() => setCorrectPercent(50)}>
            50%
          </button>
        </div>
      )}

      <div className="balance-box">
        {activeCurrency || "-"} {Number(currentBalance || 0).toFixed(2)}
      </div>

      <div className="amount-box">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button type="button" onClick={() => setAmount(currentBalance)}>
          ALL
        </button>
      </div>

      <div className="quick">
        {getQuickAmounts().map((amt, i) => (
          <button type="button" key={i} onClick={() => setAmount(amt)}>
            {amt.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="win-box">
        <p>
          Profit: {profit} {activeCurrency}
        </p>

        <p>
          Total Win: {totalWin} {activeCurrency}
        </p>
      </div>

      <button className="place-btn" onClick={handleBet} disabled={loading}>
        {loading ? "Processing..." : "Place Bet"}
      </button>
    </div>
  );
}