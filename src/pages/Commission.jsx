import React, { useEffect, useState } from "react";
import "./Commissions.css";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function CommissionHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");

  /* ================= FORMAT ================= */
  const formatCurrency = (obj = {}) => {
    const entries = Object.entries(obj).filter(([, value]) => Number(value) > 0);

    if (entries.length === 0) return "0.00";

    return entries
      .map(([currency, value]) => `${Number(value).toFixed(2)} ${currency}`)
      .join(" + ");
  };

  /* ================= DATE ================= */
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "N/A";
    const d = new Date(timestamp.seconds * 1000);
    return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString();
  };

  /* ================= LOAD ================= */
  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "admin_commissions"),
          where("username", "==", username)
        );

        const snap = await getDocs(q);

        let list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔥 SORT latest first
        list.sort((a, b) => {
          const aTime =
            a.paidAt?.seconds ||
            a.updatedAt?.seconds ||
            a.createdAt?.seconds ||
            0;

          const bTime =
            b.paidAt?.seconds ||
            b.updatedAt?.seconds ||
            b.createdAt?.seconds ||
            0;

          return bTime - aTime;
        });

        setData(list);

        // optional cache
        localStorage.setItem("my_commissions", JSON.stringify(list));

      } catch (error) {
        console.error("Error loading commissions:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [username]);

  /* ================= UI ================= */
  return (
    <div className="commission-container">
      <h2>💰 My Commission</h2>

      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && (
        <p className="no-data">No commission yet</p>
      )}

      <div className="commission-list">
        {data.map((item, i) => (
          <div key={item.id || i} className="commission-card">

            {/* TOTAL */}
            <div className="top">
              <span className="amount">
                💰 {formatCurrency(item.total)}
              </span>

              <span className={`status ${item.status || "waiting"}`}>
                {item.status || "waiting"}
              </span>
            </div>

            {/* CREATED */}
            <div className="date">
              📅 Created: {formatDate(item.createdAt)}
            </div>

            {/* PAID */}
            {item.paidAt && (
              <div className="date paid-date">
                ✅ Paid: {formatDate(item.paidAt)}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}