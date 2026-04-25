import React from "react";
import "./MobileMoney.css";
import { useNavigate } from "react-router-dom";

export default function MobileMoney() {

  const navigate = useNavigate();

  return (
    <div className="mobile-container">

      {/* 🔙 BACK BUTTON */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* TITLE */}
      <h1>Deposit Method</h1>
      <p className="subtitle">
        Choose your region to continue
      </p>

      {/* OPTIONS */}
      <div className="mobile-options">

        {/* TANZANIA */}
        <div
          className="mobile-card tz"
          onClick={() => navigate("/tanzania-deposit")}
        >
          <h3>🇹🇿 Tanzania</h3>
          <p>Deposit by Tanzania Shilling (TZS)</p>
        </div>

        {/* EAST AFRICA */}
        <div
          className="mobile-card ea"
          onClick={() => navigate("/eastafrica-deposit")}
        >
          <h3>🌍 East Africa</h3>

          {/* FLAGS */}
          <div className="flags">
            🇰🇪 🇺🇬 🇧🇮 🇷🇼 🇨🇩 🇿🇲 🇧🇼 🇲🇬 🇲🇼 🇲🇿 🇸🇸 🇿🇼
          </div>

          <p>All East Africa Countries</p>
        </div>

      </div>

    </div>
  );
}