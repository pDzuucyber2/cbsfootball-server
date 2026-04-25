import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// 🔥 IMPORT CONTEXT
import { useBalance } from "../context/BalanceContext";

export default function TopBar() {

  const navigate = useNavigate();

  // 🔥 GLOBAL BALANCE
  const { balances, setBalances } = useBalance();

  const [activeCurrency, setActiveCurrency] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // 🔥 LOAD BALANCE (ONLY ONCE)
  useEffect(() => {

    const loadBalance = async () => {

      const username = localStorage.getItem("username");
      if (!username) return;

      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );

      const snapshot = await getDocs(q);

      snapshot.forEach(docSnap => {

        const data = docSnap.data();

        const allBalances = {
          TZS: Number(data.tshBalance || 0),
          USDT: Number(data.usdtBalance || 0),
          KES: Number(data.KESBalance || 0),
          UGX: Number(data.UGXBalance || 0),
          RWF: Number(data.RWFBalance || 0),
          BIF: Number(data.BIFBalance || 0),
          ZMW: Number(data.ZMWBalance || 0),
          MWK: Number(data.MWKBalance || 0),
          MZN: Number(data.MZNBalance || 0),
          USD: Number(data.USDBalance || 0),
          SSP: Number(data.SSPBalance || 0),
          BWP: Number(data.BWPBalance || 0),
          MGA: Number(data.MGABalance || 0),
        };

        // 🔥 SAVE TO GLOBAL
        setBalances(allBalances);

        const available = Object.entries(allBalances)
          .filter(([_, val]) => val > 0);

        if (available.length > 0) {
          setActiveCurrency(available[0][0]);
        } else {
          setActiveCurrency(null);
        }

      });

    };

    loadBalance();

  }, [setBalances]);

  // 🔥 CHECK BALANCE
  const hasBalance = Object.values(balances || {}).some(v => v > 0);

  const toggleSelector = () => {
    const count = Object.values(balances || {}).filter(v => v > 0).length;
    if (count > 1) setShowSelector(!showSelector);
  };

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  return (
    <div className="topbar-wrapper">

      <div className="topbar-green"></div>

      <div className="topbar">

        {/* 🔥 MENU + LOGO */}
        <div className="menu-box" onClick={() => navigate("/dashboard")}>
          
          <span className="menu-icon">☰</span>

          <img 
            src="/logo192.png" 
            alt="logo" 
            className="menu-logo"
          />

        </div>

        {/* LOGO TEXT */}
        <div className="logo">
          <span className="main">
            <span className="c1">Contra</span>
            <span className="c2">Bet</span>
            <span className="c3">Score</span>
          </span>
          <span className="short">CBS</span>
        </div>

        {/* RIGHT */}
        <div className="right">

          <div className="search">🔍</div>

          <div className="balance-wrapper">

            {/* BALANCE */}
            <div className="balance" onClick={toggleSelector}>

              {activeCurrency && balances[activeCurrency] !== undefined ? (
                <>
                  {activeCurrency} {balances[activeCurrency].toFixed(2)}
                </>
              ) : (
                <>0.00</>
              )}

              {Object.values(balances || {}).filter(v => v > 0).length > 1 && (
                <span className="arrow"> ^ </span>
              )}

              {/* PLUS */}
              <button
                className="plus"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActions();
                }}
              >
                +
              </button>

            </div>

            {/* SELECTOR */}
            {showSelector && (
              <div className="balance-select">
                {Object.entries(balances || {})
                  .filter(([_, val]) => val > 0)
                  .map(([currency, value]) => (
                    <div
                      key={currency}
                      onClick={() => {
                        setActiveCurrency(currency);
                        setShowSelector(false);
                      }}
                    >
                      {currency} {value.toFixed(2)}
                    </div>
                  ))}
              </div>
            )}

            {/* ACTION BOX */}
            {showActions && (
              <div className="action-box">

                <div
                  className="action-item deposit"
                  onClick={() => {
                    setShowActions(false);
                    navigate("/deposit");
                  }}
                >
                  Deposit
                </div>
                {hasBalance && (
                  <div
                    className="action-item withdraw"
                    onClick={() => {
                      setShowActions(false);
                      navigate("/withdraw");
                    }}
                  >
                    Withdraw
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}