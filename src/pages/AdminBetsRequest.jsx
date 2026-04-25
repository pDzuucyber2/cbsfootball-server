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

import "./AdminBetsRequest.css";

export default function AdminRequestCorrectScore() {

  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBets();
  }, []);

  async function fetchBets() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(standardDb, "correctscore"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBets(list);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  async function handleWonBet(bet) {

    if (bet.paidOut) {
      showMessage("Already paid");
      return;
    }

    try {

      const userQuery = query(
        collection(db, "users"),
        where("username", "==", bet.username)
      );

      const userSnap = await getDocs(userQuery);
      if (userSnap.empty) return;

      const userDoc = userSnap.docs[0];
      const userRef = userDoc.ref;
      const userData = userDoc.data();

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

      const field = fieldMap[bet.currency];

      await updateDoc(userRef, {
        [field]: Number(userData[field] || 0) + Number(bet.totalWin || 0)
      });

      await updateDoc(doc(standardDb, "correctscore", bet.id), {
        status: "Won",
        paidOut: true
      });

      showMessage("CorrectScore paid ✅");
      fetchBets();

    } catch (err) {
      console.error(err);
      showMessage("Error...");
    }
  }

  async function handleLost(bet) {
    await updateDoc(doc(standardDb, "correctscore", bet.id), {
      status: "Lost"
    });
    fetchBets();
  }

  async function deleteBet(id) {
    await deleteDoc(doc(standardDb, "correctscore", id));
    fetchBets();
  }

  return (
    <div>
      <h2>Correct Score Bets</h2>

      {message && <p className="success-text">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="bets-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Match</th>
              <th>Score</th>
              <th>Amount</th>
              <th>Total Win</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bets.map(bet => (
              <tr key={bet.id}>
                <td>{bet.username}</td>
                <td>{bet.teamA} vs {bet.teamB}</td>
                <td>{bet.score}</td>
                <td>{bet.amount}</td>
                <td>{bet.totalWin}</td>
                <td>{bet.currency}</td>
                <td>{bet.status || "Pending"}</td>

                <td>
                  <button onClick={() => handleWonBet(bet)}>Won</button>
                  <button onClick={() => handleLost(bet)}>Lost</button>
                  <button onClick={() => deleteBet(bet.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}