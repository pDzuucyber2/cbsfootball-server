import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import "./LeagueTabs.css";

export default function LeagueTabs(){

  const navigate = useNavigate();
  const [leagues,setLeagues] = useState([]);

  /* 🔥 BASE URL */
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  /* 🔥 INITIALS */
  const getInitials = (name) => {
    if (!name) return "LG";

    return name
      .split(" ")
      .map(w => w[0])
      .join("")
      .substring(0,3)
      .toUpperCase();
  };

  /* 🔥 LOGO COMPONENT FINAL */
  const LeagueLogo = ({ src, name }) => {

    const [error, setError] = useState(false);

    const proxyUrl = src
      ? `${BASE_URL}/logo?url=${encodeURIComponent(src)}`
      : null;

    /* 🔥 FALLBACK (MPIRA + INITIALS) */
    if (!src || error) {
      return (
        <div className="league-fallback">
          <div className="ball">⚽</div>
          <div className="initials">{getInitials(name)}</div>
        </div>
      );
    }

    return (
      <img
        src={proxyUrl}
        alt={name}
        className="league-logo"
        loading="lazy"
        onError={(e)=>{

          // 🔁 try direct logo
          if (!e.target.dataset.try1 && src) {
            e.target.dataset.try1 = "1";
            e.target.src = src;
          }

          // ❌ mwisho fallback
          else {
            setError(true);
          }

        }}
      />
    );
  };

  /* 🔥 LOAD DATA */
  useEffect(()=>{

    const load = async ()=>{

      const snap = await getDocs(collection(db,"matches"));

      const data = snap.docs.map(doc=>({
        id: doc.id,
        ...doc.data()
      }));

      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;

      const grouped = {};

      data.forEach(match=>{

        if(!match.date) return;

        const matchTime = new Date(match.date.replace(" ","T")+"Z").getTime();

        if((matchTime - now) <= fifteenMinutes) return;

        const leagueName = match.league || "Other";

        if(!grouped[leagueName]){
          grouped[leagueName] = {
            name: leagueName,
            logo: match.logoA || "",
            count: 0
          };
        }

        grouped[leagueName].count++;

      });

      setLeagues(Object.values(grouped));

    };

    load();

  },[]);

  return(

    <div className="league-tabs">

      {leagues.map((league,i)=>(

        <div
          key={i}
          className="league-card"
          onClick={()=>navigate(`/league/${encodeURIComponent(league.name)}`)}
        >

          {/* 🔥 LOGO */}
          <LeagueLogo src={league.logo} name={league.name} />

          <span className="league-name">
            {league.name}
          </span>

          <span className="league-count">
            {league.count}
          </span>

        </div>

      ))}

    </div>

  );

}