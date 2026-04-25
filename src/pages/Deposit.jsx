import React from "react";
import "./Deposit.css";
import { useNavigate } from "react-router-dom";

export default function Deposit() {

  const navigate = useNavigate();

  return (
    <div className="deposit-container">

      {/* 🔙 BACK BUTTON */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1>Select Payment Method</h1>
      <p className="subtitle">
        You must choose a payment option
      </p>

      <div className="options">

        {/* MOBILE / BANK */}
        <div
          className="option bank"
          onClick={() => navigate("/mobalimoney")}
        >
          <span>📶📲 Local Bank/</span>
          <small>Mobile Money</small>
        </div>

        {/* CRYPTO */}
        <div
          className="option crypto"
          onClick={() => navigate("/depositecrypto")}
        >
          <span>💰💲 Crypto Currency</span>
          <small>(USDT)</small>
        </div>

      </div>

    </div>
  );
}