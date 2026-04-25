import React, { useEffect, useState } from "react";
import "./AdminAddFinalScore.css";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

export default function AdminFinalScore() {
  const [matches, setMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "matches"));

      const data = snap.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));

      data.sort((a, b) => {
        const da = new Date((a.date || "").replace(" ", "T") + "Z").getTime() || 0;
        const dbb = new Date((b.date || "").replace(" ", "T") + "Z").getTime() || 0;
        return dbb - da;
      });

      setMatches(data);
    } catch (err) {
      console.log("Error loading matches:", err);
      alert("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const openEditScore = (match) => {
    setEditingId(match.id);
    setScoreInput(match.finalScore || match.score || "");
  };

  const saveFinalScore = async () => {
    if (!editingId) return;

    if (!scoreInput.trim()) {
      alert("Enter final score");
      return;
    }

    try {
      await updateDoc(doc(db, "matches", editingId), {
        finalScore: scoreInput.trim()
      });

      setMatches((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, finalScore: scoreInput.trim() }
            : m
        )
      );

      setEditingId(null);
      setScoreInput("");
      alert("Final score saved ✅");
    } catch (err) {
      console.log("Error saving final score:", err);
      alert("Failed to save final score ❌");
    }
  };

  const filteredMatches = matches.filter((m) => {
    const q = search.toLowerCase();

    return (
      (m.A || "").toLowerCase().includes(q) ||
      (m.B || "").toLowerCase().includes(q) ||
      (m.league || "").toLowerCase().includes(q) ||
      (m.status || "").toLowerCase().includes(q) ||
      (m.finalScore || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-finalscore-page">
      <h2>Admin Final Score</h2>

      <input
        type="text"
        className="search-input"
        placeholder="Search match, team or league..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="loading-box">Loading matches...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="empty-box">No matches found</div>
      ) : (
        <div className="match-list">
          {filteredMatches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-top">
                <h3>
                  {match.A || "-"} <span>VS</span> {match.B || "-"}
                </h3>
                <div className="status-badge">{match.status || "-"}</div>
              </div>

              <div className="match-info">
                <p><b>League:</b> {match.league || "-"}</p>
                <p><b>Date:</b> {match.date || "-"}</p>
                <p><b>Current Score:</b> {match.score || "-"}</p>
                <p><b>Final Score:</b> {match.finalScore || "-"}</p>
              </div>

              <div className="action-row">
                <button onClick={() => openEditScore(match)}>
                  Add / Edit Final Score
                </button>
              </div>

              {editingId === match.id && (
                <div className="edit-box">
                  <input
                    type="text"
                    placeholder="Example: 2-1"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                  />

                  <div className="edit-actions">
                    <button className="save-btn" onClick={saveFinalScore}>
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditingId(null);
                        setScoreInput("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}