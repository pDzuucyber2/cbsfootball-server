import React from "react";
import { useNavigate } from "react-router-dom";
import "./Accounts.css";

export default function TotalBalance() {
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData")) || {};

  const format = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const usdt = Number(userData.usdtBalance || 0);
  const tsh = Number(userData.tshBalance || 0);

  // 👇 HAPA NDIO LOGIC YAKO
  const renderBalance = () => {
    if (usdt > 0 && tsh > 0) {
      return `${format(usdt)} USDT + ${format(tsh)} TZS`;
    }

    if (usdt > 0) {
      return `${format(usdt)} USDT`;
    }

    if (tsh > 0) {
      return `${format(tsh)} TZS`;
    }

    return "0.00";
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h2>Total Balance</h2>
      </div>

      <div className="content">
        <div className="balance-card">
          <p>Total Balance</p>
          <h1>{renderBalance()}</h1>
        </div>

        <div className="actions">
          <button className="main-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}