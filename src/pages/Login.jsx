import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import "./Login.css";

const languages = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "sw", label: "SW", flag: "🇹🇿" },
];

const SolarLogo = ({ small = false }) => (
  <div className={small ? "bfe-solar-system small-system" : "bfe-solar-system"}>
    <div className="bfe-orbit bfe-orbit-one">
      <span className="planet-ball">⚽</span>
    </div>

    <div className="bfe-orbit bfe-orbit-two">
      <span className="planet-ball small">⚽</span>
    </div>

    <div className="bfe-sun">
      <img src="/favicon.ico" alt="center logo" />
    </div>
  </div>
);

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [language, setLanguage] = useState("en");
  const [securityCode, setSecurityCode] = useState("");
  const [userCode, setUserCode] = useState("");

  const [error, setError] = useState("");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const generateCode = () => {
    setSecurityCode(Math.floor(1000 + Math.random() * 9000).toString());
  };

  useEffect(() => {
    generateCode();

    const saved = localStorage.getItem("rememberUsername");
    if (saved) {
      setUsername(saved);
      setRemember(true);
    }

    const interval = setInterval(generateCode, 60000);
    return () => clearInterval(interval);
  }, []);

  const goToDashboard = (role) => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "agent") {
      navigate("/agent-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setBlockedMessage("");

    if (!username.trim()) return setError("Enter username");
    if (!password.trim()) return setError("Enter password");

    if (userCode !== securityCode) {
      setUserCode("");
      generateCode();
      return setError("Verification code incorrect");
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username.trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setLoading(false);
        return setError("Username not found or network issue");
      }

      const userData = snap.docs[0].data();

      if (userData.isBlocked) {
        setLoading(false);
        return setBlockedMessage("❌ Account blocked");
      }

      if (userData.password !== password) {
        setLoading(false);
        return setError("Incorrect password");
      }

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("username", username.trim());
      localStorage.setItem("authenticated", "true");
      localStorage.setItem("role", userData.role || "user");

      if (remember) {
        localStorage.setItem("rememberUsername", username.trim());
      } else {
        localStorage.removeItem("rememberUsername");
      }

      setShowLoader(true);

      setTimeout(() => {
        goToDashboard(userData.role || "user");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="bfe-login-page">
      <div className="bfe-login-bg"></div>
      <div className="bfe-login-overlay"></div>

      <div className="bfe-login-container">
        <button className="bfe-close-btn" onClick={() => navigate("/")}>
          ✕
        </button>

        <div className="bfe-lang-box">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bfe-logo-wrap">
          <SolarLogo small />
        </div>

        {error && <div className="bfe-error">{error}</div>}
        {blockedMessage && <div className="bfe-blocked">{blockedMessage}</div>}

        <form onSubmit={handleLogin} className="bfe-login-form">
          <div className="bfe-input-box">
            <FaUser className="bfe-input-icon" />
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
            />
          </div>

          <div className="bfe-input-box">
            <FaLock className="bfe-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ""))}
            />

            <button
              type="button"
              className="bfe-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="bfe-code-row">
            <div className="bfe-input-box bfe-code-input">
              <FaShieldAlt className="bfe-input-icon" />
              <input
                placeholder="Type code"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
              />
            </div>

            <button type="button" className="bfe-captcha" onClick={generateCode}>
              {securityCode}
            </button>
          </div>

          <div className="bfe-options">
            <label className="bfe-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember</span>
            </label>

            <button
              type="button"
              className="lost-login"
              onClick={() => navigate("/customer-cares")}
            >
              LOST LOGIN?
            </button>
          </div>

          <button className="bfe-login-btn" disabled={loading}>
            {loading ? "LOADING..." : "LOGIN"}
          </button>
        </form>

        <div className="bfe-bottom-links">
          <Link to="/register">SIGNUP</Link>
          <Link to="/customer-cares">CONTACT US</Link>
        </div>

        <SolarLogo />
      </div>

      {showLoader && (
        <div className="bfe-loader-screen">
          <img src="/images/player.png" className="bfe-loader-bg" alt="loading" />
          <div className="bfe-loader-overlay"></div>

          <div className="bfe-loader-content">
            <SolarLogo />
          </div>
        </div>
      )}
    </div>
  );
}