import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./SpecialGames.css";

const failedLogos = new Set();

/* 🔥 RING AROUND LOGO (TIME PROGRESS) */
const LogoWithRing = ({
  logo,
  name,
  m,
  side,
  getInitials,
  getFallbackColor,
  date,
  now
}) => {

  const size = 50;
  const stroke = 4;
  const radius = size / 2;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  /* 🔥 PROGRESS BASED ON TIME */
  const matchTime = new Date(date.replace(" ", "T") + "Z").getTime();

  const totalDuration = 2 * 60 * 60 * 1000; // unaweza badilisha

  const timeLeft = matchTime - now;

  let percent = 0;

  if (timeLeft > 0) {
    const timePassed = totalDuration - timeLeft;
    percent = Math.min((timePassed / totalDuration) * 100, 100);
  } else {
    percent = 100;
  }

  const strokeDashoffset =
    circumference - (percent / 100) * circumference;

  return (
    <div className="logo-ring-wrapper">

      <svg width={size} height={size} className="ring">

        <circle
          stroke="#222"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke="#00ff99"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      {logo ? (
        <img
          className="center-logo"
          src={logo}
          onError={() =>
            failedLogos.add(m[`logo${side === "left" ? "A" : "B"}`])
          }
        />
      ) : (
        <div
          className="center-logo logo-fallback"
          style={{ background: getFallbackColor(m, side) }}
        >
          {getInitials(name)}
        </div>
      )}

    </div>
  );
};

const SpecialGames = () => {

  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(4);
  const [now, setNow] = useState(Date.now());

  /* TIMER */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* INITIALS */
  const getInitials = (name) => {
    if (!name) return "FC";
    return name
      .split(" ")
      .map(w => w[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  /* BASE URL */
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  /* LOGO */
  const getLogo = (url) => {
    if (url && !failedLogos.has(url)) {
      return `${BASE_URL}/logo?url=${encodeURIComponent(url)}`;
    }
    return null;
  };

  /* COLOR */
  const getFallbackColor = (m, side) => {
    const aMissing = !m.logoA || failedLogos.has(m.logoA);
    const bMissing = !m.logoB || failedLogos.has(m.logoB);

    if (aMissing && bMissing) {
      return side === "left" ? "#000" : "#ff0000";
    }

    if (side === "left" && aMissing) return "#000";
    if (side === "right" && bMissing) return "#000";

    return "#000";
  };

  /* COUNTDOWN */
  const getTimeLeft = (date) => {
    const matchTime = new Date(date.replace(" ", "T") + "Z").getTime();
    let diff = matchTime - now;

    if (diff <= 0) return "Starting";

    const h = Math.floor(diff / (1000 * 60 * 60));
    diff -= h * (1000 * 60 * 60);

    const m = Math.floor(diff / (1000 * 60));
    diff -= m * (1000 * 60);

    const s = Math.floor(diff / 1000);

    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  /* FETCH */
  useEffect(() => {

    const load = async () => {

      const snap = await getDocs(collection(db, "matches"));

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const fifteenMinutes = 15 * 60 * 1000;

      const special = data.filter(m => {

        if (!m.status || m.status.toLowerCase() !== "ok") return false;
        if (!m.date) return false;

        const matchTime = new Date(m.date.replace(" ", "T") + "Z").getTime();
        const diff = matchTime - now;

        if (diff <= fifteenMinutes) return false;

        return true;
      });

      special.sort((a, b) =>
        new Date(a.date.replace(" ", "T")) -
        new Date(b.date.replace(" ", "T"))
      );

      setMatches(special);
    };

    load();

  }, [now]);

  return (

    <div className="match-list special-games">

      <div className="title-row">
        <h3>🔥 Special Games</h3>

        <button
          className="view-all"
          onClick={() => navigate("/specialgames")}
        >
          PlanGames ➤
        </button>
      </div>

      {matches.slice(0, visible).map((m, i) => {

        const logoA = getLogo(m.logoA);
        const logoB = getLogo(m.logoB);

        return (

          <div
            className="match-card special-card"
            key={m.id || i}
            onClick={() =>
              navigate(`/betscores/${m.id}`, { state: m })
            }
            style={{ cursor: "pointer" }}
          >

            <div className="time-left">
              {getTimeLeft(m.date)}
            </div>

            {/* LEFT */}
            <div className="logo-box">
              <LogoWithRing
                logo={logoA}
                name={m.A}
                m={m}
                side="left"
                getInitials={getInitials}
                getFallbackColor={getFallbackColor}
                date={m.date}
                now={now}
              />
            </div>

            {/* INFO */}
            <div className="match-info">
              <div className="teams">{m.A} VS {m.B}</div>
              <div className="league">{m.league}</div>
            </div>

            {/* RIGHT */}
            <div className="logo-box">
              {logoB ? (
                <img
                  className="team-logo"
                  src={logoB}
                  onError={() => failedLogos.add(m.logoB)}
                />
              ) : (
                <div
                  className="logo-fallback"
                  style={{ background: getFallbackColor(m, "right") }}
                >
                  {getInitials(m.B)}
                </div>
              )}
            </div>

          </div>

        );

      })}

      {visible < matches.length && (
        <div
          className="more-btn"
          onClick={() => setVisible(v => v + 4)}
        >
          SeeMore
        </div>
      )}

      {matches.length === 0 && (
        <div style={{ padding: "10px" }}>
          Waiting special games available
        </div>
      )}

    </div>
  );
};

export default SpecialGames;