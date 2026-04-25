
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import "./AneyBonus.css";

const countryCurrency = {
  Kenya: "KES",
  Uganda: "UGX",
  Rwanda: "RWF",
  Burundi: "BIF",
  "DRC - Congo": "USD",
  Zambia: "ZMW",
  Malawi: "MWK",
  Mozambique: "MZN",
  Zimbabwe: "USD",
  "South Sudan": "SSP",
  Botswana: "BWP",
  Madagascar: "MGA",
};

export default function BonusHistory() {
  const username = localStorage.getItem("username");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAmountLabel = (item) => {
    const amount = Number(item.amount || 0);

    if (item.collection === "usdt_transactions") {
      return `${amount.toLocaleString()} USDT`;
    }

    if (item.collection === "visterdeposte") {
      const code = countryCurrency[item.country] || "";
      return `${amount.toLocaleString()} ${code}`;
    }

    return `${amount.toLocaleString()} TZS`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        const tshQuery = query(
          collection(db, "tsh_transactions"),
          where("username", "==", username)
        );

        const usdtQuery = query(
          collection(db, "usdt_transactions"),
          where("username", "==", username)
        );

        const visitorQuery = query(
          collection(standardDb, "visterdeposte"),
          where("username", "==", username)
        );

        const [tshSnap, usdtSnap, visitorSnap] = await Promise.all([
          getDocs(tshQuery),
          getDocs(usdtQuery),
          getDocs(visitorQuery)
        ]);

        const data = [
          ...tshSnap.docs.map(d => ({ id: d.id, ...d.data(), collection: "tsh_transactions" })),
          ...usdtSnap.docs.map(d => ({ id: d.id, ...d.data(), collection: "usdt_transactions" })),
          ...visitorSnap.docs.map(d => ({ id: d.id, ...d.data(), collection: "visterdeposte" }))
        ]
        .filter(item => item.status === "success")
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="bonus-history-page">
        <p className="bonus-loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bonus-history-page">
      <h2 className="bonus-history-title">History</h2>

      {history.length === 0 ? (
        <p className="bonus-empty">No records</p>
      ) : (
        <div className="bonus-history-list">
          {history.map((item) => (
            <div key={item.id} className="simple-history-card">
              
              <div className="simple-row">
                <span className="amount">
                  {getAmountLabel(item)}
                </span>

                <span className="date">
                  {item.createdAt?.seconds
                    ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                    : "-"}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
