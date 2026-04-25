

import React, { useEffect, useState } from "react";
import "./NewRegister.css";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function NewMembersToday() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [l1, setL1] = useState([]);
  const [l2, setL2] = useState([]);
  const [l3, setL3] = useState([]);
  const [open, setOpen] = useState(null);

  const isToday = (timestamp) => {
    if (!timestamp?.seconds) return false;

    const today = new Date();
    const date = new Date(timestamp.seconds * 1000);

    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const maskUsername = (name) => {
    if (!name) return "Unknown";
    if (name.length < 4) return name;
    return name.slice(0, 2) + "**" + name.slice(-2);
  };

  useEffect(() => {
    if (!username) return;

    const fetchTodayMembers = async () => {
      try {
        // LEVEL 1
        const l1Snap = await getDocs(
          query(collection(db, "users"), where("referralBy", "==", username))
        );

        const allLevel1 = l1Snap.docs.map((d) => d.data());
        const level1 = allLevel1.filter((u) => isToday(u.createdAt));

        // LEVEL 2
        let rawLevel2 = [];
        for (const u of allLevel1) {
          if (!u.username) continue;

          const snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", u.username))
          );

          snap.forEach((doc) => {
            rawLevel2.push(doc.data());
          });
        }
        const level2 = rawLevel2.filter((u) => isToday(u.createdAt));

        // LEVEL 3
        let rawLevel3 = [];
        for (const u of rawLevel2) {
          if (!u.username) continue;

          const snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", u.username))
          );

          snap.forEach((doc) => {
            rawLevel3.push(doc.data());
          });
        }
        const level3 = rawLevel3.filter((u) => isToday(u.createdAt));

        setL1(level1);
        setL2(level2);
        setL3(level3);
      } catch (err) {
        console.error("Failed to fetch today's members:", err);
      }
    };

    fetchTodayMembers();
  }, [username]);

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  const renderUsers = (list) => {
    if (!list.length) {
      return <p className="no-data">No new users today</p>;
    }

    return list.map((u, i) => (
      <div key={i} className="user">
        <span>👤 {maskUsername(u.username)}</span>
      </div>
    ));
  };

  return (
    <div className="today-container">
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h2 className="title">🔥 New Members Today</h2>

      <div className="grid">
        <div className="card" onClick={() => toggle("l1")}>
          <p>👥 Level 1</p>
          <h1>{l1.length}</h1>
          <span className="view-text">
            {open === "l1" ? "Close View ▲" : "Open and View ▼"}
          </span>
        </div>

        <div className="card" onClick={() => toggle("l2")}>
          <p>👥 Level 2</p>
          <h1>{l2.length}</h1>
          <span className="view-text">
            {open === "l2" ? "Close View ▲" : "Open and View ▼"}
          </span>
        </div>

        <div className="card" onClick={() => toggle("l3")}>
          <p>👥 Level 3</p>
          <h1>{l3.length}</h1>
          <span className="view-text">
            {open === "l3" ? "Close View ▲" : "Open and View ▼"}
          </span>
        </div>
      </div>

      {open === "l1" && (
        <div className="details">
          <h3 className="details-title">Level 1 Members</h3>
          {renderUsers(l1)}
        </div>
      )}

      {open === "l2" && (
        <div className="details">
          <h3 className="details-title">Level 2 Members</h3>
          {renderUsers(l2)}
        </div>
      )}

      {open === "l3" && (
        <div className="details">
          <h3 className="details-title">Level 3 Members</h3>
          {renderUsers(l3)}
        </div>
      )}
    </div>
  );
}