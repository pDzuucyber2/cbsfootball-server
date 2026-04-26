import { useEffect, useState } from "react";
import { standardDb } from "../firebaseStandard";
import { collection, getDocs } from "firebase/firestore";
import "./WinRecord.css";

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

      <p>Loading Win Records...</p>
    </div>
  </div>
);

export default function WinRecord() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalOdds, setTotalOdds] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalWin, setTotalWin] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const username = localStorage.getItem("username");

        const antSnap = await getDocs(collection(standardDb, "antscore"));
        const correctSnap = await getDocs(collection(standardDb, "correctscore"));

        const allBets = [
          ...antSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          ...correctSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        ];

        const won = allBets.filter(
          (b) => b.username === username && b.result === "win"
        );

        won.sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0;
          const t2 = b.createdAt?.seconds || 0;
          return t2 - t1;
        });

        setBets(won);

        let oddsSum = 0;
        let amountSum = 0;
        let profitSum = 0;
        let winSum = 0;

        won.forEach((b) => {
          oddsSum += Number(b.odds || 0);
          amountSum += Number(b.amount || 0);
          profitSum += Number(b.profit || 0);
          winSum += Number(b.totalWin || 0);
        });

        setTotalOdds(oddsSum);
        setTotalAmount(amountSum);
        setTotalProfit(profitSum);
        setTotalWin(winSum);

        setTimeout(() => setLoading(false), 1500);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBetId = (bet) =>
    bet.betId || `#${bet.id?.slice(0, 12) || "--------"}`;

  if (loading) return <SolarLoader />;

  return (
    <div className="mybets">
      <h2>Win Records ({bets.length})</h2>

      <div className="summary-box">
        <div className="summary-item">
          <p>Total Odds</p>
          <h3>{totalOdds.toFixed(2)}</h3>
        </div>

        <div className="summary-item">
          <p>Total Amount</p>
          <h3>{totalAmount.toLocaleString()}</h3>
        </div>

        <div className="summary-item">
          <p>Total Profit</p>
          <h3>{totalProfit.toLocaleString()}</h3>
        </div>

        <div className="summary-item">
          <p>Total Win</p>
          <h3>{totalWin.toLocaleString()}</h3>
        </div>
      </div>

      {bets.length === 0 && <div className="no-bets">No Win Records</div>}

      {bets.map((bet, i) => (
        <div key={bet.id || i} className="bet-card won">
          <div className="top-tags">
            <span className="tag left">Score: {bet.score}</span>
            <span className="tag center">{getBetId(bet)}</span>
            <span className="tag right">Odds: {bet.odds}</span>
          </div>

          <div className="vs" style={{ marginTop: "10px" }}>
            {bet.teamA} <span>VS</span> {bet.teamB}
          </div>

          <div className="league-box">{bet.league}</div>

          <div className="bet-time">Bet Time: {formatTime(bet.createdAt)}</div>

          <div className="bottom-row">
            <span>
              Amount: {bet.amount} {bet.currency}
            </span>
            <span className="win">+{bet.totalWin}</span>
          </div>

          <div className="time">Profit: {bet.profit}</div>

          <div className="status won">WON</div>

          <div className="time">
            {bet.matchDate} {bet.matchTime}
          </div>
        </div>
      ))}
    </div>
  );
}