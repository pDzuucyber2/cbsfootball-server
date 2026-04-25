
import React, { useEffect, useState } from "react";
import "./ActivePlayer.css";
import { useNavigate } from "react-router-dom"; // 🔥 ADD THIS
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function OnlineUsers() {

  const navigate = useNavigate(); // 🔥 ADD THIS

  const username = localStorage.getItem("username");

  const storageKey = `onlineTeam_${username}`;

  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  });

  // 🔥 GET AMOUNT
  const getAmount = (user) => {
    const balances = [
      { key: "tshBalance", label: "TSH" },
      { key: "usdtBalance", label: "USDT" },
      { key: "USDBalance", label: "USD" },
      { key: "KESBalance", label: "KES" },
      { key: "UGXBalance", label: "UGX" },
      { key: "RWFBalance", label: "RWF" },
      { key: "BIFBalance", label: "BIF" },
      { key: "ZMWBalance", label: "ZMW" },
      { key: "MWKBalance", label: "MWK" },
      { key: "MZNBalance", label: "MZN" },
      { key: "SSPBalance", label: "SSP" },
      { key: "BWPBalance", label: "BWP" },
      { key: "MGABalance", label: "MGA" }
    ];

    const valid = balances
      .map(b => ({
        label: b.label,
        value: Number(user[b.key] || 0)
      }))
      .filter(b => b.value > 0);

    if (valid.length === 0) return null;

    return `${valid[0].value.toFixed(2)} ${valid[0].label}`;
  };

  useEffect(() => {

    if (!username) return;

    const fetchTeam = async () => {
      try {

        const l1Snap = await getDocs(
          query(collection(db, "users"), where("referralBy", "==", username))
        );
        const l1 = l1Snap.docs.map(d => d.data());

        let l2 = [];
        for (let u of l1) {
          const snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", u.username))
          );
          snap.forEach(d => l2.push(d.data()));
        }

        let l3 = [];
        for (let u of l2) {
          const snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", u.username))
          );
          snap.forEach(d => l3.push(d.data()));
        }

        const allUsers = [...l1, ...l2, ...l3];

        const filtered = allUsers.filter(u => getAmount(u));

        const oldData = JSON.parse(localStorage.getItem(storageKey)) || [];

        if (JSON.stringify(oldData) !== JSON.stringify(filtered)) {
          setUsers(filtered);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchTeam();

    const interval = setInterval(fetchTeam, 10000);
    return () => clearInterval(interval);

  }, [username]);

  return (
    <div className="online-container">

      {/* 🔥 BACK BUTTON */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h3 className="online-title">🟢 My Online Team</h3>

      {users.length === 0 ? (
        <p className="no-data">No team with balance...</p>
      ) : (
        users.map((u, i) => (
          <div key={i} className="online-user">

            <div className="online-left">
              <span className="dot"></span>
              👤 {u.username}
            </div>

            <div className="online-amount">
              💰 {getAmount(u)}
            </div>

          </div>
        ))
      )}

    </div>
  );
}