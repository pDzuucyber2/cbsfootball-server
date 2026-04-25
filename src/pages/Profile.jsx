import React, { useEffect, useState, memo } from "react";
import { standardDb } from "../firebaseStandard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Profile.css";

export default function CancelHistory() {

const [cancelledBets, setCancelledBets] = useState([]);
const [matchesMap, setMatchesMap] = useState({});
const [loading, setLoading] = useState(true);

/* NORMALIZE */
const normalize = (str) => {
  return str
    ?.toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
};

/* LOAD DATA */
useEffect(() => {

const loadData = async () => {

try {

const username = localStorage.getItem("username");

/* MATCHES */
const matchSnap = await getDocs(collection(db, "matches"));

let map = {};

matchSnap.docs.forEach(doc => {
const m = doc.data();
const key = `${normalize(m.A)}_${normalize(m.B)}`;
map[key] = m;
});

setMatchesMap(map);

/* BETS */
const antSnap = await getDocs(collection(standardDb, "antscore"));
const correctSnap = await getDocs(collection(standardDb, "correctscore"));

const allBets = [
...antSnap.docs.map(d => ({ id: d.id, ...d.data() })),
...correctSnap.docs.map(d => ({ id: d.id, ...d.data() }))
];

/* FILTER */
const cancelled = allBets.filter(
b => b.username === username && b.result === "cancelled"
);

/* SORT */
cancelled.sort((a, b) => {
const t1 = a.createdAt?.seconds || 0;
const t2 = b.createdAt?.seconds || 0;
return t2 - t1;
});

setCancelledBets(cancelled);

/* DELAY */
setTimeout(() => setLoading(false), 1000);

} catch (err) {
console.error(err);
setLoading(false);
}

};

loadData();

}, []);

/* GET LOGOS */
const getLogos = (bet) => {
const key = `${normalize(bet.teamA)}_${normalize(bet.teamB)}`;
const match = matchesMap[key];

return {
logoA: match?.logoA || null,
logoB: match?.logoB || null
};
};

/* INITIALS */
const getInitials = (name) =>
name?.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();

/* 🔥 LOGO (MATCHLIST STYLE) */
const Logo = memo(({ src, name, side, bothMissing }) => {

const [error, setError] = useState(false);

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

const proxyUrl = src
  ? `${BASE_URL}/logo?url=${encodeURIComponent(src)}`
  : null;

/* COLOR LOGIC */
let bgColor = "#000";

if (bothMissing) {
  bgColor = side === "left" ? "#000" : "#ff0000";
}

/* FALLBACK */
if (!src || error) {
  return (
    <div className="logo-fallback" style={{ background: bgColor }}>
      {getInitials(name)}
    </div>
  );
}

/* IMAGE */
return (
  <img
    src={proxyUrl}
    alt={name}
    className="team-logo"
    loading="lazy"
    onError={(e) => {

      // try direct
      if (!e.target.dataset.try1 && src) {
        e.target.dataset.try1 = "1";
        e.target.src = src;
      }

      // fallback
      else {
        setError(true);
      }

    }}
  />
);

});

/* FORMAT TIME */
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

/* BET ID */
const getBetId = (bet) => {
return bet.betId || `#${bet.id?.slice(0,12) || "--------"}`;
};

/* LOADING */
if (loading) {
  return (
    <div className="loading-screen">
      <img src="/logo192.png" alt="loading" className="loading-logo" />
    </div>
  );
}

return (
<div className="mybets">

<h2>Cancelled Bets</h2>

{cancelledBets.length === 0 && (
<div className="no-bets">No Cancelled Bets</div>
)}

{cancelledBets.map((bet, i) => {

const { logoA, logoB } = getLogos(bet);
const betId = getBetId(bet);

const missingA = !logoA;
const missingB = !logoB;
const bothMissing = missingA && missingB;

return (
<div key={i} className="bet-card cancelled">

{/* TOP */}
<div className="top-tags">
<span className="tag left">Score: {bet.score}</span>
<span className="tag center">{betId}</span>
<span className="tag right">Odds: {bet.odds}</span>
</div>

{/* TEAMS */}
<div className="teams-row">

<Logo 
  src={logoA} 
  name={bet.teamA} 
  side="left"
  bothMissing={bothMissing}
/>

<div className="vs">
{bet.teamA} <span>VS</span> {bet.teamB}
</div>

<Logo 
  src={logoB} 
  name={bet.teamB} 
  side="right"
  bothMissing={bothMissing}
/>

</div>

<div className="league-box">{bet.league}</div>

<div className="bet-time">
Cancelled At: {formatTime(bet.createdAt)}
</div>

<div className="bottom-row">
<span>Amount: {bet.amount} {bet.currency}</span>
<span className="win">Refunded</span>
</div>

<div className="status cancelled">CANCELLED</div>

</div>
);

})}

</div>
);
}