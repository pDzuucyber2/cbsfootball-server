import React, { useEffect, useState, memo } from "react";
import { standardDb } from "../firebaseStandard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./AdminGenerationMatches.css";

const failedLogos = new Set();

export default function Betslip() {
  const [antBets, setAntBets] = useState([]);
  const [correctBets, setCorrectBets] = useState([]);
  const [matchesMap, setMatchesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ant");

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

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
        const correctSnap = await getDocs(collection(standardDb, "correctscore"));

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

  const formatMatchDate = (bet) => {
    if (bet.matchTimestamp) {
      const date = bet.matchTimestamp.toDate
        ? bet.matchTimestamp.toDate()
        : new Date(bet.matchTimestamp);

      return date.toLocaleDateString("en-GB");
    }

    return bet.matchDate || "-";
  };

  const formatMatchOnlyTime = (bet) => {
    if (bet.matchTimestamp) {
      const date = bet.matchTimestamp.toDate
        ? bet.matchTimestamp.toDate()
        : new Date(bet.matchTimestamp);

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (bet.matchTime) {
      const raw = String(bet.matchTime).trim();

      if (/am|pm/i.test(raw)) {
        return raw.toUpperCase();
      }

      const match = raw.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        let hour = Number(match[1]);
        const minute = match[2];
        const suffix = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
      }

      return raw;
    }

    return "-";
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
    String(name || "")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const formatBannerMatch = (bet) => {
    const a = (bet.teamA || "").toUpperCase();
    const b = (bet.teamB || "").toUpperCase();
    return `${a} VS ${b}`;
  };

  const Logo = memo(({ src, name }) => {
    const [error, setError] = useState(false);

    const proxyUrl = src
      ? `${BASE_URL}/logo?url=${encodeURIComponent(src)}`
      : null;

    if (!src || error || failedLogos.has(src)) {
      return <div className="team-fallback">{getInitials(name)}</div>;
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

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/logo192.png" className="loading-logo" alt="loading" />
      </div>
    );
  }

  const list = tab === "ant" ? antBets : correctBets;

  return (
    <div className="betslip-page">
      <h2 className="betslip-title">Betslip</h2>

      <div className="betslip-tabs">
        <div
          className={tab === "ant" ? "betslip-tab active" : "betslip-tab"}
          onClick={() => setTab("ant")}
        >
          AntScore({antBets.length})
        </div>

        <div
          className={tab === "correct" ? "betslip-tab active" : "betslip-tab"}
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

          return (
            <div key={bet.id || i} className="fic-card">
              <div className="fic-top-banner">
                <div className="fic-left-logo-wrap">
                  <img src="/logo192.png" alt="CBS" className="fic-mini-logo" />
                  <div className="fic-brand-under-logo">C.B.S</div>
                </div>

                <div className="fic-banner-text">
                  <div className="fic-banner-title">
                    (C.B.S) CONTRA BET SCORE FOOTBALL
                  </div>
                  <div className="fic-banner-match">{formatBannerMatch(bet)}</div>
                </div>

                <div className="fic-top-box"></div>
              </div>

              <div className="fic-subtext">
                FOLLOW THE TEAM&apos;S INVESTMENT GAME PLAN EVERYDAY. IF THE GAME
                PLAN FAILS, THE TEAM WILL COMPENSATE YOU 100% OF THE MONEY YOU
                LOST.
              </div>

              <div className="fic-body">
                <div className="fic-left-side">
                  <div className="fic-fulltime">FULL</div>
                  <div className="fic-fulltime">TIME</div>
                </div>

                <div className="fic-center">
                  <div className="fic-date-line">{formatMatchDate(bet)}</div>

                  <div className="fic-time-line">{formatMatchOnlyTime(bet)}</div>

                  <div className="fic-league-line">
                    {bet.league || "Match League"}
                  </div>

                  <div className="fic-teams-row">
                    <div className="fic-team-box">
                      <Logo src={logoA} name={bet.teamA} />
                      <div className="fic-team-name">{bet.teamA}</div>
                    </div>

                    <div className="fic-score-box">
                      <div className="fic-odds-line">
                        {bet.odds || "0.00"} % ODDS
                      </div>
                      <div className="fic-main-score">
                        {bet.score || "0 - 0"}
                      </div>
                    </div>

                    <div className="fic-team-box">
                      <Logo src={logoB} name={bet.teamB} />
                      <div className="fic-team-name">{bet.teamB}</div>
                    </div>
                  </div>
                </div>

                <div className="fic-right-side">
                  <div className="fic-arrow"></div>
                  <div className="fic-arrow"></div>
                  <div className="fic-arrow"></div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}