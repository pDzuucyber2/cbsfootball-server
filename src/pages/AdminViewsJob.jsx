import React, { useEffect, useState } from "react";
import { standardDb } from "../firebaseStandard";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import "./AdminViewsJob.css";

export default function AdminResultsFull() {

  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 LOAD DATA
  const loadData = async () => {
    try {

      const antSnap = await getDocs(collection(standardDb, "antscore"));
      const correctSnap = await getDocs(collection(standardDb, "correctscore"));

      const ant = antSnap.docs.map(d => ({
        id: d.id,
        collection: "antscore",
        type: "ANT",
        ...d.data()
      }));

      const correct = correctSnap.docs.map(d => ({
        id: d.id,
        collection: "correctscore",
        type: "CORRECT",
        ...d.data()
      }));

      setBets([...ant, ...correct]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FORMAT TIME
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  // 🔥 DATE CHECK
  const getDayType = (timestamp) => {
    if (!timestamp) return "old";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (sameDay(date, today)) return "today";
    if (sameDay(date, yesterday)) return "yesterday";

    return "old";
  };

  // 🔥 DELETE
  const deleteBet = async (bet) => {
    if (!window.confirm("Delete this bet?")) return;

    await deleteDoc(doc(standardDb, bet.collection, bet.id));
    loadData();
  };

  // 🔥 FILTER
  const filterData = (result, day) => {
    return bets
      .filter(b =>
        `${b.username} ${b.teamA} ${b.teamB}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter(b => b.result === result)
      .filter(b => getDayType(b.createdAt) === day);
  };

  // 🔥 FILTER PENDING (NEW)
  const filterPending = (day) => {
    return bets
      .filter(b =>
        `${b.username} ${b.teamA} ${b.teamB}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter(b => !b.result || b.result === "pending")
      .filter(b => getDayType(b.createdAt) === day);
  };

  // 🔥 DATA
  const wonToday = filterData("win", "today");
  const wonYesterday = filterData("win", "yesterday");

  const lostToday = filterData("lose", "today");
  const lostYesterday = filterData("lose", "yesterday");

  const pendingToday = filterPending("today");
  const pendingYesterday = filterPending("yesterday");

  // 🔥 TABLE COMPONENT
  const Table = ({ title, data }) => (
    <div className="table-box">

      <h3>{title} ({data.length})</h3>

      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Bet ID</th>
            <th>Type</th>
            <th>Match</th>
            <th>League</th>
            <th>Match Date</th>
            <th>Match Time</th>
            <th>Match Timestamp</th>
            <th>Bet Time</th>
            <th>Score</th>
            <th>Odds</th>
            <th>Amount</th>
            <th>TotalWin</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Paid</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map(bet => (
            <tr key={bet.id}>
              <td>{bet.username}</td>
              <td>{bet.betId}</td>
              <td>{bet.type}</td>

              <td>{bet.teamA} vs {bet.teamB}</td>

              <td>{bet.league}</td>
              <td>{bet.matchDate}</td>
              <td>{bet.matchTime}</td>

              <td>{formatDateTime(bet.matchTimestamp)}</td>
              <td>{formatDateTime(bet.createdAt)}</td>

              <td>{bet.score}</td>
              <td>{bet.odds}</td>
              <td>{bet.amount}</td>
              <td>{bet.totalWin}</td>
              <td>{bet.currency}</td>

              <td
                className={
                  bet.result === "win"
                    ? "status-win"
                    : bet.result === "lose"
                    ? "status-lost"
                    : "status-pending"
                }
              >
                {bet.result || "PENDING"}
              </td>

              <td>{bet.paidOut ? "✔️" : "❌"}</td>

              <td>
                <button className="delete-btn" onClick={() => deleteBet(bet)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
      </div>

    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-full">

      <h2>📊 Admin Results Full View</h2>

      <input
        placeholder="Search user or match"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🟡 PENDING */}
      <Table title="🟡 Pending Today" data={pendingToday} />
      <Table title="🟡 Pending Yesterday" data={pendingYesterday} />

      {/* 🟢 WON */}
      <Table title="🟢 Won Today" data={wonToday} />
      <Table title="🟢 Won Yesterday" data={wonYesterday} />

      {/* 🔴 LOST */}
      <Table title="🔴 Lost Today" data={lostToday} />
      <Table title="🔴 Lost Yesterday" data={lostYesterday} />

    </div>
  );
}