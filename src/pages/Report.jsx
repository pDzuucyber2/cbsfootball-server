import React, { useEffect, useState } from "react";
import "./Report.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Report() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState(0);

  const getLast7Days = async () => {
    try {
      const snap = await getDocs(collection(db, "tsh_transactions"));

      const now = new Date();
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

      let currentWeek = {};
      let lastWeek = {};

      // tengeneza siku 7 za sasa
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        currentWeek[days[d.getDay()]] = 0;
      }

      // tengeneza wiki iliyopita
      for (let i = 7; i < 14; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        lastWeek[days[d.getDay()]] = 0;
      }

      snap.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt?.seconds) return;

        const date = new Date(data.createdAt.seconds * 1000);
        const diff = (now - date) / (1000 * 60 * 60 * 24);
        const day = days[date.getDay()];

        if (diff <= 7) {
          currentWeek[day] += 1;
        } else if (diff > 7 && diff <= 14) {
          lastWeek[day] += 1;
        }
      });

      const formatted = Object.keys(currentWeek).map((day) => ({
        day,
        views: currentWeek[day],
      }));

      const currentTotal = Object.values(currentWeek).reduce((a, b) => a + b, 0);
      const lastTotal = Object.values(lastWeek).reduce((a, b) => a + b, 0);

      const percentage =
        lastTotal === 0 ? 100 : ((currentTotal - lastTotal) / lastTotal) * 100;

      setWeeklyData(formatted);
      setTotal(currentTotal);
      setPercent(percentage.toFixed(0));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLast7Days();
  }, []);

  return (
    <div className="report-container">
      <h2>📊 Insights</h2>

      <div className="report-card">
        <h3>{total} Views</h3>

        <p style={{ color: percent >= 0 ? "lime" : "red" }}>
          {percent}% from last 7 days
        </p>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData}>
            <XAxis dataKey="day" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#00ffcc"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}