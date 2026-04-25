import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import "./AdminCorrectScoreRequest.css";

export default function AdminCorrectScoreRequest() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMatch, setSearchMatch] = useState("");
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    fetchBets();
  }, []);

  async function fetchBets() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(standardDb, "correctscore"));

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      setBets(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const isPastMatch = (bet) => {
    const date = bet.matchTimestamp?.toDate
      ? bet.matchTimestamp.toDate()
      : new Date(`${bet.matchDate}T${bet.matchTime}`);

    return date < new Date();
  };

  // 🔥 WON SINGLE
  async function handleWonBet(bet) {

    if (bet.paidOut === true) {
      showMessage("⚠️ Tayari imelipwa");
      return;
    }

    if (!isPastMatch(bet)) {
      showMessage("⚠️ Mechi bado haijaisha");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", bet.username)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        showMessage("User not found");
        return;
      }

      const userDoc = snap.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      const userData = userDoc.data();

      const field = fieldMap[bet.currency];

      const payout = Number(bet.totalWin || 0);
      const currentBalance = Number(userData[field] || 0);

      await updateDoc(userRef, {
        [field]: currentBalance + payout
      });

      await updateDoc(doc(standardDb, "correctscore", bet.id), {
        result: "win",
        paidOut: true,
        paidAt: new Date()
      });

      fetchBets();

    } catch (err) {
      console.error(err);
      showMessage("Error");
    }
  }

  // 🔥 LOST SINGLE
  async function handleLost(bet) {
    await updateDoc(doc(standardDb, "correctscore", bet.id), {
      result: "lose"
    });

    fetchBets();
  }

  // 🔥 DELETE
  async function deleteBet(bet) {
    await deleteDoc(doc(standardDb, "correctscore", bet.id));
    fetchBets();
  }

  // 🔥 ALL WON
  async function handleAllWon() {
    const pending = bets.filter(b => !b.result);

    for (let bet of pending) {
      await handleWonBet(bet);
    }

    showMessage("✅ All bets paid");
  }

  // 🔥 ALL LOST
  async function handleAllLost() {
    const pending = bets.filter(b => !b.result);

    for (let bet of pending) {
      await handleLost(bet);
    }

    showMessage("❌ All bets marked lost");
  }

  // 🔥 FILTER (PENDING ONLY)
  const pending = bets
    .filter(bet =>
      `${bet.teamA} ${bet.teamB} ${bet.username}`
        .toLowerCase()
        .includes(searchMatch.toLowerCase())
    )
    .filter(bet => !bet.result);

  return (
    <div>

      <h2>Admin Bets (CorrectScore Only)</h2>

      <input
        placeholder="Search match / user"
        value={searchMatch}
        onChange={(e) => setSearchMatch(e.target.value)}
      />

      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
            {pending.map(bet => (
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

                <td>PENDING</td>
                <td>❌</td>

                <td>
                  <button onClick={() => handleWonBet(bet)}>Won</button>
                  <button onClick={() => handleLost(bet)}>Lost</button>
                  <button onClick={() => deleteBet(bet)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🔥 BULK ACTIONS */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={handleAllWon} style={{ background: "green", color: "white" }}>
            🟢 All Won (Pay All)
          </button>

          <button onClick={handleAllLost} style={{ background: "red", color: "white" }}>
            🔴 All Lost
          </button>
        </div>

        </>
      )}

    </div>
  );
}