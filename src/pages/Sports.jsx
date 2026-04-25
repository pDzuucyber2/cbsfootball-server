
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Sports.css";

/* 🔥 CACHE YA LOGO MBOVU */
const failedLogos = new Set();

/* ✅ BASE COUNTS */
const BASE_COUNTS = {
  upcoming: 289,
  popular: 89,
  all: 1235
};

/* ✅ BACKEND SERVER YA LOGO PROXY */
const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

export default function Sports() {
  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(4);
  const [tab, setTab] = useState("upcoming");
  const [timezone, setTimezone] = useState("Africa/Dar_es_Salaam");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "FC";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, "matches"));

      let data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => {
        const da = new Date(a.date.replace(" ", "T") + "Z").getTime();
        const dbb = new Date(b.date.replace(" ", "T") + "Z").getTime();
        return da - dbb;
      });

      setMatches(data);
    };

    loadMatches();
  }, []);

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const fifteenMinutes = 15 * 60 * 1000;

  const allMatches = matches.filter((m) => {
    const matchTime = new Date(m.date.replace(" ", "T") + "Z").getTime();
    return matchTime > now && matchTime < now + thirtyDays;
  });

  const upcoming = matches.filter((m) => {
    const matchTime = new Date(m.date.replace(" ", "T") + "Z").getTime();
    return matchTime - now > fifteenMinutes;
  });

  const popular = upcoming.slice(0, 50);

  let showMatches = [];
  if (tab === "all") showMatches = allMatches;
  if (tab === "popular") showMatches = popular;
  if (tab === "upcoming") showMatches = upcoming;

  showMatches = showMatches.filter(
    (m) =>
      m.A?.toLowerCase().includes(search.toLowerCase()) ||
      m.B?.toLowerCase().includes(search.toLowerCase()) ||
      m.league?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (date) => {
    const d = new Date(date.replace(" ", "T") + "Z");

    return d.toLocaleString("en-US", {
      timeZone: timezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const Logo = ({ src, name, match, side }) => {
    const [error, setError] = useState(false);

    const proxyUrl = src
      ? `${SERVER_URL}/logo?url=${encodeURIComponent(src)}`
      : null;

    const aMissing = !match.logoA || failedLogos.has(match.logoA);
    const bMissing = !match.logoB || failedLogos.has(match.logoB);

    let bgColor = "#000";

    if (aMissing && bMissing) {
      bgColor = side === "left" ? "#000" : "#ff0000";
    }

    if (!src || error || failedLogos.has(src)) {
      return (
        <div className="logo-fallback" style={{ background: bgColor }}>
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
        onError={(e) => {
          if (!e.target.dataset.try1 && src) {
            e.target.dataset.try1 = "1";
            e.target.src = src;
          } else {
            failedLogos.add(src);
            setError(true);
          }
        }}
      />
    );
  };

  const renderMatch = (m, i) => (
    <div
      className="match-card"
      key={m.id || i}
      onClick={() => navigate(`/betscores/${m.id}`, { state: m })}
    >
      <Logo src={m.logoA} name={m.A} match={m} side="left" />

      <div className="match-info">
        <div className="teams">
          {m.A} <span>VS</span> {m.B}
        </div>
        <div className="league">{m.league}</div>
        <div className="time">{formatTime(m.date)}</div>
      </div>

      <Logo src={m.logoB} name={m.B} match={m} side="right" />
    </div>
  );

  return (
    <div className="match-list">
      <div className="timezone-box">
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
          <option value="Africa/Dar_es_Salaam">East Africa (EAT)</option>
          <option value="UTC">UTC</option>
          <option value="Europe/London">London</option>
          <option value="Asia/Dubai">Dubai</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="America/New_York">New York</option>
        </select>
      </div>

      <div className="sports-select">
        <div
          className={tab === "upcoming" ? "select-box active" : "select-box"}
          onClick={() => {
            setTab("upcoming");
            setVisible(4);
          }}
        >
          <div className="count">{BASE_COUNTS.upcoming + upcoming.length}</div>
          <div className="label">Upcoming</div>
        </div>

        <div
          className={tab === "popular" ? "select-box active" : "select-box"}
          onClick={() => {
            setTab("popular");
            setVisible(4);
          }}
        >
          <div className="count">{BASE_COUNTS.popular + popular.length}</div>
          <div className="label">Popular</div>
        </div>

        <div
          className={tab === "all" ? "select-box active" : "select-box"}
          onClick={() => {
            setTab("all");
            setVisible(4);
          }}
        >
          <div className="count">{BASE_COUNTS.all + allMatches.length}</div>
          <div className="label">ALL</div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search team or league..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {showMatches.slice(0, visible).map(renderMatch)}

      {visible < showMatches.length && (
        <div className="more-btn" onClick={() => setVisible(visible + 4)}>
          AddMore
        </div>
      )}

      {showMatches.length === 0 && (
        <div style={{ padding: "10px" }}>No matches found</div>
      )}
    </div>
  );
}