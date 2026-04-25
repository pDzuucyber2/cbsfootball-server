import React, { useMemo, useState } from "react";
import "./VipPage.css";
import { useNavigate } from "react-router-dom";

export default function VipPage() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";
  const totalDepositTsh =
    Number(JSON.parse(localStorage.getItem("totalDepositTsh"))) || 0;

  const [selectedVipCurrency, setSelectedVipCurrency] = useState("TZS");

  const format = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const currencyRates = {
    TZS: 1,
    USDT: 2500,
    USD: 2500,
    KES: 19,
    UGX: 0.67,
    RWF: 1.9,
    BIF: 0.85,
    ZMW: 95,
    MWK: 1.45,
    MZN: 39,
    SSP: 1.9,
    BWP: 180,
    MGA: 0.55,
  };

  const vipLevelsBase = [
    { level: "VIP 1", amountTsh: 10000 },
    { level: "VIP 2", amountTsh: 200000 },
    { level: "VIP 3", amountTsh: 1000000 },
    { level: "VIP 4", amountTsh: 2500000 },
    { level: "VIP 5", amountTsh: 5000000 },
    { level: "VIP 6", amountTsh: 8000000 },
    { level: "VIP 7", amountTsh: 11000000 },
    { level: "VIP 8", amountTsh: 14000000 },
    { level: "VIP 9", amountTsh: 17000000 },
    { level: "VIP 10", amountTsh: 20000000 },
  ];

  const convertFromTsh = (amountTsh, currency) => {
    const rate = Number(currencyRates[currency] || 1);
    if (currency === "TZS") return amountTsh;
    return amountTsh / rate;
  };

  const getVIP = () => {
    const total = Number(totalDepositTsh || 0);

    if (total < 10000) return "VIP 0";
    if (total <= 199999) return "VIP 1";
    if (total <= 1000000) return "VIP 2";
    if (total <= 2500000) return "VIP 3";
    if (total <= 5000000) return "VIP 4";
    if (total <= 8000000) return "VIP 5";
    if (total <= 11000000) return "VIP 6";
    if (total <= 14000000) return "VIP 7";
    if (total <= 17000000) return "VIP 8";
    if (total <= 20000000) return "VIP 9";
    return "VIP 10";
  };

  const vipLevel = getVIP();

  const vipCurrencies = useMemo(() => {
    return Object.keys(currencyRates);
  }, []);

  const vipData = useMemo(() => {
    return vipLevelsBase.map((item) => ({
      ...item,
      convertedAmount: convertFromTsh(item.amountTsh, selectedVipCurrency),
    }));
  }, [selectedVipCurrency]);

  return (
    <div className="vip-page">
      <div className="vip-page-header">
        <button className="vip-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="vip-top-card">
        <div className="vip-current-badge">{vipLevel}</div>
        <h2 className="vip-username">{username}</h2>
        <p className="vip-subtitle">VIP System</p>
      </div>

      <div className="vip-system-card">
        <div className="vip-system-header">
          <h3>VIP Levels</h3>

          <select
            className="vip-currency-select"
            value={selectedVipCurrency}
            onChange={(e) => setSelectedVipCurrency(e.target.value)}
          >
            {vipCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div className="vip-list">
          {vipData.map((item) => {
            const active = item.level === vipLevel;

            return (
              <div
                key={item.level}
                className={`vip-row ${active ? "active" : ""}`}
              >
                <div className="vip-row-left">
                  <div className="vip-row-title">{item.level}</div>
                  {active && <div className="vip-row-current">Current Level</div>}
                </div>

                <div className="vip-row-right">
                  {selectedVipCurrency} {format(item.convertedAmount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}