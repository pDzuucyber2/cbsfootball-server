import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./LeagueMatches.css";

const failedLogos = new Set();

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

export default function LeagueMatches() {
  const { leagueName } = useParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(6);

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

  const getFallbackColor = (match, side) => {
    const aMissing = !match.logoA || failedLogos.has(match.logoA);
    const bMissing = !match.logoB || failedLogos.has(match.logoB);

    if (aMissing && bMissing) {
      return side === "left" ? "#111" : "#c62828";
    }

    return "#111";
  };

  const TeamLogo = ({ src, name, match, side }) => {
    const [logoSrc, setLogoSrc] = useState(() => getServerLogo(src));
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      setLogoSrc(getServerLogo(src));
      setFailed(false);
    }, [src]);

    if (!src || failed || failedLogos.has(src)) {
      return (
        <div
          className={`logo-fallback ${side}`}
          style={`{ background: getFallbackColor(match, side) }`}
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
            setLogoSrc(src);
            return;
          }

          if (logoSrc === src) {
            setLogoSrc(getWeservLogo(src));
            return;
          }

          failedLogos.add(src);
          setFailed(true);
        }}
      />
    );
  };

  useEffect(() => {
    const loadMatches = async () => {
      const snap = await getDocs(collection(db, "matches"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      const currentLeague = decodeURIComponent(leagueName || "");

      const filtered = data.filter((m) => {
        if (!m.date || !m.league) return false;
        if (m.league !== currentLeague) return false;

        const matchTime = new Date(
          String(m.date).replace(" ", "T") + "Z"
        ).getTime();

        return matchTime - now > fifteenMinutes;
      });

      filtered.sort((a, b) => {
        const da = new Date(String(a.date).replace(" ", "T") + "Z").getTime();
        const dbb = new Date(String(b.date).replace(" ", "T") + "Z").getTime();

        return da - dbb;
      });

      setMatches(filtered);
    };

    loadMatches();
  }, [leagueName]);

  const formatDateTime = (date) => {
    const d = new Date(String(date).replace(" ", "T") + "Z");

    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Dar_es_Salaam",
    });
  };

  return (
    <div className="match-list">
      <div style={{ marginBottom: 15 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "6px 12px",
            border: "none",
            background: "#081c34",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      <h2 style={{ marginBottom: 15 }}>{decodeURIComponent(leagueName)}</h2>

      {matches.slice(0, visible).map((m, i) => (
        <div
          className="match-card"
          key={m.id || i}
          onClick={() => navigate(`/betscores/${m.id}`, { state: m })}
          style={{ cursor: "pointer" }}
        >
          <TeamLogo src={m.logoA} name={m.A} match={m} side="left" />

          <div className="match-info">
            <div className="teams">
              {m.A} <span>VS</span> {m.B}
            </div>

            <div className="league">{m.league}</div>

            <div className="time">{formatDateTime(m.date)}</div>
          </div>

          <TeamLogo src={m.logoB} name={m.B} match={m} side="right" />
        </div>
      ))}

      {visible < matches.length && (
        <div className="more-btn" onClick={() => setVisible(visible + 6)}>
          See More
        </div>
      )}

      {matches.length === 0 && (
        <div style={{ padding: "10px" }}>Waiting matches available</div>
      )}
    </div>
  );
}