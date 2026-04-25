import React from "react";
import { useNavigate } from "react-router-dom";
import "./AboutContraBetScore.css";

export default function AboutContraBetScore() {
  const navigate = useNavigate();

  const sportLinks = [
    { label: "Football", path: "/sports" },
    { label: "Aviator", path: "/aviator" },
    { label: "Games", path: "/casino" },
    { label: "Agent", path: "/agents" },
      { label: "Sport", path: "/sports" }
  ];

  const helpLinks = [
    { label: "Deposit", path: "/deposit" },
    { label: "Withdraw", path: "/withdraw" },
    { label: "Rules", path: "/rules" },
    { label: "Help", path: "/customer-cares" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Cookies Policy", path: "/cookies" },
    { label: "Responsible Gambling", path: "/responsible-gaming" },
    { label: "About", path: "/abouts" },
    { label: "Term", path: "/terms" },
    { label: "News", path: "/news" },
    { label: "Log out", action: "logout" }
  ];

  const handleHelpClick = (item) => {
    if (item.action === "logout") {
      localStorage.clear();
      navigate("/login");
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="cbs-about-section">
      <div className="cbs-divider" />

      <div className="cbs-partner-title-row">
        <div className="cbs-line" />
        <h3>Official Partner</h3>
        <div className="cbs-line" />
      </div>

      <div className="cbs-partner-logo-wrap">
        <img src="/logo192.png" alt="ContraBetScore Partner" className="cbs-partner-logo" />
      </div>

      <div className="cbs-divider" />

      <div className="cbs-links-grid">
        <div className="cbs-links-column">
          <h4>Sport</h4>
          {sportLinks.map((item, index) => (
            <button
              key={index}
              className="cbs-link-btn"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="cbs-links-column">
          <h4>Help Center</h4>
          {helpLinks.map((item, index) => (
            <button
              key={index}
              className="cbs-link-btn"
              onClick={() => handleHelpClick(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cbs-divider" />

      <div className="cbs-social-section">
        <h4>Stay up to date</h4>
        <div className="cbs-social-row">
          <button className="cbs-social-btn">f</button>
          <button className="cbs-social-btn">𝕏</button>
          <button className="cbs-social-btn">◎</button>
        </div>
      </div>

      <div className="cbs-divider" />

      <div className="cbs-language-row">
        <h4>Change Language</h4>

        <div className="cbs-language-actions">
          <button
            className="cbs-back-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ Back to top
          </button>

          <button className="cbs-flag-btn">🇹🇿</button>

          <button className="cbs-language-btn">
            🇬🇧 English
          </button>
        </div>
      </div>

      <div className="cbs-divider" />
    </div>
  );
}