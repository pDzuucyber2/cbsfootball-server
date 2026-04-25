import React, { useEffect, useState } from "react";
import "./Agents.css";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

const countryCurrency = {
  Kenya: "KES",
  Uganda: "UGX",
  Rwanda: "RWF",
  Burundi: "BIF",
  "DRC - Congo": "USD",
  Zambia: "ZMW",
  Malawi: "MWK",
  Mozambique: "MZN",
  Zimbabwe: "USD",
  "South Sudan": "SSP",
  Botswana: "BWP",
  Madagascar: "MGA",
};

export default function Agent() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "AgentUser";

  const [teamCount, setTeamCount] = useState(() => {
    return Number(localStorage.getItem("teamCount")) || 0;
  });

  const [commissionTotal, setCommissionTotal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agentCommissionTotal")) || {};
    } catch {
      return {};
    }
  });

  const [bonusTotal, setBonusTotal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agentBonusTotal")) || {};
    } catch {
      return {};
    }
  });

  const formatCurrencyTotals = (obj = {}) => {
    const entries = Object.entries(obj).filter(([, value]) => Number(value) > 0);

    if (entries.length === 0) return "0.00";

    return entries
      .map(([currency, value]) => `${Number(value).toFixed(2)} ${currency}`)
      .join(" + ");
  };

  const sumCurrencyObjects = (list) => {
    const total = {};

    list.forEach((item) => {
      const currencyObj = item?.total || {};
      Object.entries(currencyObj).forEach(([currency, value]) => {
        if (!total[currency]) total[currency] = 0;
        total[currency] += Number(value || 0);
      });
    });

    return total;
  };

  const sumBonusCollections = (list) => {
    const total = {};

    list.forEach((item) => {
      const amount = Number(item.amount || 0);
      if (amount <= 0) return;

      let currency = "TZS";

      if (item.collection === "usdt_transactions") {
        currency = "USDT";
      } else if (item.collection === "visterdeposte") {
        currency = countryCurrency[item.country] || "USD";
      } else {
        currency = "TZS";
      }

      if (!total[currency]) total[currency] = 0;
      total[currency] += amount;
    });

    return total;
  };

  useEffect(() => {
    if (!username) return;

    const fetchTeamCount = async () => {
      try {
        const l1Snap = await getDocs(
          query(collection(db, "users"), where("referralBy", "==", username))
        );
        const l1 = l1Snap.docs.map((doc) => doc.data());

        let l2 = [];
        for (const user of l1) {
          if (!user.username) continue;

          const l2Snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", user.username))
          );

          l2Snap.forEach((doc) => {
            l2.push(doc.data());
          });
        }

        let l3 = [];
        for (const user of l2) {
          if (!user.username) continue;

          const l3Snap = await getDocs(
            query(collection(db, "users"), where("referralBy", "==", user.username))
          );

          l3Snap.forEach((doc) => {
            l3.push(doc.data());
          });
        }

        const total = l1.length + l2.length + l3.length;

        setTeamCount(total);
        localStorage.setItem("teamCount", total.toString());
      } catch (err) {
        console.error("Failed to fetch team count:", err);
      }
    };

    const fetchCommissionTotal = async () => {
      try {
        const commissionSnap = await getDocs(
          query(collection(db, "admin_commissions"), where("username", "==", username))
        );

        const paidList = commissionSnap.docs
          .map((doc) => doc.data())
          .filter((item) => item.status === "success");

        const total = sumCurrencyObjects(paidList);

        setCommissionTotal(total);
        localStorage.setItem("agentCommissionTotal", JSON.stringify(total));
      } catch (err) {
        console.error("Failed to fetch commission total:", err);
      }
    };

    const fetchBonusTotal = async () => {
      try {
        const tshQuery = query(
          collection(db, "tsh_transactions"),
          where("username", "==", username)
        );

        const usdtQuery = query(
          collection(db, "usdt_transactions"),
          where("username", "==", username)
        );

        const visitorQuery = query(
          collection(standardDb, "visterdeposte"),
          where("username", "==", username)
        );

        const [tshSnap, usdtSnap, visitorSnap] = await Promise.all([
          getDocs(tshQuery),
          getDocs(usdtQuery),
          getDocs(visitorQuery),
        ]);

        const allBonus = [
          ...tshSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            collection: "tsh_transactions",
          })),
          ...usdtSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            collection: "usdt_transactions",
          })),
          ...visitorSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            collection: "visterdeposte",
          })),
        ].filter((item) => item.status === "success");

        const total = sumBonusCollections(allBonus);

        setBonusTotal(total);
        localStorage.setItem("agentBonusTotal", JSON.stringify(total));
      } catch (err) {
        console.error("Failed to fetch bonus total:", err);
      }
    };

    fetchTeamCount();
    fetchCommissionTotal();
    fetchBonusTotal();
  }, [username]);

  const handleCopyLink = () => {
    const link = `https://cbscontrabetscore.com/register?ref=${username}`;
    navigator.clipboard.writeText(link);
    alert("Invite link copied ✅");
  };

  return (
    <div className="agent-container">
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h2 className="title">AgentDashboard</h2>

      <div className="agent-card">
        <h3 className="agent-name">{username}</h3>

        <div className="agent-grid">
          <div onClick={() => navigate("/record")} style={{ cursor: "pointer" }}>
            <p>Agent Commission</p>
            <h4 className="link">{formatCurrencyTotals(commissionTotal)}</h4>
          </div>

          <div onClick={() => navigate("/aneybonus")} style={{ cursor: "pointer" }}>
            <p>Agent Bonus</p>
            <h4 className="link">{formatCurrencyTotals(bonusTotal)}</h4>
          </div>

          <div>
            <p>Team Count</p>
            <h4>{teamCount}</h4>
          </div>

          <div onClick={() => navigate("/active-player")} style={{ cursor: "pointer" }}>
            <p>Online</p>
            <h4 className="link">TeamOnline(view) ℹ️</h4>
          </div>
        </div>

        <div className="agent-actions">
          <div onClick={() => navigate("/myteam")}>
            👥<p>ViewTeam</p>
          </div>

          <div onClick={() => navigate("/report")}>
            📄<p>Reports</p>
          </div>

          <div onClick={() => navigate("/record")}>
            📋<p>Record</p>
          </div>

          <div
            onClick={() => navigate("/invite")}
            onDoubleClick={handleCopyLink}
          >
            🔳<p>Invite Link</p>
          </div>
        </div>
      </div>

      <div className="bonus-card">
        <p>🔥FIRE🎆</p>
        <button>🔥FIRE🎆</button>
      </div>

      <div className="grid-menu">
        <div className="grid-item" onClick={() => navigate("/NewRegister")}>
          📄<p>New Member</p>
        </div>

        <div className="grid-item" onClick={() => navigate("/newdeposit")}>
          💳<p>New Deposit</p>
        </div>

        <div className="grid-item" onClick={() => navigate("/newwithdrawals")}>
          💵<p>New Withdrawal</p>
        </div>

        <div className="grid-item" onClick={() => navigate("/team-bets")}>
          🎮<p>Your Team Bets</p>
        </div>

        <div className="grid-item" onClick={() => navigate("/aneybonus")}>
          📈<p>Bonus</p>
        </div>
      </div>
    </div>
  );
}