import { useEffect, useState } from "react";
import { standardDb } from "../firebaseStandard";
import { collection, getDocs } from "firebase/firestore";
import "./WinRecord.css";

export default function WinRecord() {

const [bets, setBets] = useState([]);
const [loading, setLoading] = useState(true);

// 🔥 TOTALS
const [totalOdds, setTotalOdds] = useState(0);
const [totalAmount, setTotalAmount] = useState(0);
const [totalProfit, setTotalProfit] = useState(0);
const [totalWin, setTotalWin] = useState(0);

useEffect(() => {

const loadData = async () => {

try {

const username = localStorage.getItem("username");

// 🔥 GET BETS
const antSnap = await getDocs(collection(standardDb, "antscore"));
const correctSnap = await getDocs(collection(standardDb, "correctscore"));

const allBets = [
...antSnap.docs.map(d => ({ id: d.id, ...d.data() })),
...correctSnap.docs.map(d => ({ id: d.id, ...d.data() }))
];

// 🔥 FILTER WIN
const won = allBets.filter(
b => b.username === username && b.result === "win"
);

// 🔥 SORT
won.sort((a, b) => {
const t1 = a.createdAt?.seconds || 0;
const t2 = b.createdAt?.seconds || 0;
return t2 - t1;
});

setBets(won);

// 🔥 CALCULATIONS
let oddsSum = 0;
let amountSum = 0;
let profitSum = 0;
let winSum = 0;

won.forEach(b => {
  oddsSum += Number(b.odds || 0);
  amountSum += Number(b.amount || 0);
  profitSum += Number(b.profit || 0);
  winSum += Number(b.totalWin || 0);
});

setTotalOdds(oddsSum);
setTotalAmount(amountSum);
setTotalProfit(profitSum);
setTotalWin(winSum);

// 🔥 DELAY
setTimeout(() => setLoading(false), 2000);

} catch (err) {
console.error(err);
setLoading(false);
}

};

loadData();

}, []);

// 🔥 FORMAT TIME
const formatTime = (timestamp) => {
if (!timestamp) return "-";

const date = timestamp.toDate
? timestamp.toDate()
: new Date(timestamp);

return date.toLocaleString("en-GB", {
day: "2-digit",
month: "short",
hour: "2-digit",
minute: "2-digit",
});
};

// 🔥 BET ID
const getBetId = (bet) =>
bet.betId || `#${bet.id?.slice(0,12) || "--------"}`;

// 🔥 LOADING
if (loading) {
return (
<div className="loading-screen">
<img src="/logo192.png" alt="loading" className="loading-logo" />
</div>
);
}

return (
<div className="mybets">

<h2>Win Records ({bets.length})</h2>

{/* 🔥 SUMMARY BOX */}
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

{bets.length === 0 && (
<div className="no-bets">No Win Records</div>
)}

{bets.map((bet, i) => (
<div key={i} className="bet-card won">

<div className="top-tags">
<span className="tag left">Score: {bet.score}</span>
<span className="tag center">{getBetId(bet)}</span>
<span className="tag right">Odds: {bet.odds}</span>
</div>

<div className="vs" style={{ marginTop: "10px" }}>
{bet.teamA} <span>VS</span> {bet.teamB}
</div>

<div className="league-box">{bet.league}</div>

<div className="bet-time">
Bet Time: {formatTime(bet.createdAt)}
</div>

<div className="bottom-row">
<span>Amount: {bet.amount} {bet.currency}</span>
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