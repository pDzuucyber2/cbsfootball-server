import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

export default function AdminEditMatch() {
  const [matches, setMatches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMatches = async () => {
    const snap = await getDocs(collection(db, "matches"));
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setMatches(data);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditing((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const refreshServerMatches = async () => {
    try {
      await fetch(`${SERVER_URL}/admin/refresh-matches`, {
        method: "POST",
      });
      console.log("Server matches refreshed ✅");
    } catch (err) {
      console.error("Server refresh failed:", err);
    }
  };

  const saveMatch = async () => {
    if (!editing?.id) return;

    try {
      setLoading(true);

      const matchRef = doc(db, "matches", editing.id);

      await updateDoc(matchRef, {
        A: editing.A || "",
        B: editing.B || "",
        league: editing.league || "",
        date: editing.date || "",
        logoA: editing.logoA || "",
        logoB: editing.logoB || "",
        status: editing.status || "",
        score: editing.score || "",
        odds: editing.odds || "",
      });

      await refreshServerMatches();

      alert("Match updated and server refreshed ✅");

      setEditing(null);
      await loadMatches();
    } catch (err) {
      console.error(err);
      alert("Failed to update match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 15, color: "#fff" }}>
      <h2>Admin Edit Matches</h2>

      {matches.map((m) => (
        <div
          key={m.id}
          style={{
            background: "#111827",
            marginBottom: 10,
            padding: 12,
            borderRadius: 10,
          }}
        >
          <b>
            {m.A} VS {m.B}
          </b>
          <p>{m.league}</p>
          <p>{m.date}</p>

          <button onClick={() => setEditing(m)}>Edit</button>
        </div>
      ))}

      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            padding: 20,
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          <h3>Edit Match</h3>

          <input name="A" value={editing.A || ""} onChange={handleChange} placeholder="Team A" />
          <input name="B" value={editing.B || ""} onChange={handleChange} placeholder="Team B" />
          <input name="league" value={editing.league || ""} onChange={handleChange} placeholder="League" />
          <input name="date" value={editing.date || ""} onChange={handleChange} placeholder="2026-04-26 18:00:00" />
          <input name="logoA" value={editing.logoA || ""} onChange={handleChange} placeholder="Logo A" />
          <input name="logoB" value={editing.logoB || ""} onChange={handleChange} placeholder="Logo B" />
          <input name="status" value={editing.status || ""} onChange={handleChange} placeholder="Status" />
          <input name="score" value={editing.score || ""} onChange={handleChange} placeholder="Score" />
          <input name="odds" value={editing.odds || ""} onChange={handleChange} placeholder="Odds" />

          <br /><br />

          <button onClick={saveMatch} disabled={loading}>
            {loading ? "Saving..." : "Save & Refresh Server"}
          </button>

          <button onClick={() => setEditing(null)} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}