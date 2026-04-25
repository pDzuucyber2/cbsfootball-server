import React, { useEffect, useState } from "react";
import "./ViewTeam.css";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";

export default function ViewTeam() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [level1, setLevel1] = useState(
    JSON.parse(localStorage.getItem("l1")) || []
  );
  const [level2, setLevel2] = useState(
    JSON.parse(localStorage.getItem("l2")) || []
  );
  const [level3, setLevel3] = useState(
    JSON.parse(localStorage.getItem("l3")) || []
  );

  const [open, setOpen] = useState(null);

  const maskUsername = (name) => {
    if (!name || name.length < 4) return name;
    return name.slice(0, 2) + "**" + name.slice(-2);
  };

  const getBalanceWithCurrency = (user) => {
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
      .map((b) => ({
        label: b.label,
        value: Number(user[b.key] || 0)
      }))
      .filter((b) => b.value > 0);

    if (valid.length === 0) return "0.00";
    return `${valid[0].value.toFixed(2)} ${valid[0].label}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "JoinDate: N/A";
    const date = new Date(timestamp.seconds * 1000);
    return `JoinDate: ${date.toLocaleDateString("en-GB")}`;
  };

  useEffect(() => {
    if (!username) return;

    const fetchTeam = async () => {
      try {
        const last = localStorage.getItem("team_time");

        if (last && Date.now() - Number(last) < 60000) {
          return;
        }

        const l1Snap = await getDocs(
          query(
            collection(db, "users"),
            where("referralBy", "==", username),
            limit(100)
          )
        );
        const l1 = l1Snap.docs.map((d) => d.data());

        let l2 = [];
        for (const user of l1) {
          if (!user.username) continue;

          const l2Snap = await getDocs(
            query(
              collection(db, "users"),
              where("referralBy", "==", user.username),
              limit(100)
            )
          );

          l2Snap.forEach((doc) => {
            l2.push(doc.data());
          });
        }

        let l3 = [];
        for (const user of l2) {
          if (!user.username) continue;

          const l3Snap = await getDocs(
            query(
              collection(db, "users"),
              where("referralBy", "==", user.username),
              limit(100)
            )
          );

          l3Snap.forEach((doc) => {
            l3.push(doc.data());
          });
        }

        setLevel1(l1);
        setLevel2(l2);
        setLevel3(l3);

        localStorage.setItem("l1", JSON.stringify(l1));
        localStorage.setItem("l2", JSON.stringify(l2));
        localStorage.setItem("l3", JSON.stringify(l3));
        localStorage.setItem("team_time", Date.now().toString());
      } catch (err) {
        console.error("Failed to fetch team:", err);
      }
    };

    fetchTeam();
  }, [username]);

  const toggle = (section) => {
    setOpen(open === section ? null : section);
  };

  const renderUsers = (list) => {
    if (!list || list.length === 0) {
      return <p className="no-data">No data...</p>;
    }

    return list.map((u, i) => (
      <div key={i} className="user">
        <div className="user-top">
          👤 {maskUsername(u.username)}
        </div>

        <div className="user-balance">
          💰 {getBalanceWithCurrency(u)}
        </div>

        <div className="user-date">
          📅 {formatDate(u.createdAt)}
        </div>
      </div>
    ));
  };

  return (
    <div className="team-container">
      <div className="top-bar">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h2 className="title">Team Growth 🔥</h2>

      <div className="grid">
        <div className="card" onClick={() => toggle("l1")}>
          <p>👥 Level 1</p>
          <h1>{level1.length}</h1>
          <span className="view-text">
            {open === "l1" ? "Close View ▲" : "Open & View ▼"}
          </span>
        </div>

        <div className="card" onClick={() => toggle("l2")}>
          <p>👥 Level 2</p>
          <h1>{level2.length}</h1>
          <span className="view-text">
            {open === "l2" ? "Close View ▲" : "Open & View ▼"}
          </span>
        </div>

        <div className="card" onClick={() => toggle("l3")}>
          <p>👥 Level 3</p>
          <h1>{level3.length}</h1>
          <span className="view-text">
            {open === "l3" ? "Close View ▲" : "Open & View ▼"}
          </span>
        </div>
      </div>

      {open === "l1" && (
        <div className="details">
          <h3 className="details-title">Level 1 Members</h3>
          {renderUsers(level1)}
        </div>
      )}

      {open === "l2" && (
        <div className="details">
          <h3 className="details-title">Level 2 Members</h3>
          {renderUsers(level2)}
        </div>
      )}

      {open === "l3" && (
        <div className="details">
          <h3 className="details-title">Level 3 Members</h3>
          {renderUsers(level3)}
        </div>
      )}
    </div>
  );
}