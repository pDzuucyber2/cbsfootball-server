import React, { useEffect, useState } from "react";
import "./mypage.css";

import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

export default function Account() {
  const [username, setUsername] = useState("");
  const [balances, setBalances] = useState({
    USDT: 0,
    TSH: 0,
    USD: 0,
    KES: 0,
    UGX: 0,
    RWF: 0,
    BIF: 0,
    ZMW: 0,
    MWK: 0,
    MZN: 0,
    SSP: 0,
    BWP: 0,
    MGA: 0,
  });
  const [latestRefund, setLatestRefund] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) return;

    setUsername(storedUser);

    const fetchUser = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", storedUser)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();

          setBalances({
            USDT: Number(userData.usdtBalance || 0),
            TSH: Number(userData.tshBalance || 0),
            USD: Number(userData.USDBalance || 0),
            KES: Number(userData.KESBalance || 0),
            UGX: Number(userData.UGXBalance || 0),
            RWF: Number(userData.RWFBalance || 0),
            BIF: Number(userData.BIFBalance || 0),
            ZMW: Number(userData.ZMWBalance || 0),
            MWK: Number(userData.MWKBalance || 0),
            MZN: Number(userData.MZNBalance || 0),
            SSP: Number(userData.SSPBalance || 0),
            BWP: Number(userData.BWPBalance || 0),
            MGA: Number(userData.MGABalance || 0),
          });
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    const fetchLatestRefund = async () => {
      try {
        const snap = await getDocs(collection(standardDb, "antscore"));

        const refundedList = snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(
            (item) =>
              (item.username || "").toLowerCase() ===
                storedUser.toLowerCase() &&
              item.refunded === true
          )
          .sort((a, b) => {
            const aTime = a.refundedAt?.seconds
              ? a.refundedAt.seconds
              : a.refundedAt?.toDate
              ? a.refundedAt.toDate().getTime() / 1000
              : 0;

            const bTime = b.refundedAt?.seconds
              ? b.refundedAt.seconds
              : b.refundedAt?.toDate
              ? b.refundedAt.toDate().getTime() / 1000
              : 0;

            return bTime - aTime;
          });

        if (refundedList.length > 0) {
          setLatestRefund(refundedList[0]);
        } else {
          setLatestRefund(null);
        }
      } catch (error) {
        console.error("Failed to fetch latest refund:", error);
      }
    };

    fetchUser();
    fetchLatestRefund();
  }, []);

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const availableBalances = Object.entries(balances).filter(
    ([, amount]) => Number(amount) > 0
  );

  const renderBalance = () => {
    if (availableBalances.length === 0) return "0.00";

    return availableBalances
      .map(([currency, amount]) => `${formatNumber(amount)} ${currency}`)
      .join(" + ");
  };

  const refundText = latestRefund
    ? `${formatNumber(latestRefund.amount || 0)} ${latestRefund.currency || ""}`
    : "No refund";

  return (
    <div className="account-container">
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="account-header">
        <div className="user-info">
          <div className="avatar">
            <span>👤</span>
            <div className="online-dot"></div>
          </div>
          <div className="username">{username}</div>
        </div>

        <div className="wallet-box">
          <span>{renderBalance()}</span>
        </div>
      </div>

      <div className="balance-section">
        <p className="label">Est total value</p>
        <h1>{renderBalance()}</h1>
        <p className="available">Available: {renderBalance()}</p>
      </div>

      <div className="actions">
        <button onClick={() => navigate("/deposit")}>
          💼<span>Deposit</span>
        </button>

        <button onClick={() => navigate("/withdraw")}>
          💸<span>Withdraw</span>
        </button>

        <button onClick={() => navigate("/transfer")}>
          🔁<span>Transfer</span>
        </button>

        <button onClick={() => navigate("/history")}>
          🕒<span>History</span>
        </button>
      </div>

      <div className="reward-box">
        <span>
          After you deposit, you will receive your big bonus.
          ContractBetscor is on fire 🔥
        </span>

        <div className="reward-stats">
          <div className="stat-item">
            <p>🎁 Bonus</p>
            <span>Up to 50%</span>
          </div>

          <div className="stat-item">
            <p>💰 Commission</p>
            <span>15%+10+5</span>
          </div>

          <div className="stat-item">
            <p>🛡 Compensation</p>
            <span>Available</span>
          </div>

          <div
            className="stat-item"
            onClick={() => navigate("/user-refunds")}
          >
            <p>💵 Refunds</p>
            <span>{refundText}</span>
          </div>
        </div>
      </div>

      <div className="assets">
        <h3>Amount</h3>

        {availableBalances.length > 0 ? (
          availableBalances.map(([currency, amount]) => (
            <div className="asset-item" key={currency}>
              <span>{currency}</span>
              <span>{formatNumber(amount)}</span>
            </div>
          ))
        ) : (
          <div className="asset-item">
            <span>Balance</span>
            <span>0.00</span>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <button
          className={location.pathname === "/aneybonus" ? "active" : ""}
          onClick={() => navigate("/aneybonus")}
        >
          📊<span>Bonus</span>
        </button>

        <button
          className={location.pathname === "/newdeposit" ? "active" : ""}
          onClick={() => navigate("/newdeposit")}
        >
          💵<span>NewDeposit</span>
        </button>

        <button
          className={location.pathname === "/user-refunds" ? "active" : ""}
          onClick={() => navigate("/user-refunds")}
        >
          💸<span>Refunds</span>
        </button>

        <button
          className={location.pathname === "/newwithdrawals" ? "active" : ""}
          onClick={() => navigate("/newwithdrawals")}
        >
          🔄<span>NewCashoutTeam</span>
        </button>

        <button
          className={location.pathname === "/team-bets" ? "active" : ""}
          onClick={() => navigate("/team-bets")}
        >
          🎮<span>TeamBets</span>
        </button>
      </div>
    </div>
  );
}