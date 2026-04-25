import React, { useEffect, useState } from "react";
import "./ViewTeam.css";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function TeamBetsToday() {

  const username = localStorage.getItem("username");

  // 🔥 FAST LOAD (LOCAL STORAGE)
  const [totalAmount, setTotalAmount] = useState(
    JSON.parse(localStorage.getItem("team_amount")) || {}
  );

  const [totalProfit, setTotalProfit] = useState(
    JSON.parse(localStorage.getItem("team_profit")) || {}
  );

  const [pendingCount, setPendingCount] = useState(
    Number(localStorage.getItem("team_pending")) || 0
  );

  const today = new Date().toISOString().split("T")[0];

  // 🔥 FORMAT CURRENCY (GROUPED + SORTED)
  const formatCurrency = (data) => {
    const entries = Object.entries(data);

    if (entries.length === 0) return "0.0";

    const sorted = entries.sort((a, b) => b[1] - a[1]);

    if (sorted.length === 1) {
      return `${sorted[0][1].toFixed(2)} ${sorted[0][0]}`;
    }

    return `${sorted[0][1].toFixed(2)} ${sorted[0][0]} + ${sorted[1][1].toFixed(2)} ${sorted[1][0]}`;
  };

  useEffect(() => {

    if (!username) return;

    const fetchTeamBets = async () => {
      try {

        // ================= TEAM USERS =================
        const l1Snap = await getDocs(
          query(collection(db, "users"), where("referralBy", "==", username))
        );
        const l1 = l1Snap.docs.map(d => d.data().username);

        let l2 = [];
        for (let u of l1) {
          const snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", u))
          );
          snap.forEach(d => l2.push(d.data().username));
        }

        let l3 = [];
        for (let u of l2) {
          const snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", u))
          );
          snap.forEach(d => l3.push(d.data().username));
        }

        const allUsers = [...l1, ...l2, ...l3];

        if (allUsers.length === 0) return;

        // ================= FETCH BETS =================
        const betsSnap = await getDocs(collection(standardDb, "antscore"));

        let amountGrouped = {};
        let profitGrouped = {};
        let pending = 0;

        betsSnap.forEach(doc => {
          const bet = doc.data();

          if (
            allUsers.includes(bet.username) &&
            bet.matchDate === today
          ) {

            const currency = bet.currency || "USD";

            // ✅ ONLY WON BETS → TOTAL AMOUNT
            if (bet.result === "win") {

              if (!amountGrouped[currency]) amountGrouped[currency] = 0;
              amountGrouped[currency] += Number(bet.amount || 0);

              if (!profitGrouped[currency]) profitGrouped[currency] = 0;
              profitGrouped[currency] += Number(bet.profit || 0);
            }

            // ⏳ PENDING
            if (!bet.status || bet.status === "pending") {
              pending += 1;
            }
          }
        });

        // 🔥 UPDATE STATE
        setTotalAmount(amountGrouped);
        setTotalProfit(profitGrouped);
        setPendingCount(pending);

        // 🔥 SAVE LOCAL STORAGE
        localStorage.setItem("team_amount", JSON.stringify(amountGrouped));
        localStorage.setItem("team_profit", JSON.stringify(profitGrouped));
        localStorage.setItem("team_pending", pending);

      } catch (err) {
        console.error(err);
      }
    };

    fetchTeamBets();

    const interval = setInterval(fetchTeamBets, 10000);

    return () => clearInterval(interval);

  }, [username]);

  return (
    <div className="team-bets">

      <h2>🔥 Team Today Bets</h2>

      <div className="grid">

        <div className="card">
          <p>Total Amount (Won)</p>
          <h1>{formatCurrency(totalAmount)}</h1>
        </div>

        <div className="card">
          <p>Total Profit (Win)</p>
          <h1>{formatCurrency(totalProfit)}</h1>
        </div>

        <div className="card">
          <p>Pending Bets</p>
          <h1>{pendingCount}</h1>
        </div>

      </div>

    </div>
  );
}