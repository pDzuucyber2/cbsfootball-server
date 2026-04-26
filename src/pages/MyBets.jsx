import React, { useEffect, useState, memo } from "react";
import { standardDb } from "../firebaseStandard";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import "./MyBets.css";
import { useBalance } from "../context/BalanceContext";

const failedLogos = new Set();

const SolarLoader = () => (
  <div className="mybets-loader-screen">
    <img src="/images/player.png" className="mybets-loader-bg" alt="loading" />
    <div className="mybets-loader-overlay"></div>

    <div className="mybets-loader-content">
      <div className="mybets-solar-system">
        <div className="mybets-orbit mybets-orbit-one">
          <span className="mybets-planet-ball">⚽</span>
        </div>

        <div className="mybets-orbit mybets-orbit-two">
          <span className="mybets-planet-ball small">⚽</span>
        </div>

        <div className="mybets-sun">
          <img src="/favicon.ico" alt="logo" />
        </div>
      </div>

      <p>Loading My Bets...</p>
    </div>
  </div>
);

export default function MyBets() {
  const [antBets, setAntBets] = useState([]);
  const [correctBets, setCorrectBets] = useState([]);
  const [matchesMap, setMatchesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ant");

  const { setBalances } = useBalance();

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://cbsfootball-server.onrender.com";

  const fieldMap = {
    TZS: "tshBalance",
    USDT: "usdtBalance",
    KES: "KESBalance",
    UGX: "UGXBalance",
    RWF: "RWFBalance",
    BIF: "BIFBalance",
    ZMW: "ZMWBalance",
    MWK: "MWKBalance",
    MZN: "MZNBalance",
    USD: "USDBalance",
    SSP: "SSPBalance",
    BWP: "BWPBalance",
    MGA: "MGABalance",
  };

  const normalize = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const getTimeValue = (value) => {
    if (!value) return 0;
    if (typeof value?.toDate === "function") return value.toDate().getTime();
    if (value?.seconds) return value.seconds * 1000;

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getStatusPriority = (bet) => {
    if (!bet.result) return 0;
    if (bet.result === "win") return 1;
    if (bet.result === "lose") return 2;
    if (bet.result === "cancelled") return 3;
    return 4;
  };

  const sortBetsSmart = (a, b) => {
    const statusDiff = getStatusPriority(a) - getStatusPriority(b);
    if (statusDiff !== 0) return statusDiff;

    const t1 = getTimeValue(a.createdAt) || getTimeValue(a.matchTimestamp) || 0;
    const t2 = getTimeValue(b.createdAt) || getTimeValue(b.matchTimestamp) || 0;

    return t2 - t1;
  };

  const getInitials = (name) => {
    if (!name) return "FC";

    return String(name)
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
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

  const Logo = memo(({ src, name, side, match }) => {
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
        src={logoSrc}
        alt={name || "team logo"}
        className="team-logo"
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
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const username = localStorage.getItem("username");

        const matchSnap = await getDocs(collection(db, "matches"));

        const map = {};
        matchSnap.docs.forEach((docSnap) => {
          const m = docSnap.data();
          const key = `${normalize(m.A)}_${normalize(m.B)}`;
          map[key] = m;
        });

        setMatchesMap(map);

        const antSnap = await getDocs(collection(standardDb, "antscore"));
        const correctSnap = await getDocs(collection(standardDb, "correctscore"));

        const antData = antSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.username === username)
          .sort(sortBetsSmart);

        const correctData = correctSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.username === username)
          .sort(sortBetsSmart);

        setAntBets(antData);
        setCorrectBets(correctData);

        setTimeout(() => setLoading(false), 1500);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCreatedAt = (bet) => {
    if (!bet.createdAt) return "-";

    const date = bet.createdAt.toDate
      ? bet.createdAt.toDate()
      : new Date(bet.createdAt);

    return date.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  const canCancel = (bet) => {
    if (!bet.createdAt) return false;

    const created = bet.createdAt.toDate
      ? bet.createdAt.toDate()
      : new Date(bet.createdAt);

    return new Date() - created <= 15 * 60 * 1000;
  };

  const formatMatchTime = (bet) => {
    if (!bet.matchTimestamp) return "-";

    const date = bet.matchTimestamp.toDate
      ? bet.matchTimestamp.toDate()
      : new Date(bet.matchTimestamp);

    return `${date.toLocaleDateString("en-GB")} • ${date.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;
  };

  const Countdown = ({ timestamp, result }) => {
    const [time, setTime] = useState("");

    useEffect(() => {
      const update = () => {
        if (!timestamp) return;

        if (result === "win") return setTime("WON");
        if (result === "lose") return setTime("LOST");
        if (result === "cancelled") return setTime("CANCELLED");

        const matchDate = timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        const diff = matchDate - new Date();

        if (diff <= -20 * 60 * 1000) return setTime("STARTED");
        if (diff <= 0) return setTime("STARTING");

        const s = Math.floor(diff / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;

        setTime(`${h}h ${m}m ${sec}s`);
      };

      update();
      const interval = setInterval(update, 1000);

      return () => clearInterval(interval);
    }, [timestamp, result]);

    return <div className="countdown">{time}</div>;
  };

  const getLogos = (bet) => {
    const key = `${normalize(bet.teamA)}_${normalize(bet.teamB)}`;
    const match = matchesMap[key];

    return {
      logoA: match?.logoA || null,
      logoB: match?.logoB || null,
    };
  };

  const getStatus = (bet) => {
    if (!bet.result) return "PENDING";
    if (bet.result === "win") return "WON";
    if (bet.result === "lose") return "LOST";
    if (bet.result === "cancelled") return "CANCELLED";
    return "PENDING";
  };

  const getBetId = (bet) =>
    bet.betId || `#${bet.id?.slice(0, 12) || "--------"}`;

  const handleCancel = async (bet) => {
    try {
      if (bet.result) return;
      if (!window.confirm("Cancel this bet?")) return;

      const username = localStorage.getItem("username");

      setBalances((prev) => ({
        ...prev,
        [bet.currency]: (prev[bet.currency] || 0) + Number(bet.amount),
      }));

      const q = query(collection(db, "users"), where("username", "==", username));
      const userQuery = await getDocs(q);

      if (userQuery.empty) {
        alert("User not found");
        return;
      }

      const userDoc = userQuery.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      const field = fieldMap[bet.currency];

      await updateDoc(userRef, {
        [field]: Number(userDoc.data()[field] || 0) + Number(bet.amount),
      });

      await updateDoc(
        doc(standardDb, tab === "ant" ? "antscore" : "correctscore", bet.id),
        { result: "cancelled" }
      );

      alert("Bet cancelled & refunded ✅");

      setAntBets((prev) =>
        prev
          .map((b) => (b.id === bet.id ? { ...b, result: "cancelled" } : b))
          .sort(sortBetsSmart)
      );

      setCorrectBets((prev) =>
        prev
          .map((b) => (b.id === bet.id ? { ...b, result: "cancelled" } : b))
          .sort(sortBetsSmart)
      );
    } catch (err) {
      console.error(err);
      alert("Error cancelling bet");
    }
  };

  if (loading) {
    return <SolarLoader />;
  }

  const list = (tab === "ant" ? antBets : correctBets).sort(sortBetsSmart);

  return (
    <div className="mybets">
      <h2>My Bets</h2>

      <div className="tabs">
        <div
          className={tab === "ant" ? "tab active" : "tab"}
          onClick={() => setTab("ant")}
        >
          AntScore({antBets.length})
        </div>

        <div
          className={tab === "correct" ? "tab active" : "tab"}
          onClick={() => setTab("correct")}
        >
          CorrectScore({correctBets.length})
        </div>
      </div>

      {list.length === 0 ? (
        <div className="no-bets">No bets found</div>
      ) : (
        list.map((bet, i) => {
          const { logoA, logoB } = getLogos(bet);
          const match = { logoA, logoB };

          return (
            <div key={bet.id || i} className="bet-card">
              <div className="top-tags">
                <span className="tag left">Score: {bet.score}</span>
                <span className="tag center">{getBetId(bet)}</span>
                <span className="tag right">Odds: {bet.odds}</span>
              </div>

              <Countdown timestamp={bet.matchTimestamp} result={bet.result} />

              <div className="teams-row">
                <Logo src={logoA} name={bet.teamA} side="left" match={match} />

                <div className="vs">
                  {bet.teamA} <span>VS</span> {bet.teamB}
                </div>

                <Logo src={logoB} name={bet.teamB} side="right" match={match} />
              </div>

              <div className="match-time">{formatMatchTime(bet)}</div>
              <div className="league-box">{bet.league}</div>

              <div className="bet-time">YourPickTime: {formatCreatedAt(bet)}</div>

              <div className="bottom-row">
                <span>
                  Amount: {bet.amount} {bet.currency}
                </span>

                <span className="win">TotalProfit: {bet.totalWin}</span>
              </div>

              <div className="time">Profit: {bet.profit}</div>

              <div className={`status ${getStatus(bet).toLowerCase()}`}>
                {getStatus(bet)}
              </div>

              {getStatus(bet) === "PENDING" && canCancel(bet) && (
                <button className="cancel-btn" onClick={() => handleCancel(bet)}>
                  Cancel
                </button>
              )}

              <div className="time">
                {bet.matchDate} {bet.matchTime}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}