

import React, { useEffect, useState } from "react";
import "./NewWithdrawals.css";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { secondaryDb } from "../firebaseSecondary";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function TodayWithdrawal() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const storageKeyL1 = `todayWithdrawal_l1_${username}`;
  const storageKeyL2 = `todayWithdrawal_l2_${username}`;
  const storageKeyL3 = `todayWithdrawal_l3_${username}`;

  const [l1Withdrawals, setL1Withdrawals] = useState(() => {
    return JSON.parse(localStorage.getItem(storageKeyL1)) || [];
  });

  const [l2Withdrawals, setL2Withdrawals] = useState(() => {
    return JSON.parse(localStorage.getItem(storageKeyL2)) || [];
  });

  const [l3Withdrawals, setL3Withdrawals] = useState(() => {
    return JSON.parse(localStorage.getItem(storageKeyL3)) || [];
  });

  const [open, setOpen] = useState(null);

  const [loading, setLoading] = useState(() => {
    const cached1 = JSON.parse(localStorage.getItem(storageKeyL1)) || [];
    const cached2 = JSON.parse(localStorage.getItem(storageKeyL2)) || [];
    const cached3 = JSON.parse(localStorage.getItem(storageKeyL3)) || [];
    return !(cached1.length || cached2.length || cached3.length);
  });

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

  const formatAmount = (item) => {
    const amount = Number(item.amount || 0);
    const currency = item.currency || "";

    if (currency) {
      return `${amount.toLocaleString()} ${currency}`;
    }

    return amount.toLocaleString();
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return "Time: N/A";

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const normalizeWithdrawal = (doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      username: data.username || "Unknown",
      amount: Number(data.amount || 0),
      actualAmount: data.actualAmount || "",
      currency: data.currency || "",
      fee: Number(data.fee || 0),
      realName: data.realName || "",
      walletCode: data.walletCode || "",
      walletNetwork: data.walletNetwork || "",
      walletNumber: data.walletNumber || "",
      status: data.status || "",
      createdAt: data.createdAt
        ? {
            seconds: data.createdAt.seconds,
            nanoseconds: data.createdAt.nanoseconds || 0
          }
        : null
    };
  };

  const fetchUsersByReferral = async (refName) => {
    const snap = await getDocs(
      query(collection(db, "users"), where("referralBy", "==", refName))
    );
    return snap.docs.map((d) => d.data());
  };

  const fetchWithdrawalsForUsers = async (usernames) => {
    if (!usernames.length) return [];

    const snap = await getDocs(collection(secondaryDb, "withdrawals"));

    return snap.docs
      .map((doc) => normalizeWithdrawal(doc))
      .filter(
        (item) =>
          usernames.includes(item.username) &&
          isToday(item.createdAt) &&
          ["success", "cancelled", "processing"].includes(
            String(item.status || "").toLowerCase()
          )
      )
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
  };

  const saveToCache = (l1, l2, l3) => {
    localStorage.setItem(storageKeyL1, JSON.stringify(l1));
    localStorage.setItem(storageKeyL2, JSON.stringify(l2));
    localStorage.setItem(storageKeyL3, JSON.stringify(l3));
  };

  const updateIfChanged = (newL1, newL2, newL3) => {
    const oldL1 = JSON.parse(localStorage.getItem(storageKeyL1)) || [];
    const oldL2 = JSON.parse(localStorage.getItem(storageKeyL2)) || [];
    const oldL3 = JSON.parse(localStorage.getItem(storageKeyL3)) || [];

    const changed =
      JSON.stringify(oldL1) !== JSON.stringify(newL1) ||
      JSON.stringify(oldL2) !== JSON.stringify(newL2) ||
      JSON.stringify(oldL3) !== JSON.stringify(newL3);

    if (changed) {
      setL1Withdrawals(newL1);
      setL2Withdrawals(newL2);
      setL3Withdrawals(newL3);
      saveToCache(newL1, newL2, newL3);
    }
  };

  useEffect(() => {
    if (!username) return;

    const fetchTodayWithdrawals = async () => {
      try {
        const level1Users = await fetchUsersByReferral(username);
        const l1Usernames = level1Users.map((u) => u.username).filter(Boolean);

        let level2Users = [];
        for (const user of level1Users) {
          if (!user.username) continue;
          const children = await fetchUsersByReferral(user.username);
          level2Users.push(...children);
        }
        const l2Usernames = level2Users.map((u) => u.username).filter(Boolean);

        let level3Users = [];
        for (const user of level2Users) {
          if (!user.username) continue;
          const children = await fetchUsersByReferral(user.username);
          level3Users.push(...children);
        }
        const l3Usernames = level3Users.map((u) => u.username).filter(Boolean);

        const [l1, l2, l3] = await Promise.all([
          fetchWithdrawalsForUsers(l1Usernames),
          fetchWithdrawalsForUsers(l2Usernames),
          fetchWithdrawalsForUsers(l3Usernames)
        ]);

        updateIfChanged(l1, l2, l3);
      } catch (err) {
        console.error("Failed to fetch today's withdrawals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayWithdrawals();

    const interval = setInterval(() => {
      fetchTodayWithdrawals();
    }, 10000);

    return () => clearInterval(interval);
  }, [username]);

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  const renderWithdrawals = (list) => {
    if (!list.length) {
      return <p className="no-data">No withdrawals today</p>;
    }

    return list.map((item, i) => (
      <div key={`${item.id}-${i}`} className="withdraw-user">
        <div className="withdraw-top">
          <span>👤 {maskUsername(item.username)}</span>
          <span className="withdraw-time">{formatTime(item.createdAt)}</span>
        </div>

        <div className="withdraw-amount">💸 {formatAmount(item)}</div>
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

      <h2 className="title">💸 Today Withdrawals</h2>

      {loading ? (
        <p className="no-data">Loading withdrawals...</p>
      ) : (
        <>
          <div className="grid">
            <div className="card" onClick={() => toggle("l1")}>
              <p>Level 1</p>
              <h1>{l1Withdrawals.length}</h1>
              <span className="view-text">
                {open === "l1" ? "Close View ▲" : "Open and View ▼"}
              </span>
            </div>

            <div className="card" onClick={() => toggle("l2")}>
              <p>Level 2</p>
              <h1>{l2Withdrawals.length}</h1>
              <span className="view-text">
                {open === "l2" ? "Close View ▲" : "Open and View ▼"}
              </span>
            </div>

            <div className="card" onClick={() => toggle("l3")}>
              <p>Level 3</p>
              <h1>{l3Withdrawals.length}</h1>
              <span className="view-text">
                {open === "l3" ? "Close View ▲" : "Open and View ▼"}
              </span>
            </div>
          </div>

          {open === "l1" && (
            <div className="details">
              <h3 className="details-title">Level 1 Withdrawals</h3>
              {renderWithdrawals(l1Withdrawals)}
            </div>
          )}

          {open === "l2" && (
            <div className="details">
              <h3 className="details-title">Level 2 Withdrawals</h3>
              {renderWithdrawals(l2Withdrawals)}
            </div>
          )}

          {open === "l3" && (
            <div className="details">
              <h3 className="details-title">Level 3 Withdrawals</h3>
              {renderWithdrawals(l3Withdrawals)}
            </div>
          )}
        </>
      )}
    </div>
  );
}