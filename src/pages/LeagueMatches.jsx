import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import "./LeagueMatches.css";

export default function LeagueMatches(){

const { leagueName } = useParams();
const navigate = useNavigate();

const [matches,setMatches] = useState([]);
const [visible,setVisible] = useState(6);

/* BASE URL */
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

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

/* TEAM LOGO */
const TeamLogo = ({ logo, name, side, bothMissing }) => {

const [error, setError] = useState(false);

const proxyUrl = logo
  ? `${BASE_URL}/logo?url=${encodeURIComponent(logo)}`
  : null;

/* COLOR */
const bgColor = bothMissing
  ? (side === "left" ? "#111" : "#c62828")
  : "#111";

/* FALLBACK */
if (!logo || error) {
return (
<div
className={`logo-fallback ${side}`}
style={{ background: bgColor }}
> 
{getInitials(name)}
</div>
);
}

return (
<img
className={`team-logo ${side}`}
src={proxyUrl}
alt={name}
loading="lazy"
onError={(e)=>{

if (!e.target.dataset.try1 && logo) {
e.target.dataset.try1 = "1";
e.target.src = logo;
}
else {
setError(true);
}

}}
/>
);

};

/* LOAD MATCHES */
useEffect(()=>{

const loadMatches = async ()=>{

const snap = await getDocs(collection(db,"matches"));

const data = snap.docs.map(doc=>({
id: doc.id,
...doc.data()
}));

const now = Date.now();
const fifteenMinutes = 15 * 60 * 1000;

/* FILTER */
const filtered = data.filter(m=>{

if(!m.date || !m.league) return false;

if(m.league !== decodeURIComponent(leagueName)) return false;

const matchTime = new Date(m.date.replace(" ","T")+"Z").getTime();

return (matchTime - now) > fifteenMinutes;

});

/* SORT */
filtered.sort((a,b)=>{

const da = new Date(a.date.replace(" ","T")+"Z").getTime();
const dbb = new Date(b.date.replace(" ","T")+"Z").getTime();

return da - dbb;

});

setMatches(filtered);

};

loadMatches();

},[leagueName]);

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

return(

<div className="match-list">

{/* BACK */}
<div style={{marginBottom:15}}>
<button
onClick={()=>navigate(-1)}
style={{
padding:"6px 12px",
border:"none",
background:"#081c34",
color:"#fff",
borderRadius:"6px",
cursor:"pointer"
}}
> 
← Back
</button>
</div>

<h2 style={{marginBottom:15}}>
{decodeURIComponent(leagueName)}
</h2>

{matches.slice(0,visible).map((m,i)=>{

const missingA = !m.logoA;
const missingB = !m.logoB;
const bothMissing = missingA && missingB;

return (

<div
className="match-card"
key={m.id || i}
onClick={()=>navigate(`/betscores/${m.id}`,{ state:m })}
style={{cursor:"pointer"}}
>

{/* TEAM A */}
<TeamLogo
logo={m.logoA}
name={m.A}
side="left"
bothMissing={bothMissing}
/>

<div className="match-info">

<div className="teams">
{m.A} <span>VS</span> {m.B}
</div>

<div className="league">
{m.league}
</div>

<div className="time">
{formatDateTime(m.date)}
</div>

</div>

{/* TEAM B */}
<TeamLogo
logo={m.logoB}
name={m.B}
side="right"
bothMissing={bothMissing}
/>

</div>

);

})}

{/* SEE MORE */}
{visible < matches.length && (
<div
className="more-btn"
onClick={()=>setVisible(visible + 6)}
> 
See More
</div>
)}

{/* EMPTY */}
{matches.length === 0 && (
<div style={{padding:"10px"}}>
Waiting matches available
</div>
)}

</div>

);

}