import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
  writeBatch
} from "firebase/firestore";

import { standardDb } from "../firebaseStandard";

const defaultScoreOdds = [
  { score: "0 - 0", odds: 1.45 },
  { score: "1 - 0", odds: 4.85 },
  { score: "0 - 1", odds: 5.26 },
  { score: "1 - 1", odds: 1.87 },
  { score: "2 - 1", odds: 0.17 },
  { score: "1 - 2", odds: 3.08 },
  { score: "0 - 2", odds: 4.18 },
  { score: "2 - 0", odds: 2.25 },
  { score: "2 - 2", odds: 1.95 },
  { score: "0 - 3", odds: 2.92 },
  { score: "3 - 0", odds: 3.78 },
  { score: "3 - 3", odds: 1.10 },
  { score: "2 - 3", odds: 1.63 },
  { score: "3 - 2", odds: 1.05 },
  { score: "1 - 3", odds: 3.38 },
  { score: "3 - 1", odds: 2.43 }
];

const AdminAddScoreOdds = () => {
  const [scoreOdds, setScoreOdds] = useState([]);
  const [score, setScore] = useState("");
  const [odds, setOdds] = useState("");

  // 🔴 REALTIME FETCH
  useEffect(() => {
    const unsub = onSnapshot(collection(standardDb, "scoreOdds"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setScoreOdds(data);
    });

    return () => unsub();
  }, []);

  // ✅ SAVE DEFAULT (BATCH)
  const saveDefault = async () => {
    try {
      const snapshot = await getDocs(collection(standardDb, "scoreOdds"));

      if (!snapshot.empty) {
        alert("Tayari zipo ⚠️");
        return;
      }

      const batch = writeBatch(standardDb);

      defaultScoreOdds.forEach((item) => {
        const ref = doc(collection(standardDb, "scoreOdds"));
        batch.set(ref, item);
      });

      await batch.commit();

      alert("Zote zime save kwa pamoja ✅🔥");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔁 RESET + SAVE
  const resetAndSave = async () => {
    try {
      const snapshot = await getDocs(collection(standardDb, "scoreOdds"));

      const batch = writeBatch(standardDb);

      // delete zote
      snapshot.docs.forEach((d) => {
        batch.delete(doc(standardDb, "scoreOdds", d.id));
      });

      // add mpya
      defaultScoreOdds.forEach((item) => {
        const ref = doc(collection(standardDb, "scoreOdds"));
        batch.set(ref, item);
      });

      await batch.commit();

      alert("Reset + Save complete 🔥");
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ ADD
  const handleAdd = async () => {
    if (!score || !odds) return alert("Jaza zote");

    const exists = scoreOdds.some(item => item.score === score);
    if (exists) return alert("Score ipo tayari ⚠️");

    await addDoc(collection(standardDb, "scoreOdds"), {
      score,
      odds: parseFloat(odds)
    });

    setScore("");
    setOdds("");
  };

  // ✏️ UPDATE
  const handleUpdate = async (id, newOdds) => {
    await updateDoc(doc(standardDb, "scoreOdds", id), {
      odds: parseFloat(newOdds)
    });
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    await deleteDoc(doc(standardDb, "scoreOdds", id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Admin Score Odds (Batch System)</h2>

      {/* BUTTONS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={saveDefault}>Save Default</button>
        <button onClick={resetAndSave} style={{ marginLeft: 10 }}>
          Reset + Save
        </button>
      </div>

      {/* ADD FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Score (mfano 2 - 1)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <input
          placeholder="Odds (mfano 2.50)"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
        />

        <button onClick={handleAdd}>Add</button>
      </div>

      {/* LIST */}
      {scoreOdds.map(item => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            borderBottom: "1px solid #ccc",
            paddingBottom: 5
          }}
        >
          <span>{item.score}</span>

          <input
            defaultValue={item.odds}
            onBlur={(e) => handleUpdate(item.id, e.target.value)}
            style={{ width: 80 }}
          />

          <button onClick={() => handleDelete(item.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminAddScoreOdds;