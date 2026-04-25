import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./MatchList.css";

const failedLogos = new Set();

const MatchList = () => {

const navigate = useNavigate();

const [todayMatches,setTodayMatches] = useState([]);
const [tomorrowMatches,setTomorrowMatches] = useState([]);

const [visible,setVisible] = useState(4);
const [tab,setTab] = useState(null);
const [now,setNow] = useState(Date.now());

/* ✅ SEARCH STATE */
const [search,setSearch] = useState("");

/* TIMER */
useEffect(()=>{
  const timer = setInterval(()=>{
    setNow(Date.now());
  },1000);
  return ()=>clearInterval(timer);
},[]);

/* INITIALS */
const getInitials = (name) => {
  if (!name) return "FC";
  return name
    .split(" ")
    .map(w=>w[0])
    .join("")
    .substring(0,3)
    .toUpperCase();
};

/* BASE URL */
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

/* LOGO */
const getLogo = (url) => {
  if (url && !failedLogos.has(url)) {
    return `${BASE_URL}/logo?url=${encodeURIComponent(url)}`;
  }
  return null;
};

/* COLOR */
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

/* DATE */
const getDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);

  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");

  return `${y}-${m}-${day}`;
};

/* LOAD MATCHES */
useEffect(()=>{

  const loadMatches = async ()=>{

    const snap = await getDocs(collection(db,"matches"));

    let data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const fifteenMinutes = 15 * 60 * 1000;

    const today = getDate(0);
    const tomorrow = getDate(1);

    const tdy = [];
    const tmr = [];

    data.forEach(m=>{

      if(!m.date) return;

      const matchDate = m.date.split(" ")[0];
      const matchTime = new Date(m.date.replace(" ","T")+"Z").getTime();

      const diff = matchTime - now;

      if(diff <= fifteenMinutes) return;

      if(matchDate === today) tdy.push(m);
      if(matchDate === tomorrow) tmr.push(m);

    });

    const sortFn = (a,b)=>
      new Date(a.date.replace(" ","T")+"Z") -
      new Date(b.date.replace(" ","T")+"Z");

    tdy.sort(sortFn);
    tmr.sort(sortFn);

    setTodayMatches(tdy);
    setTomorrowMatches(tmr);

  };

  loadMatches();

},[now]);

/* FORMAT */
const formatDateTime = (date)=>{
  const d = new Date(date.replace(" ","T")+"Z");

  return d.toLocaleString("en-GB",{
    day:"2-digit",
    month:"2-digit",
    year:"numeric",
    hour:"numeric",
    minute:"2-digit",
    hour12:true,
    timeZone:"Africa/Dar_es_Salaam"
  });
};

/* COUNTDOWN */
const getTimeLeft = (date)=>{
  const matchTime = new Date(date.replace(" ","T")+"Z").getTime();
  let diff = matchTime - now;

  if(diff <= 0) return "Starting";

  const h = Math.floor(diff / (1000*60*60));
  diff -= h * (1000*60*60);

  const m = Math.floor(diff / (1000*60));
  diff -= m * (1000*60);

  const s = Math.floor(diff / 1000);

  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
};

/* ✅ FILTERED LIST */
const rawList = tab==="today" ? todayMatches : tomorrowMatches;

const list = rawList.filter(m =>
  m.A?.toLowerCase().includes(search.toLowerCase()) ||
  m.B?.toLowerCase().includes(search.toLowerCase()) ||
  m.league?.toLowerCase().includes(search.toLowerCase())
);

return(

<div className="match-list">

{/* HEADER */}
<div className="title-row">
<h3>Matches</h3>

<button className="view-all" onClick={()=>navigate("/sports")}>
View All ➤
</button>
</div>

{/* TABS */}
<div className="tabs">

<div
className={tab==="today"?"tab active":"tab"}
onClick={()=>{setTab("today"); setVisible(4);}}
> 
Today({112 + todayMatches.length}) ▷
</div>

<div
className={tab==="tomorrow"?"tab active":"tab"}
onClick={()=>{setTab("tomorrow"); setVisible(4);}}
> 
Tomorrow({212 + tomorrowMatches.length}) ▷
</div>

</div>

{/* ✅ SEARCH INPUT */}
{tab && (
<input
  type="text"
  placeholder="Search team or league..."
  value={search}
  onChange={(e)=>setSearch(e.target.value)}
  className="search-input"
/>
)}

{/* LIST */}
{tab && list.slice(0,visible).map((m,i)=>{

const logoA = getLogo(m.logoA);
const logoB = getLogo(m.logoB);

return(

<div 
className="match-card"
key={m.id || i}
onClick={()=>navigate(`/betscores/${m.id}`,{ state:m })}
style={{cursor:"pointer"}}
>

<div className="time-left">
{tab==="today" ? getTimeLeft(m.date) : formatDateTime(m.date)}
</div>

<div className="logo-box">
{logoA ? (
<img 
  className="team-logo left" 
  src={logoA}
  onError={() => failedLogos.add(m.logoA)}
/>
) : (
<div className="logo-fallback left" style={{background:getFallbackColor(m,"left")}}>
{getInitials(m.A)}
</div>
)}
</div>

<div className="match-info">
<div className="teams">{m.A} VS {m.B}</div>
<div className="league">{m.league}</div>
</div>

<div className="logo-box">
{logoB ? (
<img 
  className="team-logo right" 
  src={logoB}
  onError={() => failedLogos.add(m.logoB)}
/>
) : (
<div className="logo-fallback right" style={{background:getFallbackColor(m,"right")}}>
{getInitials(m.B)}
</div>
)}
</div>

</div>

);

})}

{/* SEE MORE */}
{tab && visible < list.length && (
<div className="more-btn" onClick={()=>setVisible(v=>v+4)}>
SeeMore
</div>
)}

{/* EMPTY */}
{tab && list.length === 0 && (
<div style={{padding:"10px"}}>
Loading... matches 
</div>
)}

</div>

);

};

export default MatchList;