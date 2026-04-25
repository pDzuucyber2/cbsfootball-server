import { useEffect, useState } from "react";
import "./AviatorMyBets.css";
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

  // 🔥 UNIQUE STORAGE PER USER
  const storageKey = `aviator_history_${username}`;

  // 🔥 FAST LOAD
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

        const rawData = snap.docs.map(doc => doc.data());

        // ✅ REMOVE DUPLICATES
        const uniqueMap = new Map();

        rawData.forEach(item => {
          const key = `${item.username}_${item.timestamp?.seconds}_${item.bet}`;
          uniqueMap.set(key, item);
        });

        const newData = Array.from(uniqueMap.values());

        // 🔥 SORT (NEWEST FIRST)
        newData.sort((a, b) => {
          return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
        });

        // 🔥 COMPARE WITH LOCAL STORAGE
        const oldData =
          JSON.parse(localStorage.getItem(storageKey)) || [];

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

  }, [username]);

  return (
    <div className="mybets-container">

      {/* 🔙 BACK */}
      <div className="top-bar">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h2 className="title">🎮 My Aviator History</h2>

      {bets.length === 0 ? (
        <p className="no-data">No history...</p>
      ) : (
        bets.map((b, i) => {

          const isWin = b.outcome === "won";

          // 🔥 FIX AMOUNT (WIN & LOSS FROM winAmount)
          const amount = Number(b.winAmount || 0);

          return (
            <div
              key={i}
              className={`bet-row ${isWin ? "win-bg" : "loss-bg"}`}
            >

              {/* USER */}
              <span>👤 {b.username}</span>

              {/* BET */}
              <span>{Number(b.bet || 0).toFixed(2)} TZS</span>

              {/* RESULT */}
              <span className={isWin ? "win" : "loss"}>
                {isWin
                  ? `+${amount.toFixed(2)}`
                  : `-${Math.abs(amount).toFixed(2)}`
                }
              </span>

            </div>
          );
        })
      )}

    </div>
  );
}