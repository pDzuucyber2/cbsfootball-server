
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import "./AdminConvertHistory.css";

export default function AdminConvertHistory() {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadConversions = async () => {
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "transfers"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const data = snap.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((item) => item.type === "self_currency_conversion");

      setConversions(data);
    } catch (err) {
      console.error("Error loading conversions:", err);
      setError("Failed to load conversion history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversions();
  }, []);

  const formatNumber = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    if (typeof timestamp?.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }

    return "N/A";
  };

  const filteredConversions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return conversions;

    return conversions.filter((item) =>
      String(item.username || "").toLowerCase().includes(keyword)
    );
  }, [conversions, search]);

  const totalConversions = filteredConversions.length;

  const totalFees = useMemo(() => {
    return filteredConversions.reduce(
      (sum, item) => sum + Number(item.feeAmount || 0),
      0
    );
  }, [filteredConversions]);

  return (
    <div className="admin-convert-page">
      <div className="admin-convert-header">
        <h2>💱 All Convert History</h2>
        <button onClick={loadConversions} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-convert-tools">
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!loading && !error && (
        <div className="admin-convert-summary">
          <div className="summary-card">
            <span className="summary-label">Total Conversions</span>
            <strong className="summary-value">{totalConversions}</strong>
          </div>

          <div className="summary-card">
            <span className="summary-label">Total Fee</span>
            <strong className="summary-value">{formatNumber(totalFees)}</strong>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-convert-loading">Loading conversion history...</div>
      ) : error ? (
        <div className="admin-convert-empty">{error}</div>
      ) : filteredConversions.length === 0 ? (
        <div className="admin-convert-empty">No conversion history found</div>
      ) : (
        <div className="admin-convert-table-wrap">
          <table className="admin-convert-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Fee</th>
                <th>From Rate</th>
                <th>To Rate</th>
                <th>Before From</th>
                <th>After To</th>
              </tr>
            </thead>

            <tbody>
              {filteredConversions.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.username || "-"}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    {formatNumber(item.fromAmount)} {item.fromCurrency || ""}
                  </td>
                  <td>
                    {formatNumber(item.toAmount)} {item.toCurrency || ""}
                  </td>
                  <td className="fee-cell">
                    {formatNumber(item.feeAmount)} {item.toCurrency || ""} (
                    {item.feePercent || 0}%)
                  </td>
                  <td>{formatNumber(item.fromRate)}</td>
                  <td>{formatNumber(item.toRate)}</td>
                  <td>
                    {formatNumber(item.balanceBeforeFrom)}{" "}
                    {item.fromCurrency || ""}
                  </td>
                  <td>
                    {formatNumber(item.balanceAfterTo)} {item.toCurrency || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}