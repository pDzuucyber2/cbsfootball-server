import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import "./BetScores.css";

/* 🔥 CACHE */
const failedLogos = new Set();

export default function BetScores() {

  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(state || null);
  const [scores, setScores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("ant");

  /* 🔥 BASE URL */
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
       : "https://cbsfootball.onrender.com";

  /* 🔥 reload fix */
  useEffect(() => {
    if (!match && id) {
      const fetchMatch = async () => {
        const ref = doc(db, "matches", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setMatch(snap.data());
      };
      fetchMatch();
    }
  }, [id, match]);

  /* 🔥 LOAD SCORES */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(standardDb, "scoreOdds"),
      (snap) => {
        setScores(snap.docs.map((d) => d.data()));
      }
    );
    return () => unsub();
  }, []);

  if (!match) return <div className="loading">Loading...</div>;

  /* 🔥 INITIALS */
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  /* 🔥 FORMAT ODDS (SMART %) */
  const formatOdds = (odds) => {
    if (!odds) return "-";
    return odds.toString().includes("%") ? odds : `${odds}%`;
  };

  /* 🔥 TEAM LOGO */
  const TeamLogo = ({ logo, name, side }) => {

    const [error, setError] = useState(false);

    const proxyUrl = logo
      ? `${BASE_URL}/logo?url=${encodeURIComponent(logo)}`
      : null;

    const aMissing = !match.logoA || failedLogos.has(match.logoA);
    const bMissing = !match.logoB || failedLogos.has(match.logoB);

    let bgColor = "#000";

    if (aMissing && bMissing) {
      bgColor = side === "left" ? "#000" : "#ff0000";
    }

    if (!logo || error || failedLogos.has(logo)) {
      return (
        <div className="logo-fallback" style={{ background: bgColor }}>
          {getInitials(name)}
        </div>
      );
    }

    return (
      <img
        src={proxyUrl}
        alt={name}
        className="team-logo"
        loading="lazy"
        onError={(e) => {
          if (!e.target.dataset.try1 && logo) {
            e.target.dataset.try1 = "1";
            e.target.src = logo;
          } else {
            failedLogos.add(logo);
            setError(true);
          }
        }}
      />
    );
  };

  /* 🔥 CLICK */
  const handleClick = (item) => {
    setSelected(item);

    setTimeout(() => {
      navigate("/betplace", {
        state: {
          match,
          selection: {
            score: item.score,
            odds: item.odds,
            mode: tab
          }
        }
      });
    }, 200);
  };

  return (
    <div className="bet-page">

      {/* 🔥 HEADER */}
      <div className="bet-header">

        <div className="teams">

          <div className="team">
            <TeamLogo logo={match.logoA} name={match.A} side="left" />
            <span>{match.A}</span>
          </div>

          <span className="vs">VS</span>

          <div className="team">
            <TeamLogo logo={match.logoB} name={match.B} side="right" />
            <span>{match.B}</span>
          </div>

        </div>

        <p className="league">{match.league}</p>
      </div>

      {/* 🔥 TABS */}
      <div className="tabs">

        <div
          className={tab === "ant" ? "tab active" : "tab"}
          onClick={() => {
            setTab("ant");
            setSelected(null);
          }}
        >
          Ant Score
        </div>

        <div
          className={tab === "correct" ? "tab active" : "tab"}
          onClick={() => {
            setTab("correct");
            setSelected(null);
          }}
        >
          Correct Score
        </div>

      </div>

      {/* 🔥 GRID */}
      <div className="score-grid">

        {scores.map((item, i) => (
          <div
            key={i}
            className={
              selected?.score === item.score
                ? "score-card active"
                : "score-card"
            }
            onClick={() => handleClick(item)}
          >

            <div className="score">{item.score}</div>

            <div className="odds">
              {tab === "correct"
                ? "25% / 35% / 50%"
                : formatOdds(item.odds)}
            </div>

          </div>
        ))}

      </div>

      {/* 🔥 SELECTED */}
      {selected && (
        <div className="bet-box">
          Selected: {selected.score} (
          {tab === "correct"
            ? "25% / 35% / 50%"
            : formatOdds(selected.odds)}
          )
        </div>
      )}

    </div>
  );
}