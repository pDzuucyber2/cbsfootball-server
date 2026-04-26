
import React, { useEffect, useMemo, useState } from "react";
import "./Menu.css";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";

export default function VipMenu() {
  const navigate = useNavigate();

  const getStoredJSON = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;
      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to parse localStorage key: ${key}`, error);
      return fallback;
    }
  };

  const username = localStorage.getItem("username") || "User";
  const totalDepositTsh = Number(getStoredJSON("totalDepositTsh", 0)) || 0;

  const [loadingStats, setLoadingStats] = useState(true);

  const [profitByCurrency, setProfitByCurrency] = useState(
    getStoredJSON("profitByCurrency", {})
  );
  const [turnoverByCurrency, setTurnoverByCurrency] = useState(
    getStoredJSON("turnoverByCurrency", {})
  );

  const [selectedProfitCurrency, setSelectedProfitCurrency] = useState("TZS");
  const [selectedTurnoverCurrency, setSelectedTurnoverCurrency] = useState("TZS");

  const format = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getVIP = () => {
    const total = Number(totalDepositTsh || 0);

    if (total < 10000) return "VIP 0";
    if (total <= 199999) return "VIP 1";
    if (total <= 1000000) return "VIP 2";
    if (total <= 2500000) return "VIP 3";
    if (total <= 5000000) return "VIP 4";

    return `VIP ${5 + Math.floor((total - 5000001) / 3000000)}`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!username || username === "User") {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        const antScoreQuery = query(
          collection(standardDb, "antscore"),
          where("username", "==", username)
        );

        const correctScoreQuery = query(
          collection(standardDb, "correctscore"),
          where("username", "==", username)
        );

        const [antScoreSnap, correctScoreSnap] = await Promise.all([
          getDocs(antScoreQuery),
          getDocs(correctScoreQuery),
        ]);

        const profitTotals = {};
        const turnoverTotals = {};

        const addTotals = (currency, profit, totalWin) => {
          const code = currency || "TZS";

          profitTotals[code] =
            Number(profitTotals[code] || 0) + Number(profit || 0);

          turnoverTotals[code] =
            Number(turnoverTotals[code] || 0) + Number(totalWin || 0);
        };

        antScoreSnap.forEach((docSnap) => {
          const data = docSnap.data();
          addTotals(data.currency, data.profit, data.totalWin);
        });

        correctScoreSnap.forEach((docSnap) => {
          const data = docSnap.data();
          addTotals(data.currency, data.profit, data.totalWin);
        });

        setProfitByCurrency(profitTotals);
        setTurnoverByCurrency(turnoverTotals);

        localStorage.setItem("profitByCurrency", JSON.stringify(profitTotals));
        localStorage.setItem("turnoverByCurrency", JSON.stringify(turnoverTotals));

        const profitCurrencies = Object.keys(profitTotals).filter(
          (currency) => Number(profitTotals[currency] || 0) > 0
        );

        const turnoverCurrencies = Object.keys(turnoverTotals).filter(
          (currency) => Number(turnoverTotals[currency] || 0) > 0
        );

        if (profitCurrencies.includes("TZS")) {
          setSelectedProfitCurrency("TZS");
        } else if (profitCurrencies.length > 0) {
          setSelectedProfitCurrency(profitCurrencies[0]);
        } else {
          setSelectedProfitCurrency("TZS");
        }

        if (turnoverCurrencies.includes("TZS")) {
          setSelectedTurnoverCurrency("TZS");
        } else if (turnoverCurrencies.length > 0) {
          setSelectedTurnoverCurrency(turnoverCurrencies[0]);
        } else {
          setSelectedTurnoverCurrency("TZS");
        }
      } catch (error) {
        console.error("Failed to fetch vip stats:", error);

        try {
          const cachedProfit = getStoredJSON("profitByCurrency", {});
          const cachedTurnover = getStoredJSON("turnoverByCurrency", {});

          setProfitByCurrency(cachedProfit);
          setTurnoverByCurrency(cachedTurnover);
        } catch (e) {
          console.error("Failed to load cached stats:", e);
        }
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [username]);

  useEffect(() => {
    const handleFocus = () => {
      setProfitByCurrency(getStoredJSON("profitByCurrency", {}));
      setTurnoverByCurrency(getStoredJSON("turnoverByCurrency", {}));
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const profitCurrencies = useMemo(() => {
    return Object.entries(profitByCurrency)
      .filter(([, value]) => Number(value) > 0)
      .map(([currency]) => currency);
  }, [profitByCurrency]);

  const turnoverCurrencies = useMemo(() => {
    return Object.entries(turnoverByCurrency)
      .filter(([, value]) => Number(value) > 0)
      .map(([currency]) => currency);
  }, [turnoverByCurrency]);

  const showProfitSelect =
    profitCurrencies.length > 1 &&
    profitCurrencies.some((currency) => currency !== "TZS");

  const showTurnoverSelect =
    turnoverCurrencies.length > 1 &&
    turnoverCurrencies.some((currency) => currency !== "TZS");

  const currentProfit = Number(profitByCurrency[selectedProfitCurrency] || 0);
  const currentTurnover = Number(
    turnoverByCurrency[selectedTurnoverCurrency] || 0
  );

  const vipLevel = getVIP();

  return (
    <div className="vip-container">
      <div className="vip-header">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="vip-card">
        <div className="vip-badge">{vipLevel}</div>

        <h2>{username}</h2>

        <p className="earn-label">Earnings Balance</p>

        {showProfitSelect && (
          <div className="small-balance-select-wrap">
            <select
              className="small-balance-select"
              value={selectedProfitCurrency}
              onChange={(e) => setSelectedProfitCurrency(e.target.value)}
            >
              {profitCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        )}

        <h1 className="balance">
          {loadingStats
            ? "Loading..."
            : currentProfit > 0
            ? `${selectedProfitCurrency} ${format(currentProfit)}`
            : `${selectedProfitCurrency} 0.00`}
        </h1>

        <div className="vip-stats">
          <div>
            <p>Total Deposit</p>
            <span>TZS {format(totalDepositTsh)}</span>
          </div>

          <div>
            <p>Total Turnover</p>

            {showTurnoverSelect && (
              <div className="small-balance-select-wrap">
                <select
                  className="small-balance-select"
                  value={selectedTurnoverCurrency}
                  onChange={(e) => setSelectedTurnoverCurrency(e.target.value)}
                >
                  {turnoverCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <span>
              {loadingStats
                ? "Loading..."
                : `${selectedTurnoverCurrency} ${format(currentTurnover)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className="active">WEEK</button>
        <button>MONTH</button>
      </div>

      <div className="vip-grid">
        <div
          className="vip-item"
          onClick={() => navigate("/other-country-wallet")}
        >
          📄
          <p>OtherWallet</p>
        </div>

        <div className="vip-item" onClick={() => navigate("/records")}>
          📊
          <p>Records</p>
        </div>

        <div className="vip-item" onClick={() => navigate("/add-card")}>
          ☎️
          <p>Add Withdraw Wallet</p>
        </div>

        <div
          className="vip-item"
          onClick={() => navigate("/usdt-management")}
        >
          💲
          <p>Add Crypto Wallet</p>
        </div>

        <div className="vip-item" onClick={() => navigate("/customer-care")}>
          👋🎧
          <p>Customer Service</p>
        </div>

        <div className="vip-item" onClick={() => navigate("/settings")}>
          ⚙️
          <p>Settings</p>
        </div>

        <div className="vip-item" onClick={() => navigate("/download")}>
          ⬇️
          <p>AppDownload</p>
        </div>


<div className="vip-item" onClick={() => navigate("/agents")}>
          ⬇👥
          <p>Agent</p>
        </div>

        <div className="vip-item" onClick={() => navigate("/vip-page")}>
          🏆
          <p>VIP Center</p>
        </div>
      </div>


      <div className="record-boxes">
        <div
          className="record-box win-box"
          onClick={() => navigate("/won-history")}
        >
          🟢
          <p>Win Record</p>
        </div>

        <div
          className="record-box lost-box"
          onClick={() => navigate("/lost-history")}
        >
          🔴
          <p>Lost Record</p>
        </div>
      </div>

      <div className="bottom-nav">
        <button onClick={() => navigate("/sports")}>
          ⚽
          <span>sports</span>
        </button>

        <button onClick={() => navigate("/live")}>
          📄
          <span>LIVE</span>
        </button>

        <button className="active-center">
          🏆
          <span>Menu</span>
        </button>

        <button onClick={() => navigate("/records")}>
          📊
          <span>Records</span>
        </button>

        <button onClick={() => navigate("/profile")}>
          ♋
          <span>OrderCancel</span>
        </button>
      </div>
    </div>
  );
}