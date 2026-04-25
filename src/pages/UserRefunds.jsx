import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import "./UserRefund.css";

export default function UserRefunds() {
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    const fetchLatestRefund = async () => {
      try {
        if (!username) {
          setLoading(false);
          return;
        }

        const snap = await getDocs(collection(standardDb, "antscore"));

        const refundedList = snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(
            (item) =>
              (item.username || "").toLowerCase() ===
                username.toLowerCase() &&
              item.refunded === true
          )
          .sort((a, b) => {
            const aTime = a.refundedAt?.seconds
              ? a.refundedAt.seconds
              : a.refundedAt?.toDate
              ? a.refundedAt.toDate().getTime() / 1000
              : 0;

            const bTime = b.refundedAt?.seconds
              ? b.refundedAt.seconds
              : b.refundedAt?.toDate
              ? b.refundedAt.toDate().getTime() / 1000
              : 0;

            return bTime - aTime;
          });

        if (refundedList.length > 0) {
          setRefund(refundedList[0]);
        } else {
          setRefund(null);
        }
      } catch (error) {
        console.error("Failed to load refund:", error);
        setRefund(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRefund();
  }, [username]);

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) return "-";

    let date = null;

    if (typeof value?.toDate === "function") {
      date = value.toDate();
    } else if (value?.seconds) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }

    if (!date || isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="refund-page">
        <div className="refund-card">Loading refund...</div>
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="refund-page">
        <div className="refund-card">
          <h2>No Refund</h2>
          <p>You have no refund yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="refund-page">
      <div className="refund-card">
        <h2>My Refund</h2>

        <div className="refund-row">
          <span>Amount</span>
          <b>
            {formatNumber(refund.amount)} {refund.currency || ""}
          </b>
        </div>

        <div className="refund-row">
          <span>Currency</span>
          <b>{refund.currency || "-"}</b>
        </div>

        <div className="refund-row">
          <span>Match</span>
          <b>
            {refund.teamA || "-"} vs {refund.teamB || "-"}
          </b>
        </div>

        <div className="refund-row">
          <span>Status</span>
          <b className="refund-status">Refunded</b>
        </div>

        <div className="refund-row">
          <span>Refund Time</span>
          <b>{formatDate(refund.refundedAt)}</b>
        </div>
      </div>
    </div>
  );
}