import { useEffect, useState } from "react";
import "./AdminAddVituars.css";

import { standardDb } from "../firebaseStandard";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

export default function AdminJSON(){

  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  // 🔥 LOAD MATCHES
  const loadMatches = async () => {
    const snapshot = await getDocs(collection(standardDb, "matches"));

    let data = [];

    snapshot.forEach(doc=>{
      data.push({ id: doc.id, ...doc.data() });
    });

    // 🔥 SORT BY DATE + TIME
    data.sort((a,b)=>{
      return new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time);
    });

    setMatches(data);
  };

  useEffect(()=>{
    loadMatches();
  },[]);

  // 🔥 UPLOAD
  const handleSubmit = async () => {

    try{
      setLoading(true);

      const parsed = JSON.parse(jsonText);

      if (Array.isArray(parsed)) {

        await Promise.all(
          parsed.map(item =>
            addDoc(collection(standardDb, "matches"), {
              ...item,
              createdAt: serverTimestamp()
            })
          )
        );

        alert(`Matches ${parsed.length} added ✅`);

      } else {

        await addDoc(collection(standardDb, "matches"), {
          ...parsed,
          createdAt: serverTimestamp()
        });

        alert("Match added ✅");
      }

      setJsonText("");

      // 🔥 REFRESH MATCHES AUTOMATIC
      loadMatches();

    }catch(err){
      alert("Invalid JSON ❌");
      console.log(err);
    }

    setLoading(false);
  };

  return(
    <div className="admin-container">

      {/* 🔥 UPLOAD SECTION */}
      <h2>Admin - Add Matches</h2>

      <textarea
        placeholder='Paste JSON here...'
        value={jsonText}
        onChange={(e)=>setJsonText(e.target.value)}
        className="json-box"
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Uploading..." : "Upload Matches"}
      </button>

      {/* 🔥 VIEW SECTION */}
      <h2 style={{marginTop:"30px"}}>All Matches</h2>

      {matches.map(match => (

        <div key={match.id} className="view-card">

          <div className="top">
            <span>{match.league}</span>
            <span>{match.date}</span>
          </div>

          <div className="teams">
            <b>{match.homeTeam}</b>
            <span>{match.homeScore} - {match.awayScore}</span>
            <b>{match.awayTeam}</b>
          </div>

          <div className="bottom">
            <span>{match.time}</span>
            <span className={match.status}>{match.status}</span>
          </div>

        </div>

      ))}

    </div>
  );
}