import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Live.css";

const failedLogos = new Set();

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

export default function Live() {
  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(6);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const snap = await getDocs(collection(db, "matches"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMatches(data);
      } catch (err) {
        console.error("Load live matches error:", err);
        setMatches([]);
      }
    };

    loadMatches();
  }, []);

  const getInitials = (name) => {
    if (!name) return "FC";

    return String(name)
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  const getServerLogo = (url) => {
    if (!url || failedLogos.has(url)) return "";
    return `${BASE_URL}/logo?url=${encodeURIComponent(url)}`;
  };

  const getWeservLogo = (url) => {
    if (!url) return "";
    if (url.includes("images.weserv.nl")) return url;

    return `https://images.weserv.nl/?url=${url.replace(
      /^https?:\/\//,
      ""
    )}&w=120&h=120&fit=contain`;
  };

  const TeamLogo = ({ logo, name, side, bothMissing }) => {
    const [logoSrc, setLogoSrc] = useState(() => getServerLogo(logo));
    const [error, setError] = useState(false);

    useEffect(() => {
      setLogoSrc(getServerLogo(logo));
      setError(false);
    }, [logo]);

    const bgColor = bothMissing
      ? side === "left"
        ? "#111"
        : "#c62828"
      : "#111";

    if (!logo || error || failedLogos.has(logo)) {
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
        className={`team-logo ${side}`}
        src={logoSrc}
        alt={name || "team logo"}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (logoSrc?.includes(BASE_URL)) {
            setLogoSrc(logo);
            return;
          }

          if (logoSrc === logo) {
            setLogoSrc(getWeservLogo(logo));
            return;
          }

          failedLogos.add(logo);
          setError(true);
        }}
      />
    );
  };

  const liveDuration = 100 * 60 * 1000;

  const liveMatches = matches.filter((m) => {
    if (!m.date) return false;

    const startTime = new Date(String(m.date).replace(" ", "T") + "Z").getTime();
    const diff = now - startTime;

    return diff >= 0 && diff <= liveDuration;
  });

  const renderMatch = (m, i) => {
    const missingA = !m.logoA || failedLogos.has(m.logoA);
    const missingB = !m.logoB || failedLogos.has(m.logoB);
    const bothMissing = missingA && missingB;

    return (
      <div className="match-card" key={m.id || i}>
        <a
          className="open-live"
          href={`https://www.google.com/search?q=${encodeURIComponent(
              `${m.A} vs ${m.B}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Live
        </a>

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
      <h2 style={{ marginBottom: "10px" }}>Live Matches</h2>

      {liveMatches.length === 0 && <div>live matches now</div>}

      {liveMatches.slice(0, visible).map(renderMatch)}

      {visible < liveMatches.length && (
        <div className="more-btn" onClick={() => setVisible((v) => v + 6)}>
          More Live
        </div>
      )}
    </div>
  );
}