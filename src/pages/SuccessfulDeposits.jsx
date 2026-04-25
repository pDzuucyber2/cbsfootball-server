import React from "react";
import { useNavigate } from "react-router-dom";
import "./Accounts.css";

export default function SuccessfulDeposits() {
  const navigate = useNavigate();

  const totalDepositTsh =
    JSON.parse(localStorage.getItem("totalDepositTsh")) || 0;

  const format = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h2>Successful Deposits</h2>
      </div>

      <div className="content">
        <div className="balance-card">
          <p>Total Successful Deposits (TZS)</p>
          <h1>{format(totalDepositTsh)} TZS</h1>
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