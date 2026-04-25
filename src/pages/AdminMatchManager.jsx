import React, { useEffect, useState } from "react";
import "./AdminMatchList.css";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function AdminMatchList() {
  const [matches, setMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    A: "",
    B: "",
    league: "",
    date: "",
    status: "",
    score: "",
    odds: ""
  });

  const loadMatches = async () => {
    const snap = await getDocs(collection(db, "matches"));

    const data = snap.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data()
    }));

    setMatches(data);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const deleteMatch = async (id) => {
    if (!window.confirm("Delete match?")) return;

    await deleteDoc(doc(db, "matches", id));
    loadMatches();
  };

  const openEdit = (m) => {
    setEditing(m.id);
    setForm({
      A: m.A || "",
      B: m.B || "",
      league: m.league || "",
      date: m.date || "",
      status: m.status || "",
      score: m.score || "",
      odds: m.odds || ""
    });
  };

  const updateMatch = async () => {
    await updateDoc(doc(db, "matches", editing), {
      ...form
    });

    setEditing(null);
    loadMatches();
  };

  const markOK = async (m) => {
    await updateDoc(doc(db, "matches", m.id), {
      status: "OK"
    });
    loadMatches();
  };

  const markGO = async (m) => {
    await updateDoc(doc(db, "matches", m.id), {
      status: "GO"
    });
    loadMatches();
  };

  const filtered = matches.filter((m) =>
    (m.A || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.B || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.league || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.status || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h2>⚙️ Admin Match List</h2>

      <input
        type="text"
        placeholder="Search team, league or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
      />

      {filtered.map((m) => (
        <div key={m.id} className="match-card">
          <div className="row">
            <b>{m.A} vs {m.B}</b>
          </div>

          <div className="row">
            {m.league} | {m.date}
          </div>

          <div className="row status">
            Status: {m.status || "—"}
          </div>

          <div className="row">
            Score: {m.score || "—"}
          </div>

          <div className="row">
            Odds: {m.odds || "—"}
          </div>

          <div className="actions">
            <button onClick={() => openEdit(m)}>✏️ Edit</button>
            <button onClick={() => deleteMatch(m.id)}>🗑 Delete</button>
            <button onClick={() => markOK(m)}>✅ OK</button>
            <button onClick={() => markGO(m)}>🚀 GO</button>
          </div>
        </div>
      ))}

      {editing && (
        <div className="modal">
          <div className="modal-box">
            <h3>Edit Match</h3>

            <input
              value={form.A}
              onChange={(e) => setForm({ ...form, A: e.target.value })}
              placeholder="Team A"
            />

            <input
              value={form.B}
              onChange={(e) => setForm({ ...form, B: e.target.value })}
              placeholder="Team B"
            />

            <input
              value={form.league}
              onChange={(e) => setForm({ ...form, league: e.target.value })}
              placeholder="League"
            />

            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="Date"
            />

            <input
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              placeholder="Status (OK / GO / LIVE / etc)"
            />

            <input
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              placeholder="Score mfano 2 - 1"
            />

            <input
              value={form.odds}
              onChange={(e) => setForm({ ...form, odds: e.target.value })}
              placeholder="Odds mfano 1.85"
            />

            <div className="actions">
              <button onClick={updateMatch}>💾 Save</button>
              <button onClick={() => setEditing(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}