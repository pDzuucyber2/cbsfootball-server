import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AdminJSONUpload() {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔥 TIME CONVERTER (EAT → UTC) */
  const convertToUTC = (dateStr) => {
    const d = new Date(dateStr.replace(" ", "T"));

    // punguza masaa 3
    d.setHours(d.getHours() - 3);

    // rudisha format ile ile
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  const uploadJSON = async () => {
    try {
      setLoading(true);

      const data = JSON.parse(jsonText);

      if (!Array.isArray(data)) {
        alert("JSON lazima iwe array [] ❌");
        return;
      }

      /* 🔥 BULK INSERT NA TIME FIX */
      const promises = data.map((item) =>
        addDoc(collection(db, "matches"), {
          A: item.A,
          B: item.B,
          date: convertToUTC(item.date), // ✅ HAPA NDIPO FIX
          league: item.league,
          logoA: item.logoA?.trim(), // 🔥 remove spaces
          logoB: item.logoB?.trim(),
          status: item.status || "NS",
        })
      );

      await Promise.all(promises);

      alert(data.length + " matches zimehifadhiwa 🚀🔥");
      setJsonText("");

    } catch (error) {
      console.error(error);
      alert("JSON error au network problem ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Bulk Upload Matches</h2>

      <textarea
        rows={15}
        style={{ width: "100%" }}
        placeholder="Paste JSON hapa..."
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />

      <br /><br />

      <button onClick={uploadJSON} disabled={loading}>
        {loading ? "Inapakia..." : "🚀 Upload Matches"}
      </button>
    </div>
  );
}