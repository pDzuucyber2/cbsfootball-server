import { useEffect, useState } from "react";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Virtuals.css";

const failedLogos = new Set();

export default function GoMatchesForReferrer() {
  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(4);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://cbsfootball-server.onrender.com";

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

  const Logo = ({ src, name, match, side }) => {
    const [logoSrc, setLogoSrc] = useState(() => getServerLogo(src));
    const [error, setError] = useState(false);

    useEffect(() => {
      setLogoSrc(getServerLogo(src));
      setError(false);
    }, [src]);

    const aMissing = !match?.logoA || failedLogos.has(match?.logoA);
    const bMissing = !match?.logoB || failedLogos.has(match?.logoB);

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
          setError(true);
        }}
      />
    );
  };

  const parseMatchDate = (dateStr) => {
    if (!dateStr) return null;

    const parsed = new Date(String(dateStr).replace(" ", "T") + "Z");
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed;
  };

  const formatTime = (dateStr) => {
    const d = parseMatchDate(dateStr);
    if (!d) return "-";

    return d.toLocaleString("en-US", {
      timeZone: "Africa/Dar_es_Salaam",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isYesterdayDate = (value) => {
    if (!value) return false;

    let depositDate = null;

    if (typeof value?.toDate === "function") {
      depositDate = value.toDate();
    } else if (value?.seconds) {
      depositDate = new Date(value.seconds * 1000);
    } else {
      depositDate = new Date(value);
    }

    if (!(depositDate instanceof Date) || Number.isNaN(depositDate.getTime())) {
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      depositDate.getFullYear() === yesterday.getFullYear() &&
      depositDate.getMonth() === yesterday.getMonth() &&
      depositDate.getDate() === yesterday.getDate()
    );
  };

  const isTodayMatchAndMoreThan15Min = (dateValue) => {
    const matchDate = parseMatchDate(dateValue);
    if (!matchDate) return false;

    const now = new Date();
    const diff = matchDate.getTime() - now.getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    const eatMatch = new Date(
      matchDate.toLocaleString("en-US", {
        timeZone: "Africa/Dar_es_Salaam",
      })
    );

    const eatNow = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Africa/Dar_es_Salaam",
      })
    );

    const isToday =
      eatMatch.getFullYear() === eatNow.getFullYear() &&
      eatMatch.getMonth() === eatNow.getMonth() &&
      eatMatch.getDate() === eatNow.getDate();

    return isToday && diff > fifteenMinutes;
  };

  const getAllSuccessfulDeposits = async () => {
    const [tshSnap, usdtSnap, visitorSnap] = await Promise.all([
      getDocs(collection(db, "tsh_transactions")),
      getDocs(collection(db, "usdt_transactions")),
      getDocs(collection(standardDb, "visterdeposte")),
    ]);

    const tshDeposits = tshSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      collection: "tsh_transactions",
    }));

    const usdtDeposits = usdtSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      collection: "usdt_transactions",
    }));

    const visitorDeposits = visitorSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      collection: "visterdeposte",
    }));

    return [...tshDeposits, ...usdtDeposits, ...visitorDeposits]
      .filter((tx) => tx.status === "success")
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  };

  const checkEligibility = async () => {
    if (!username) {
      setEligible(false);
      return false;
    }

    const usersSnap = await getDocs(collection(db, "users"));

    const allUsers = usersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const myReferrals = allUsers.filter(
      (u) =>
        String(u.referralBy || u.whoReferredWho || "").toLowerCase() ===
        username.toLowerCase()
    );

    if (myReferrals.length === 0) {
      setEligible(false);
      return false;
    }

    const allDeposits = await getAllSuccessfulDeposits();
    const depositCountMap = {};

    for (const tx of allDeposits) {
      const depositUsername = tx.username || "";

      depositCountMap[depositUsername] =
        (depositCountMap[depositUsername] || 0) + 1;

      const depositOrder =
        tx.depositOrderType ||
        (depositCountMap[depositUsername] === 1
          ? "first"
          : depositCountMap[depositUsername] === 2
          ? "second"
          : "other");

      const referredUserFound = myReferrals.find(
        (u) =>
          String(u.username || "").toLowerCase() ===
          depositUsername.toLowerCase()
      );

      if (
        referredUserFound &&
        depositOrder === "first" &&
        isYesterdayDate(tx.createdAt)
      ) {
        setEligible(true);
        return true;
      }
    }

    setEligible(false);
    return false;
  };

  const loadGoMatches = async () => {
    try {
      setLoading(true);

      const allowed = await checkEligibility();

      if (!allowed) {
        setMatches([]);
        return;
      }

      const goQuery = query(collection(db, "matches"), where("status", "==", "GO"));

      const snap = await getDocs(goQuery);

      const data = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((m) => isTodayMatchAndMoreThan15Min(m.date))
        .sort((a, b) => {
          const da = parseMatchDate(a.date)?.getTime() || 0;
          const dbb = parseMatchDate(b.date)?.getTime() || 0;
          return da - dbb;
        });

      setMatches(data);
    } catch (error) {
      console.log("Failed to load GO matches:", error);
      setMatches([]);
      setEligible(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoMatches();
  }, []);

  const showMatches = matches.filter(
    (m) =>
      m.A?.toLowerCase().includes(search.toLowerCase()) ||
      m.B?.toLowerCase().includes(search.toLowerCase()) ||
      m.league?.toLowerCase().includes(search.toLowerCase())
  );

  const renderMatch = (m, i) => (
    <div
      className="match-card"
      key={m.id || i}
      onClick={() => navigate(`/betscores/${m.id}`, { state: m })}
    >
      <div className="match-side left-side">
        <div className="side-label">Score</div>
        <div className="side-value">{m.score || "-"}</div>
        <Logo src={m.logoA} name={m.A} match={m} side="left" />
      </div>

      <div className="match-info">
        <div className="teams">
          {m.A} <span>VS</span> {m.B}
        </div>
        <div className="league">{m.league}</div>
        <div className="time">{formatTime(m.date)}</div>
      </div>

      <div className="match-side right-side">
        <div className="side-label">Odds</div>
        <div className="side-value">{m.odds || "-"}</div>
        <Logo src={m.logoB} name={m.B} match={m} side="right" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="match-list">
        <div style={{ padding: "20px", color: "#fff" }}>Loading...</div>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="match-list">
        <div className="promo-info-box">
          <h2 className="promo-title">First Games Promotion</h2>

          <p className="promo-text">
            This page is available only to users who qualify for the free agent
            matches promotion.
          </p>

          <p className="promo-text">
            To get access, at least one of your referred users must have made
            their first deposit yesterday.
          </p>

          <p className="promo-text">
            Example: if your referred user made their first deposit yesterday,
            you will receive access to today&apos;s First Games Promotion.
          </p>

          <p className="promo-text">
            If any of your referred users makes their first deposit today, you
            will receive free first games tomorrow with odds ranging from 1.5% to
            3.5%.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-list">
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
        <div style={{ padding: "10px", color: "#fff" }}>No matches found</div>
      )}
    </div>
  );
}