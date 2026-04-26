import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./SpecialGames.css";

const failedLogos = new Set();

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

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

const LogoWithRing = ({
  src,
  name,
  m,
  side,
  getInitials,
  getFallbackColor,
  date,
  now,
}) => {
  const [logoSrc, setLogoSrc] = useState(() => getServerLogo(src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLogoSrc(getServerLogo(src));
    setFailed(false);
  }, [src]);

  const size = 50;
  const stroke = 4;
  const radius = size / 2;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const matchTime = new Date(String(date).replace(" ", "T") + "Z").getTime();
  const totalDuration = 2 * 60 * 60 * 1000;
  const timeLeft = matchTime - now;

  let percent = 0;

  if (timeLeft > 0) {
    const timePassed = totalDuration - timeLeft;
    percent = Math.min((timePassed / totalDuration) * 100, 100);
  } else {
    percent = 100;
  }

  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const rawLogoKey = side === "left" ? "logoA" : "logoB";
  const rawLogo = m?.[rawLogoKey];

  const showFallback = !src || failed || failedLogos.has(rawLogo);

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

      {showFallback ? (
        <div
          className="center-logo logo-fallback"
          style={{ background: getFallbackColor(m, side) }}
        >
          {getInitials(name)}
        </div>
      ) : (
        <img
          className="center-logo"
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

            failedLogos.add(rawLogo);
            setFailed(true);
          }}
        />
      )}
    </div>
  );
};

const TeamLogo = ({ src, name, m, side, getInitials, getFallbackColor }) => {
  const [logoSrc, setLogoSrc] = useState(() => getServerLogo(src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLogoSrc(getServerLogo(src));
    setFailed(false);
  }, [src]);

  const rawLogoKey = side === "left" ? "logoA" : "logoB";
  const rawLogo = m?.[rawLogoKey];

  if (!src || failed || failedLogos.has(rawLogo)) {
    return (
      <div
        className="logo-fallback"
        style={{ background: getFallbackColor(m, side) }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      className="team-logo"
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

        failedLogos.add(rawLogo);
        setFailed(true);
      }}
    />
  );
};

const SpecialGames = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(4);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
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

  const getTimeLeft = (date) => {
    const matchTime = new Date(String(date).replace(" ", "T") + "Z").getTime();
    let diff = matchTime - now;

    if (diff <= 0) return "Starting";

    const h = Math.floor(diff / (1000 * 60 * 60));
    diff -= h * (1000 * 60 * 60);

    const m = Math.floor(diff / (1000 * 60));
    diff -= m * (1000 * 60);

    const s = Math.floor(diff / 1000);

    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "matches"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fifteenMinutes = 15 * 60 * 1000;
        const currentTime = Date.now();

        const special = data.filter((m) => {
          if (!m.status || String(m.status).toLowerCase() !== "ok") return false;
          if (!m.date) return false;

          const matchTime = new Date(
            String(m.date).replace(" ", "T") + "Z"
          ).getTime();

          const diff = matchTime - currentTime;

          return diff > fifteenMinutes;
        });

        special.sort(
          (a, b) =>
            new Date(String(a.date).replace(" ", "T") + "Z").getTime() -
            new Date(String(b.date).replace(" ", "T") + "Z").getTime()
        );

        setMatches(special);
      } catch (err) {
        console.error("Load special games error:", err);
        setMatches([]);
      }
    };

    load();
  }, []);

  return (
    <div className="match-list special-games">
      <div className="title-row">
        <h3>🔥 Special Games</h3>

        <button className="view-all" onClick={() => navigate("/specialgames")}>
          PlanGames ➤
        </button>
      </div>

      {matches.slice(0, visible).map((m, i) => (
        <div
          className="match-card special-card"
          key={m.id || i}
          onClick={() => navigate(`/betscores/${m.id}`, { state: m })}
          style={{ cursor: "pointer" }}
        >
          <div className="time-left">{getTimeLeft(m.date)}</div>

          <div className="logo-box">
            <LogoWithRing
              src={m.logoA}
              name={m.A}
              m={m}
              side="left"
              getInitials={getInitials}
              getFallbackColor={getFallbackColor}
              date={m.date}
              now={now}
            />
          </div>

          <div className="match-info">
            <div className="teams">
              {m.A} VS {m.B}
            </div>
            <div className="league">{m.league}</div>
          </div>

          <div className="logo-box">
            <TeamLogo
              src={m.logoB}
              name={m.B}
              m={m}
              side="right"
              getInitials={getInitials}
              getFallbackColor={getFallbackColor}
            />
          </div>
        </div>
      ))}

      {visible < matches.length && (
        <div className="more-btn" onClick={() => setVisible((v) => v + 4)}>
          SeeMore
        </div>
      )}

      {matches.length === 0 && (
        <div style={{ padding: "10px" }}>Waiting special games available</div>
      )}
    </div>
  );
};

export default SpecialGames;