import React from "react";
import "./TanzaniaDeposit.css";
import { useNavigate } from "react-router-dom";

export default function TanzaniaDeposit() {

  const navigate = useNavigate();

  return (
    <div className="tz-container">

      {/* 🔙 BACK */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* TITLE */}
      <h1>🇹🇿 Tanzania Deposit</h1>
      <p className="subtitle">
        Choose your payment method
      </p>

      {/* OPTIONS */}
      <div className="tz-options">

        {/* BUSINESS */}
        <div
          className="tz-card business"
          onClick={() => navigate("/business-payment")}
        >
          <h3>🏢 Business Account</h3>
          <p>Lipa Number/M.Pesa/Airtel/Yas (Till / Paybill)</p>
        </div>

        {/* MOBILE MONEY */}
        <div
          className="tz-card mobile"
          onClick={() => navigate("/mobile-payment")}
        >
          <h3>📱 Mobile Money</h3>
          <p>M-Pesa, Airtel, Tigo,Halotel</p>
        </div>

      

      </div>

    </div>
  );
}