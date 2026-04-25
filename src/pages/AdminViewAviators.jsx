import { useEffect, useState } from "react";
import "./AdminViewAviators.css";
import { secondaryDb } from "../firebaseSecondary";
import { collection, getDocs } from "firebase/firestore";

export default function AviatorAdmin() {

  const [today, setToday] = useState([]);
  const [yesterday, setYesterday] = useState([]);

  const [totalWon, setTotalWon] = useState(0);
  const [totalLost, setTotalLost] = useState(0);

  useEffect(() => {

    const fetchAll = async () => {
      try {

        const snap = await getDocs(collection(secondaryDb, "aviators"));

        const list = snap.docs.map(d => d.data());

        let won = 0;
        let lost = 0;

        const todayList = [];
        const yesterdayList = [];

        const now = new Date();

        list.forEach(item => {

          const amount = Number(item.winAmount || 0);

          // ✅ TOTAL (FIXED)
          if (item.outcome === "won") {
            won += amount;
          } else {
            lost += Math.abs(amount);
          }

          // 🔥 DATE FILTER
          const date = item.timestamp?.seconds
            ? new Date(item.timestamp.seconds * 1000)
            : null;

          if (!date) return;

          const isToday =
            date.toDateString() === now.toDateString();

          const yest = new Date();
          yest.setDate(now.getDate() - 1);

          const isYesterday =
            date.toDateString() === yest.toDateString();

          if (isToday) todayList.push(item);
          if (isYesterday) yesterdayList.push(item);

        });

        setTotalWon(won);
        setTotalLost(lost);

        setToday(todayList);
        setYesterday(yesterdayList);

      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();

  }, []);

  // 🔥 CALCULATE TOTALS (TODAY / YESTERDAY)
  const getTotals = (list) => {

    let won = 0;
    let lost = 0;

    list.forEach(item => {

      const amount = Number(item.winAmount || 0);

      if (item.outcome === "won") {
        won += amount;
      } else {
        lost += Math.abs(amount);
      }

    });

    return { won, lost };
  };

  const todayTotals = getTotals(today);
  const yesterdayTotals = getTotals(yesterday);

  return (
    <div className="admin-container">

      <h2>🔥 Aviator Admin Dashboard</h2>

      {/* 🔥 ALL TIME */}
      <div className="card total">
        <h3>ALL TIME</h3>
        <p className="won">✅ Won: {totalWon.toFixed(2)} TZS</p>
        <p className="lost">❌ Lost: {totalLost.toFixed(2)} TZS</p>
      </div>

      {/* 🔥 TODAY */}
      <div className="card today">
        <h3>📅 Today</h3>

        <p className="won">
          Won: {todayTotals.won.toFixed(2)} TZS
        </p>

        <p className="lost">
          Lost: {todayTotals.lost.toFixed(2)} TZS
        </p>

        {today.map((t, i) => (
          <div key={i} className="row">
            <span>👤 {t.username}</span>

            <span className={t.outcome === "won" ? "won" : "lost"}>
              {t.outcome === "won"
                ? `+${Number(t.winAmount).toFixed(2)}`
                : `-${Math.abs(Number(t.winAmount)).toFixed(2)}`
              }
            </span>
          </div>
        ))}

      </div>

      {/* 🔥 YESTERDAY */}
      <div className="card yesterday">
        <h3>📅 Yesterday</h3>

        <p className="won">
          Won: {yesterdayTotals.won.toFixed(2)} TZS
        </p>

        <p className="lost">
          Lost: {yesterdayTotals.lost.toFixed(2)} TZS
        </p>

        {yesterday.map((t, i) => (
          <div key={i} className="row">
            <span>👤 {t.username}</span>

            <span className={t.outcome === "won" ? "won" : "lost"}>
              {t.outcome === "won"
                ? `+${Number(t.winAmount).toFixed(2)}`
                : `-${Math.abs(Number(t.winAmount)).toFixed(2)}`
              }
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}