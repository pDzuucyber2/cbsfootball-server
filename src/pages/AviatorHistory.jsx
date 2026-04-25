import { useEffect, useState } from "react";
import "./AviatorHistory.css";
import { useNavigate } from "react-router-dom";

import { secondaryDb } from "../firebaseSecondary";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function AviatorMyBets() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const storageKey = `aviator_history_${username}`;

  const [bets, setBets] = useState(() => {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  });

  useEffect(() => {
    if (!username) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(secondaryDb, "aviators"),
          where("username", "==", username)
        );

        const snap = await getDocs(q);

        const rawData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        const uniqueMap = new Map();

        rawData.forEach((item) => {
          const key = `${item.username}_${item.timestamp?.seconds}_${item.bet}_${item.outcome}_${item.multiplier}`;
          uniqueMap.set(key, item);
        });

        const newData = Array.from(uniqueMap.values());

        newData.sort((a, b) => {
          return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
        });

        const oldData = JSON.parse(localStorage.getItem(storageKey)) || [];

        if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
          setBets(newData);
          localStorage.setItem(storageKey, JSON.stringify(newData));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();

    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [username, storageKey]);

  const totalWon = bets
    .filter((b) => b.outcome === "won")
    .reduce((sum, b) => sum + Number(b.winAmount || 0), 0);

  const totalLost = bets
    .filter((b) => b.outcome === "lost")
    .reduce((sum, b) => sum + Math.abs(Number(b.winAmount || 0)), 0);

  const totalWinCount = bets.filter((b) => b.outcome === "won").length;
  const totalLossCount = bets.filter((b) => b.outcome === "lost").length;
  const totalBets = bets.length;

  const mainCurrency =
    bets.find((b) => b.currency)?.currency || "TZS";

  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";

    try {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp.seconds * 1000);

      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "No date";
    }
  };

  return (
    <div className="mybets-container">
      <div className="top-bar">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h2 className="title">🎮 My Aviator History</h2>

      <div className="summary-grid">
        <div className="summary-card total-card">
          <span className="summary-label">Total Bets</span>
          <strong>{totalBets}</strong>
        </div>

        <div className="summary-card won-card">
          <span className="summary-label">Total Won</span>
          <strong>
            +{totalWon.toFixed(2)} {mainCurrency}
          </strong>
        </div>

        <div className="summary-card lost-card">
          <span className="summary-label">Total Lost</span>
          <strong>
            -{totalLost.toFixed(2)} {mainCurrency}
          </strong>
        </div>

        <div className="summary-card total-card">
          <span className="summary-label">Win Count</span>
          <strong>{totalWinCount}</strong>
        </div>

        <div className="summary-card total-card">
          <span className="summary-label">Loss Count</span>
          <strong>{totalLossCount}</strong>
        </div>
      </div>

      {bets.length === 0 ? (
        <p className="no-data">No history...</p>
      ) : (
        <div className="bets-list">
          {bets.map((b, i) => {
            const isWin = b.outcome === "won";
            const amount = Number(b.winAmount || 0);
            const currency = b.currency || "TZS";

            return (
              <div
                key={b.id || i}
                className={`bet-row ${isWin ? "win-bg" : "loss-bg"}`}
              >
                <div className="bet-top">
                  <span className="bet-user">👤 {b.username}</span>
                  <span className={`bet-status ${isWin ? "win" : "loss"}`}>
                    {isWin ? "WON" : "LOST"}
                  </span>
                </div>

                <div className="bet-middle">
                  <span>Bet: {Number(b.bet || 0).toFixed(2)} {currency}</span>
                  <span>
                    Multiplier: {Number(b.multiplier || 0).toFixed(2)}x
                  </span>
                </div>

                <div className="bet-middle">
                  <span>
                    Crash: {Number(b.crashPoint || 0).toFixed(2)}x
                  </span>
                  <span>{formatDate(b.timestamp)}</span>
                </div>

                <div className="bet-bottom">
                  <span className={isWin ? "win amount-text" : "loss amount-text"}>
                    {isWin
                      ? `+${amount.toFixed(2)} ${currency}`
                      : `-${Math.abs(amount).toFixed(2)} ${currency}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}