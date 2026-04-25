import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import "./Live.css";

export default function Live() {

  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(6);
  const [now, setNow] = useState(Date.now());

  /* 🔥 BASE URL */
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  /* REFRESH TIME */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  /* LOAD MATCHES */
  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, "matches"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMatches(data);
    };
    loadMatches();
  }, []);

  /* 🔥 INITIALS */
  const getInitials = (name) => {
    if (!name) return "FC";
    return name
      .split(" ")
      .map(w => w[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  /* 🔥 TEAM LOGO FINAL */
  const TeamLogo = ({ logo, name, side, bothMissing }) => {

    const [error, setError] = useState(false);

    const proxyUrl = logo
      ? `${BASE_URL}/logo?url=${encodeURIComponent(logo)}`
      : null;

    /* 🎯 COLOR LOGIC */
    const bgColor = bothMissing
      ? (side === "left" ? "#111" : "#c62828")
      : "#111";

    if (!logo || error) {
      return (
        <div
          className={`logo-fallback ${side}`}
          style={{ background: bgColor }}
        >
          {getInitials(name)}
        </div>
      );
    }

    return (
      <img
        className="team-logo"
        src={proxyUrl}
        alt={name}
        loading="lazy"
        onError={(e)=>{

          // try direct
          if (!e.target.dataset.try1 && logo) {
            e.target.dataset.try1 = "1";
            e.target.src = logo;
          }

          // mwisho fallback
          else {
            setError(true);
          }

        }}
      />
    );
  };

  /* LIVE RANGE */
  const liveDuration = 100 * 60 * 1000;

  const liveMatches = matches.filter(m => {

    if (!m.date) return false;

    const startTime = new Date(m.date.replace(" ", "T") + "Z").getTime();
    const diff = now - startTime;

    return diff >= 0 && diff <= liveDuration;
  });

  /* MATCH CARD */
  const renderMatch = (m, i) => {

    const missingA = !m.logoA;
    const missingB = !m.logoB;
    const bothMissing = missingA && missingB;

    return (
      <div className="match-card" key={m.id || i}>

        <a
          className="open-live"
          href={`https://www.google.com/search?q=${m.A}+vs+${m.B}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Live
        </a>

        {/* TEAM A */}
        <TeamLogo
          logo={m.logoA}
          name={m.A}
          side="left"
          bothMissing={bothMissing}
        />

        <div className="match-info">

          <div className="teams">
            {m.A} <span>VS</span> {m.B}
          </div>

          <div className="league">{m.league}</div>

          <div className="time">
            <span className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </span>
          </div>

        </div>

        {/* TEAM B */}
        <TeamLogo
          logo={m.logoB}
          name={m.B}
          side="right"
          bothMissing={bothMissing}
        />

      </div>
    );
  };

  return (

    <div className="match-list">

      <h2 style={{ marginBottom: "10px" }}>
        Live Matches
      </h2>

      {liveMatches.length === 0 && (
        <div> live matches now</div>
      )}

      {liveMatches.slice(0, visible).map(renderMatch)}

      {visible < liveMatches.length && (
        <div
          className="more-btn"
          onClick={() => setVisible(visible + 6)}
        >
          More Live
        </div>
      )}

    </div>
  );
}