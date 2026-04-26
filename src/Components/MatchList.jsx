import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MatchList.css";

const failedLogos = new Set();

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

const MatchList = () => {
  const navigate = useNavigate();

  const [todayMatches, setTodayMatches] = useState([]);
  const [tomorrowMatches, setTomorrowMatches] = useState([]);
  const [visible, setVisible] = useState(4);
  const [tab, setTab] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [search, setSearch] = useState("");

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

  const getFallbackColor = (m, side) => {
    const aMissing = !m.logoA || failedLogos.has(m.logoA);
    const bMissing = !m.logoB || failedLogos.has(m.logoB);

    if (aMissing && bMissing) {
      return side === "left" ? "#000" : "#ff0000";
    }

    return "#000";
  };

  const Logo = ({ src, name, match, side }) => {
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
          style={{ background: getFallbackColor(match, side) }}
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

  const getDate = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const snap = await getDocs(collection(db, "matches"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fifteenMinutes = 15 * 60 * 1000;
        const today = getDate(0);
        const tomorrow = getDate(1);

        const tdy = [];
        const tmr = [];
        const currentTime = Date.now();

        data.forEach((m) => {
          if (!m.date) return;

          const matchDate = String(m.date).split(" ")[0];
          const matchTime = new Date(
            String(m.date).replace(" ", "T") + "Z"
          ).getTime();

          if (!matchTime) return;

          const diff = matchTime - currentTime;

          if (diff <= fifteenMinutes) return;

          if (matchDate === today) tdy.push(m);
          if (matchDate === tomorrow) tmr.push(m);
        });

        const sortFn = (a, b) =>
          new Date(String(a.date).replace(" ", "T") + "Z") -
          new Date(String(b.date).replace(" ", "T") + "Z");

        tdy.sort(sortFn);
        tmr.sort(sortFn);

        setTodayMatches(tdy);
        setTomorrowMatches(tmr);
      } catch (err) {
        console.error("Load matches error:", err);
      }
    };

    loadMatches();
  }, []);

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

  const rawList = tab === "today" ? todayMatches : tomorrowMatches;

  const list = rawList.filter(
    (m) =>
      m.A?.toLowerCase().includes(search.toLowerCase()) ||
      m.B?.toLowerCase().includes(search.toLowerCase()) ||
      m.league?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="match-list">
      <div className="title-row">
        <h3>Matches</h3>

        <button className="view-all" onClick={() => navigate("/sports")}>
          View All ➤
        </button>
      </div>

      <div className="tabs">
        <div
          className={tab === "today" ? "tab active" : "tab"}
          onClick={() => {
            setTab("today");
            setVisible(4);
          }}
        >
          Today({112 + todayMatches.length}) ▷
        </div>

        <div
          className={tab === "tomorrow" ? "tab active" : "tab"}
          onClick={() => {
            setTab("tomorrow");
            setVisible(4);
          }}
        >
          Tomorrow({212 + tomorrowMatches.length}) ▷
        </div>
      </div>

      {tab && (
        <input
          type="text"
          placeholder="Search team or league..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      )}

      {tab &&
        list.slice(0, visible).map((m, i) => (
          <div
            className="match-card"
            key={m.id || i}
            onClick={() => navigate(`/betscores/${m.id}`, { state: m })}
            style={{ cursor: "pointer" }}
          >
            <div className="time-left">
              {tab === "today" ? getTimeLeft(m.date) : formatDateTime(m.date)}
            </div>

            <div className="logo-box">
              <Logo src={m.logoA} name={m.A} match={m} side="left" />
            </div>

            <div className="match-info">
              <div className="teams">
                {m.A} VS {m.B}
              </div>
              <div className="league">{m.league}</div>
            </div>

            <div className="logo-box">
              <Logo src={m.logoB} name={m.B} match={m} side="right" />
            </div>
          </div>
        ))}

      {tab && visible < list.length && (
        <div className="more-btn" onClick={() => setVisible((v) => v + 4)}>
          SeeMore
        </div>
      )}

      {tab && list.length === 0 && (
        <div style={{ padding: "10px" }}>Loading... matches</div>
      )}
    </div>
  );
};

export default MatchList;