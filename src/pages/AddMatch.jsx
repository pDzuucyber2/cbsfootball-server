import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getMatches } from "../utils/getMatches";

export default function AdminAddMatch(){

const [matches,setMatches] = useState([]);
const [selected,setSelected] = useState([]);
const [loading,setLoading] = useState(true);
const [saving,setSaving] = useState(false);
const [visible,setVisible] = useState(10);


/* LOAD */
useEffect(()=>{

const load = async ()=>{
setLoading(true);
const data = await getMatches();
setMatches(data);
setLoading(false);
};

load();

},[]);


/* GET TEAMS */
const getTeams = (m)=>{
const home = m.participants?.find(p => p.meta?.location === "home");
const away = m.participants?.find(p => p.meta?.location === "away");
return { home, away };
};


/* TOGGLE */
const toggleSelect = (id)=>{
if(selected.includes(id)){
setSelected(selected.filter(x=>x!==id));
}else{
setSelected([...selected,id]);
}
};


/* SELECT ALL */
const selectAll = ()=>{
setSelected(matches.map(m=>m.id));
};


/* CLEAR */
const clearAll = ()=>{
setSelected([]);
};


/* SAVE */
const saveMatches = async ()=>{

setSaving(true);

const snap = await getDocs(collection(db,"matches"));

const existing = snap.docs.map(d =>
d.data().A + d.data().B + d.data().date
);

let count = 0;

for(const m of matches){

if(!selected.includes(m.id)) continue;

const {home,away} = getTeams(m);

if(!home || !away) continue;

const key = home.name + away.name + m.starting_at;

if(existing.includes(key)) continue;

await addDoc(collection(db,"matches"),{

A: home.name,
B: away.name,

logoA: home.image_path,
logoB: away.image_path,

league: m.league?.name || "",

date: m.starting_at,

status: "NS"

});

count++;
}

setSaving(false);
setSelected([]);

alert(`Saved ${count} matches ✅`);

};


/* LOADING */
if(loading){
return <div style={{padding:"20px"}}>Loading Matches...</div>;
}


/* UI */
return(

<div style={container}>

<h2>⚽ Admin Matches</h2>

<p>Total: {matches.length}</p>
<p>Selected: {selected.length}</p>


{/* BUTTONS */}
<div style={btnRow}>

<button onClick={selectAll} style={btn}>Select All</button>
<button onClick={clearAll} style={btn}>Clear</button>

<button onClick={saveMatches} style={btn} disabled={saving}>
{saving ? "Saving..." : "Save Selected"}
</button>

</div>


{/* MATCHES */}
<div style={{marginTop:"20px"}}>

{matches.slice(0,visible).map((m,i)=>{

const {home,away} = getTeams(m);
if(!home || !away) return null;

const isSelected = selected.includes(m.id);

return(

<div
key={i}
onClick={()=>toggleSelect(m.id)}
style={{
...card,
border: isSelected ? "2px solid #22c55e" : "1px solid transparent",
background: isSelected ? "#064e3b" : "#1e293b"
}}
>

<input type="checkbox" checked={isSelected} readOnly />

<img src={home.image_path} width="30"/>
<span>{home.name}</span>

<span style={{fontWeight:"bold"}}>VS</span>

<span>{away.name}</span>
<img src={away.image_path} width="30"/>

<div style={league}>{m.league?.name}</div>

</div>

);

})}

</div>


{/* LOAD MORE */}
{visible < matches.length && (
<button onClick={()=>setVisible(visible+20)} style={loadMore}>
Load More
</button>
)}

</div>

);

}


/* STYLES */
const container = {
padding:"20px",
background:"#020617",
color:"#fff",
minHeight:"100vh"
};

const btnRow = {
display:"flex",
gap:"10px",
marginBottom:"20px"
};

const btn = {
padding:"10px",
background:"#0ea5e9",
border:"none",
borderRadius:"6px",
color:"#fff",
cursor:"pointer"
};

const card = {
display:"flex",
alignItems:"center",
gap:"10px",
marginBottom:"10px",
background:"#1e293b",
padding:"10px",
borderRadius:"8px",
cursor:"pointer"
};

const league = {
marginLeft:"10px",
color:"#aaa",
fontSize:"12px"
};

const loadMore = {
marginTop:"20px",
padding:"10px",
background:"#22c55e",
border:"none",
borderRadius:"6px",
color:"#fff",
cursor:"pointer"
};