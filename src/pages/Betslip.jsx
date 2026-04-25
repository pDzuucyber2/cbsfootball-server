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
import "./Betslip.css";
import { useBalance } from "../context/BalanceContext";

const failedLogos = new Set();

const SolarLoader = () => (
  <div className="betslip-loader-screen">
    <img src="/images/player.png" className="betslip-loader-bg" alt="loading" />
    <div className="betslip-loader-overlay"></div>

    <div className="betslip-loader-content">
      <div className="betslip-solar-system">
        <div className="betslip-orbit betslip-orbit-one">
          <span className="betslip-planet-ball">⚽</span>
        </div>

        <div className="betslip-orbit betslip-orbit-two">
          <span className="betslip-planet-ball small">⚽</span>
        </div>

        <div className="betslip-sun">
          <img src="/favicon.ico" alt="logo" />
        </div>
      </div>

      <p>Loading Betslip...</p>
    </div>
  </div>
);

export default function Betslip() {
  const [antBets, setAntBets] = useState([]);
  const [correctBets, setCorrectBets] = useState([]);
  const [matchesMap, setMatchesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ant");

  const { setBalances } = useBalance();

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
       : "https://cbsfootball.onrender.com";

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
    return isNaN(parsed) ? 0 : parsed;
  };

  const sortByLatest = (a, b) => {
    const t1 = getTimeValue(a.createdAt) || getTimeValue(a.matchTimestamp) || 0;
    const t2 = getTimeValue(b.createdAt) || getTimeValue(b.matchTimestamp) || 0;
    return t2 - t1;
  };

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
        const correctSnap = await getDocs(
          collection(standardDb, "correctscore")
        );

        const antData = antSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.username === username && !b.result)
          .sort(sortByLatest);

        const correctData = correctSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.username === username && !b.result)
          .sort(sortByLatest);

        setAntBets(antData);
        setCorrectBets(correctData);
      } catch (err) {
        console.error("Failed to load betslip:", err);
      } finally {
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

  const Countdown = ({ timestamp }) => {
    const [time, setTime] = useState("");

    useEffect(() => {
      const update = () => {
        if (!timestamp) return;

        const matchDate = timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        const diff = matchDate - new Date();

        if (diff <= -20 * 60 * 1000) {
          setTime("STARTED");
          return;
        }

        if (diff <= 0) {
          setTime("STARTING");
          return;
        }

        const s = Math.floor(diff / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;

        setTime(`${h}h ${m}m ${sec}s`);
      };

      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }, [timestamp]);

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

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const Logo = memo(({ src, name, side, match }) => {
    const [error, setError] = useState(false);

    const proxyUrl = src
      ? `${BASE_URL}/logo?url=${encodeURIComponent(src)}`
      : null;

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
        src={proxyUrl}
        alt={name}
        className="team-logo"
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
  });

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

      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );

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

      if (tab === "ant") {
        setAntBets((prev) => prev.filter((b) => b.id !== bet.id));
      } else {
        setCorrectBets((prev) => prev.filter((b) => b.id !== bet.id));
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling bet");
    }
  };

  if (loading) {
    return <SolarLoader />;
  }

  const list = tab === "ant" ? antBets : correctBets;

  return (
    <div className="mybets">
      <h2>Betslip</h2>

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
        <div className="no-bets">No pending bets</div>
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

              <Countdown timestamp={bet.matchTimestamp} />

              <div className="teams-row">
                <Logo src={logoA} name={bet.teamA} side="left" match={match} />

                <div className="vs">
                  {bet.teamA} <span>VS</span> {bet.teamB}
                </div>

                <Logo src={logoB} name={bet.teamB} side="right" match={match} />
              </div>

              <div className="match-time">{formatMatchTime(bet)}</div>
              <div className="league-box">{bet.league}</div>

              <div className="bet-time">
                YourPickTime: {formatCreatedAt(bet)}
              </div>

              <div className="bottom-row">
                <span>
                  Amount: {bet.amount} {bet.currency}
                </span>

                <span className="win">TotalProfit: {bet.totalWin}</span>
              </div>

              <div className="time">Profit: {bet.profit}</div>
              <div className="status">PENDING</div>

              {canCancel(bet) && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(bet)}
                >
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