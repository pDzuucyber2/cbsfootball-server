import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav(){

  const navigate = useNavigate();
  const location = useLocation();

  const go = (path)=>{
    navigate(path);
  };

  return(

    <div className="bottom-nav">

      {/* MENU */}
      <div
        className={`nav-item ${location.pathname === "/menu" ? "active":""}`}
        onClick={()=>go("/menu")}
      >
        <div className="icon">➕🟰➕</div>
        <div className="label">Menu</div>
      </div>

      {/* SPORTS */}
      <div
        className={`nav-item ${location.pathname === "/sports" ? "active":""}`}
        onClick={()=>go("/sports")}
      >
        <div className="icon">⚽</div>
        <div className="label">Sports</div>
      </div>

      {/* 🔥 BETSLIP (LOGO) */}
      <div
        className="nav-item betslip"
        onClick={()=>go("/betslip")}
      >

        <div className="betslip-circle">
          <img 
            src="/logo192.png" 
            alt="logo" 
            className="betslip-logo"
          />
        </div>

        <div className="label">Betslip</div>

      </div>

      {/* MY BETS */}
      <div
        className={`nav-item ${location.pathname === "/mybets" ? "active":""}`}
        onClick={()=>go("/mybets")}
      >
        <div className="icon">📑</div>
        <div className="label">My Bets</div>
      </div>

      {/* ACCOUNT */}
      <div
        className={`nav-item ${location.pathname === "/accounts" ? "active":""}`}
        onClick={()=>go("/accounts")}
      >
        <div className="icon">👤</div>
        <div className="label">Account</div>
      </div>

    </div>

  );
}