import { useEffect, useState } from "react";
import { db } from "../firebase";

import {
collection,
getDocs,
doc,
updateDoc,
deleteDoc
} from "firebase/firestore";

import "./EdietMatches.css";

export default function AdminManageMatches(){

const [matches,setMatches] = useState([]);
const [visible,setVisible] = useState(5);
const [editingId,setEditingId] = useState(null);
const [form,setForm] = useState({});
const [selected,setSelected] = useState([]);
const [search,setSearch] = useState("");



/* LOAD MATCHES */

useEffect(()=>{

const load = async ()=>{

const snap = await getDocs(collection(db,"matches"));

const data = snap.docs.map(d=>({
id:d.id,
...d.data()
}));

setMatches(data);

};

load();

},[]);



/* SEARCH */

const filteredMatches = matches.filter(m =>

m.A?.toLowerCase().includes(search.toLowerCase()) ||
m.B?.toLowerCase().includes(search.toLowerCase()) ||
m.league?.toLowerCase().includes(search.toLowerCase())

);



/* SELECT */

const toggleSelect = (id)=>{

if(selected.includes(id)){
setSelected(selected.filter(x=>x!==id));
}else{
setSelected([...selected,id]);
}

};



/* DELETE ONE */

const deleteMatch = async(id)=>{

if(!window.confirm("Delete this match?")) return;

await deleteDoc(doc(db,"matches",id));

setMatches(matches.filter(m=>m.id!==id));

};



/* DELETE SELECTED */

const deleteSelected = async ()=>{

if(selected.length === 0){
alert("No match selected");
return;
}

for(const id of selected){
await deleteDoc(doc(db,"matches",id));
}

setMatches(matches.filter(m=>!selected.includes(m.id)));

setSelected([]);

};



/* START EDIT */

const startEdit = (m)=>{

setEditingId(m.id);

setForm({
A:m.A,
B:m.B,
league:m.league,
logoA:m.logoA,
logoB:m.logoB
});

};



/* SAVE EDIT */

const saveEdit = async(id)=>{

await updateDoc(doc(db,"matches",id),form);

setMatches(matches.map(m =>
m.id === id ? {...m,...form} : m
));

setEditingId(null);

};



return(

<div className="admin-container">

<h2>Admin Matches</h2>


{/* SEARCH */}

<input
className="search-box"
placeholder="Search match..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>


<button
className="delete-selected"
onClick={deleteSelected}
> 
DeleteSelected
</button>



{/* MATCH LIST */}

{filteredMatches.slice(0,visible).map(m=>(

<div className="match-row" key={m.id}>

<input
type="checkbox"
checked={selected.includes(m.id)}
onChange={()=>toggleSelect(m.id)}
/>


{/* TEAM A LOGO */}

{editingId===m.id ?(

<input
value={form.logoA}
onChange={e=>setForm({...form,logoA:e.target.value})}
placeholder="Logo A URL"
/>

):( 

<img src={m.logoA} className="logo"/>

)}



{/* TEAM NAMES */}

{editingId===m.id ?(

<>

<input
value={form.A}
onChange={e=>setForm({...form,A:e.target.value})}
/>

<span>VS</span>

<input
value={form.B}
onChange={e=>setForm({...form,B:e.target.value})}
/>

<input
value={form.league}
onChange={e=>setForm({...form,league:e.target.value})}
/>

</>

):( 

<>

<span>{m.A}</span>

<span className="vs">VS</span>

<span>{m.B}</span>

<span className="league">{m.league}</span>

</>

)}



{/* TEAM B LOGO */}

{editingId===m.id ?(

<input
value={form.logoB}
onChange={e=>setForm({...form,logoB:e.target.value})}
placeholder="Logo B URL"
/>

):( 

<img src={m.logoB} className="logo"/>

)}



{/* BUTTONS */}

{editingId===m.id ?(

<>

<button onClick={()=>saveEdit(m.id)}>Save</button>

<button onClick={()=>setEditingId(null)}>Cancel</button>

</>

):( 

<>

<button onClick={()=>startEdit(m)}>Edit</button>

<button
className="delete-btn"
onClick={()=>deleteMatch(m.id)}
> 
Delete
</button>

</>

)}

</div>

))}



{/* MORE */}

{visible < filteredMatches.length &&(

<button
className="more-btn"
onClick={()=>setVisible(visible+5)}
> 
MoreMatches
</button>

)}

</div>

);

}