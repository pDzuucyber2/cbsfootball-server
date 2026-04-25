import React, { useState } from "react";
import "./AdminAutoImport.css";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

export default function AdminAutoImport() {

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState("2026-04-08");
  const [search, setSearch] = useState("");

  const [openCountries, setOpenCountries] = useState({});
  const [openLeagues, setOpenLeagues] = useState({});

  // 🔥 NEW
  const [limit, setLimit] = useState(50);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* 🔥 DATE SHORTCUTS */
  const getToday = () => new Date().toISOString().slice(0, 10);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  /* 🔥 FETCH */
  const fetchMatches = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${date}`
      );

      const data = await res.json();

      const formatted = data.events.map((m) => {
        const d = new Date(m.startTimestamp * 1000);

        return {
          A: m.homeTeam.name,
          B: m.awayTeam.name,
          date: d.toISOString().slice(0, 19).replace("T", " "),
          time: d.toTimeString().slice(0, 5), // HH:MM
          league: m.tournament.name,
          country: m.tournament.category.name,
          logoA: `https://api.sofascore.app/api/v1/team/${m.homeTeam.id}/image`,
          logoB: `https://api.sofascore.app/api/v1/team/${m.awayTeam.id}/image`,
        };
      });

      setMatches(formatted);

    } catch (err) {
      console.error(err);
      alert("Error fetching ❌");
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 GROUP */
  const grouped = {};

  matches.forEach((m) => {
    if (!grouped[m.country]) grouped[m.country] = {};
    if (!grouped[m.country][m.league]) grouped[m.country][m.league] = [];

    grouped[m.country][m.league].push(m);
  });

  /* 🔥 TIME RANGE FUNCTION */
  const isWithinTimeRange = (time) => {
    if (!startTime || !endTime) return true;

    return time >= startTime && time <= endTime;
  };

  /* 🔥 FILTER */
  const filteredGrouped = {};

  Object.keys(grouped).forEach((country) => {
    Object.keys(grouped[country]).forEach((league) => {

      const filtered = grouped[country][league]
        .filter((m) =>
          m.A.toLowerCase().includes(search.toLowerCase()) ||
          m.B.toLowerCase().includes(search.toLowerCase())
        )
        .filter((m) => isWithinTimeRange(m.time))
        .slice(0, limit);

      if (filtered.length > 0) {
        if (!filteredGrouped[country]) filteredGrouped[country] = {};
        filteredGrouped[country][league] = filtered;
      }
    });
  });

  /* 🔥 DUPLICATE */
  const isDuplicate = async (match) => {
    const q = query(
      collection(db, "matches"),
      where("A", "==", match.A),
      where("B", "==", match.B),
      where("date", "==", match.date)
    );

    const snap = await getDocs(q);
    return !snap.empty;
  };

  /* 🔥 UPLOAD */
  const uploadMatches = async () => {
    try {
      setUploading(true);
      let count = 0;

      for (let country in filteredGrouped) {
        for (let league in filteredGrouped[country]) {
          for (let m of filteredGrouped[country][league]) {

            const exists = await isDuplicate(m);

            if (!exists) {
              await addDoc(collection(db, "matches"), m);
              count++;
            }
          }
        }
      }

      alert(count + " matches zimeongezwa 🚀");

    } catch (err) {
      console.error(err);
      alert("Upload error ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">

      <h2 className="title">🔥 Smart Admin Matches</h2>

      {/* 🔥 QUICK BUTTONS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setDate(getToday())}>Today</button>
        <button onClick={() => setDate(getTomorrow())}>Tomorrow</button>
      </div>

      <br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input"
      />

      <input
        type="text"
        placeholder="Search team..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
      />

      {/* 🔥 TIME RANGE */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="input"
        />

        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="input"
        />
      </div>

      {/* 🔥 LIMIT */}
      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="input"
        placeholder="Limit e.g 50"
      />

      <button onClick={fetchMatches} className="button">
        {loading ? "Loading..." : "📥 Fetch Matches"}
      </button>

      <button onClick={uploadMatches} className="uploadBtn">
        🚀 Upload Filtered
      </button>

      <br /><br />

      {/* 🔥 DISPLAY */}
      {Object.keys(filteredGrouped).map((country) => (
        <div key={country} className="countryBlock">

          <div
            className="countryHeader"
            onClick={() =>
              setOpenCountries({
                ...openCountries,
                [country]: !openCountries[country]
              })
            }
          >
            🌍 {country}
          </div>

          {openCountries[country] &&
            Object.keys(filteredGrouped[country]).map((league) => {

              const matches = filteredGrouped[country][league];

              return (
                <div key={league} className="leagueBlock">

                  <div
                    className="leagueHeader"
                    onClick={() =>
                      setOpenLeagues({
                        ...openLeagues,
                        [league]: !openLeagues[league]
                      })
                    }
                  >
                    🏆 {league} ({matches.length})
                  </div>

                  {openLeagues[league] &&
                    matches.map((m, i) => (
                      <div key={i} className="matchRow">

                        <div className="team">
                          <img src={m.logoA} alt="" />
                          {m.A}
                        </div>

                        <div className="vs">{m.time}</div>

                        <div className="team">
                          <img src={m.logoB} alt="" />
                          {m.B}
                        </div>

                      </div>
                    ))}
                </div>
              );
            })}
        </div>
      ))}

    </div>
  );
}