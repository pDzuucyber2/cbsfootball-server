import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import { db } from "../firebase";
import "./History.css";

const HistoryLoader = () => (
  <div className="history-loader-screen">
    <img src="/images/player.png" className="history-loader-bg" alt="loading" />
    <div className="history-loader-overlay"></div>

    <div className="history-loader-content">
      <div className="history-solar-system">
        <div className="history-orbit history-orbit-one">
          <span className="history-planet-ball">⚽</span>
        </div>

        <div className="history-orbit history-orbit-two">
          <span className="history-planet-ball small">⚽</span>
        </div>

        <div className="history-sun">
          <img src="/favicon.ico" alt="logo" />
        </div>
      </div>

      <p>Loading History...</p>
    </div>
  </div>
);

export default function BettingHistory() {
  const [antBets, setAntBets] = useState([]);
  const [correctBets, setCorrectBets] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ant");
  const [activeSection, setActiveSection] = useState("today");

  const username = localStorage.getItem("username");

  const normalize = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const getBetDate = (bet) => {
    if (bet.createdAt?.toDate) return bet.createdAt.toDate();
    if (bet.createdAt) return new Date(bet.createdAt);
    if (bet.matchTimestamp?.toDate) return bet.matchTimestamp.toDate();
    if (bet.matchTimestamp) return new Date(bet.matchTimestamp);
    return null;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [antSnap, correctSnap, matchSnap] = await Promise.all([
          getDocs(collection(standardDb, "antscore")),
          getDocs(collection(standardDb, "correctscore")),
          getDocs(collection(db, "matches")),
        ]);

        const antData = antSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.username === username);

        const correctData = correctSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.username === username);

        const sortByLatest = (a, b) => {
          const t1 = getBetDate(a)?.getTime() || 0;
          const t2 = getBetDate(b)?.getTime() || 0;
          return t2 - t1;
        };

        antData.sort(sortByLatest);
        correctData.sort(sortByLatest);

        const matchData = matchSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setMatches(matchData);
        setAntBets(antData);
        setCorrectBets(correctData);

        setTimeout(() => setLoading(false), 1000);
      } catch (err) {
        console.error("Failed to load betting history:", err);
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  const formatDateTime = (bet) => {
    const d = getBetDate(bet);
    if (!d) return "-";

    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (bet) => {
    if (!bet.result) return "PENDING";
    if (bet.result === "win") return "WON";
    if (bet.result === "lose") return "LOST";
    if (bet.result === "cancelled") return "CANCELLED";
    return String(bet.result).toUpperCase();
  };

  const getBetId = (bet) => {
    return bet.betId || `#${bet.id?.slice(0, 12) || "--------"}`;
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getFinalScore = (bet) => {
    const betA = normalize(bet.teamA);
    const betB = normalize(bet.teamB);
    const betLeague = normalize(bet.league);

    let found = matches.find(
      (m) =>
        normalize(m.A) === betA &&
        normalize(m.B) === betB &&
        normalize(m.league) === betLeague &&
        m.finalScore
    );
    if (found) return found.finalScore;

    found = matches.find(
      (m) => normalize(m.A) === betA && normalize(m.B) === betB && m.finalScore
    );
    if (found) return found.finalScore;

    found = matches.find(
      (m) =>
        normalize(m.A) === betB &&
        normalize(m.B) === betA &&
        normalize(m.league) === betLeague &&
        m.finalScore
    );
    if (found) return found.finalScore;

    found = matches.find(
      (m) => normalize(m.A) === betB && normalize(m.B) === betA && m.finalScore
    );
    if (found) return found.finalScore;

    return "-";
  };

  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const startOfThisWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + mondayOffset
  );

  const startOfNextWeek = new Date(
    startOfThisWeek.getFullYear(),
    startOfThisWeek.getMonth(),
    startOfThisWeek.getDate() + 7
  );

  const startOfLastWeek = new Date(
    startOfThisWeek.getFullYear(),
    startOfThisWeek.getMonth(),
    startOfThisWeek.getDate() - 7
  );

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const allBets = tab === "ant" ? antBets : correctBets;

  const sections = useMemo(() => {
    const filterRange = (from, to) =>
      allBets.filter((bet) => {
        const d = getBetDate(bet);
        if (!d) return false;
        return d >= from && d < to;
      });

    return {
      today: filterRange(startOfToday, startOfTomorrow),
      yesterday: filterRange(startOfYesterday, startOfToday),
      thisWeek: filterRange(startOfThisWeek, startOfNextWeek),
      lastWeek: filterRange(startOfLastWeek, startOfThisWeek),
      thisMonth: filterRange(startOfThisMonth, startOfNextMonth),
      lastMonth: filterRange(startOfLastMonth, startOfThisMonth),
    };
  }, [
    allBets,
    startOfToday,
    startOfTomorrow,
    startOfYesterday,
    startOfThisWeek,
    startOfNextWeek,
    startOfLastWeek,
    startOfThisMonth,
    startOfNextMonth,
    startOfLastMonth,
  ]);

  const sectionButtons = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "thisWeek", label: "This Week" },
    { key: "lastWeek", label: "Last Week" },
    { key: "thisMonth", label: "This Month" },
    { key: "lastMonth", label: "Last Month" },
  ];

  const currentList = sections[activeSection] || [];

  const totalAmount = currentList.reduce(
    (sum, bet) => sum + Number(bet.amount || 0),
    0
  );

  const totalProfit = currentList.reduce(
    (sum, bet) => sum + Number(bet.profit || 0),
    0
  );

  const totalWin = currentList.reduce(
    (sum, bet) => sum + Number(bet.totalWin || 0),
    0
  );

  const totalOdds = currentList.reduce(
    (sum, bet) => sum + Number(bet.odds || 0),
    0
  );

  if (loading) {
    return <HistoryLoader />;
  }

  return (
    <div className="bet-history-page">
      <h2 className="history-title">Betting History</h2>

      <div className="history-tabs">
        <button
          className={tab === "ant" ? "history-tab active" : "history-tab"}
          onClick={() => setTab("ant")}
        >
          Ant Score
        </button>

        <button
          className={tab === "correct" ? "history-tab active" : "history-tab"}
          onClick={() => setTab("correct")}
        >
          Correct Score
        </button>
      </div>

      <div className="history-sections-scroll">
        {sectionButtons.map((item) => (
          <button
            key={item.key}
            className={
              activeSection === item.key
                ? "history-section-btn active"
                : "history-section-btn"
            }
            onClick={() => setActiveSection(item.key)}
          >
            {item.label} ({sections[item.key]?.length || 0})
          </button>
        ))}
      </div>

      <div className="history-summary">
        <div className="summary-card">
          <p>Total Bets</p>
          <h3>{currentList.length}</h3>
        </div>

        <div className="summary-card">
          <p>Total Amount</p>
          <h3>{formatNumber(totalAmount)}</h3>
        </div>

        <div className="summary-card">
          <p>Total Profit</p>
          <h3>{formatNumber(totalProfit)}</h3>
        </div>

        <div className="summary-card">
          <p>Total Win</p>
          <h3>{formatNumber(totalWin)}</h3>
        </div>

        <div className="summary-card">
          <p>Total Odds</p>
          <h3>{formatNumber(totalOdds)}</h3>
        </div>
      </div>

      <div className="history-list">
        {currentList.length === 0 ? (
          <div className="history-empty">No bets found</div>
        ) : (
          currentList.map((bet, i) => (
            <div key={bet.id || i} className="history-card">
              <div className="history-top-row">
                <span className="history-bet-id">{getBetId(bet)}</span>
                <span
                  className={`history-status ${getStatus(bet).toLowerCase()}`}
                >
                  {getStatus(bet)}
                </span>
              </div>

              <div className="history-match">
                {bet.teamA} <span>VS</span> {bet.teamB}
              </div>

              <div className="history-league">{bet.league || "-"}</div>

              <div className="history-details-grid">
                <div className="history-info-row horizontal">
                  <span>Score</span>
                  <b className="score-text">{bet.score || "-"}</b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Final Score</span>
                  <b className="final-score-text">{getFinalScore(bet)}</b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Odds</span>
                  <b>{bet.odds || "-"}</b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Amount</span>
                  <b>
                    {bet.amount || 0} {bet.currency || ""}
                  </b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Profit</span>
                  <b>{bet.profit || 0}</b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Total Win</span>
                  <b>{bet.totalWin || 0}</b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Match Time</span>
                  <b>
                    {bet.matchDate || "-"} {bet.matchTime || ""}
                  </b>
                </div>

                <div className="history-info-row horizontal">
                  <span>Created</span>
                  <b>{formatDateTime(bet)}</b>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}