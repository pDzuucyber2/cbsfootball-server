import { useEffect, useState } from "react";
import { db } from "../firebase";
import { secondaryDb } from "../firebaseSecondary";
import { standardDb } from "../firebaseStandard";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import "./Record.css";

export default function Record() {

  const navigate = useNavigate();

  const [recharge, setRecharge] = useState([]);
  const [cashout, setCashout] = useState([]);
  const [tab, setTab] = useState("recharge");

  const username = localStorage.getItem("username");

  /* 🔥 MASK WALLET */
  const maskNumber = (code, number) => {
    if (!number) return "";
    const num = number.toString().trim();
    const last4 = num.slice(-4);
    return `${code} ********${last4}`;
  };

  /* 🔥 LOAD DATA */
  useEffect(() => {

    const load = async () => {

      try {

        /* =========================
           1. MAIN RECHARGE
        ========================= */
        const rechargeQ = query(
          collection(db, "tsh_transactions"),
          where("username", "==", username),
          where("type", "==", "deposit")
        );

        const rechargeSnap = await getDocs(rechargeQ);

        const rechargeData = rechargeSnap.docs.map(d => ({
          id: d.id,
          source: "main",
          ...d.data()
        }));

        /* =========================
           2. STANDARD RECHARGE
        ========================= */
        const visterQ = query(
          collection(standardDb, "visterdeposte"),
          where("username", "==", username)
        );

        const visterSnap = await getDocs(visterQ);

        const visterData = visterSnap.docs.map(d => ({
          id: d.id,
          source: "standard",
          ...d.data()
        }));

        /* =========================
           🔥 MERGE RECHARGE
        ========================= */
        const allRecharge = [...rechargeData, ...visterData];

        /* =========================
           3. CASHOUT
        ========================= */
        const cashoutQ = query(
          collection(secondaryDb, "withdrawals"),
          where("username", "==", username)
        );

        const cashoutSnap = await getDocs(cashoutQ);

        const cashoutData = cashoutSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        /* =========================
           SORT
        ========================= */
        allRecharge.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        cashoutData.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setRecharge(allRecharge);
        setCashout(cashoutData);

      } catch (err) {
        console.error(err);
      }

    };

    load();

  }, [username]);

  /* 🔥 CANCEL FUNCTION */
  const handleCancel = async (item) => {

    const confirm = window.confirm("Cancel this withdrawal?");
    if (!confirm) return;

    try {

      const withdrawRef = doc(secondaryDb, "withdrawals", item.id);
      const withdrawSnap = await getDoc(withdrawRef);

      if (!withdrawSnap.exists()) return;

      const withdrawal = withdrawSnap.data();

      if (withdrawal.status === "cancelled" || withdrawal.refunded) {
        alert("Already cancelled");
        return;
      }

      // USER
      const userQuery = query(
        collection(db, "users"),
        where("username", "==", withdrawal.username)
      );

      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        alert("User not found");
        return;
      }

      const userDoc = userSnap.docs[0];
      const userData = userDoc.data();

      const fieldMap = {
        TZS: "tshBalance",
        KES: "KESBalance",
        UGX: "UGXBalance",
        RWF: "RWFBalance",
        BIF: "BIFBalance",
        ZMW: "ZMWBalance",
        MWK: "MWKBalance",
        MZN: "MZNBalance",
        USD: "USDBalance",
        SSP: "SSPBalance",
        BWP: "BWPBalance",
        MGA: "MGABalance",
      };

      const field = fieldMap[withdrawal.currency];

      if (field) {

        const current = Number(userData[field] || 0);
        const refundAmount = Number(withdrawal.amount);

        await updateDoc(userDoc.ref, {
          [field]: current + refundAmount
        });

      }

      await updateDoc(withdrawRef, {
        status: "cancelled",
        refunded: true
      });

      setCashout(prev =>
        prev.map(c =>
          c.id === item.id
            ? { ...c, status: "cancelled" }
            : c
        )
      );

      alert("Cancelled & refunded ✅");

    } catch (err) {
      console.error(err);
      alert("Error ❌ " + err.message);
    }

  };

  /* FORMAT TIME */
  const formatTime = (t) => {
    if (!t) return "-";

    const d = t.toDate ? t.toDate() : new Date(t);

    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const list = tab === "recharge" ? recharge : cashout;

  return (

    <div className="record-page">

      <h2>My Records</h2>

      <div className="record-tabs">

        <div
          className={tab === "recharge" ? "tab active" : "tab"}
          onClick={() => setTab("recharge")}
        >
          RechargeHistory
        </div>

        <div
          className={tab === "cashout" ? "tab active" : "tab"}
          onClick={() => setTab("cashout")}
        >
          CashoutHistory
        </div>

      </div>

      {list.map((item, i) => {

        const status = (item.status || "").toLowerCase();

        return (

          <div key={i} className="record-card">

            <div className="row">
              <span>Amount</span>
              <b>{item.amount} {item.currency}</b>
            </div>

            <div className="row">
              <span>Status</span>
              <b className={`status-badge ${status}`}>
                {item.status}
              </b>
            </div>

            <div className="row">
              <span>Method</span>
              <b>
                {tab === "cashout"
                  ? item.walletNetwork
                  : item.provider || item.country || "-"
                }
              </b>
            </div>

            {tab === "cashout" && (
              <div className="row">
                <span>Wallet</span>
                <b>{maskNumber(item.walletCode, item.walletNumber)}</b>
              </div>
            )}

            <div className="row">
              <span>Date</span>
              <b>{formatTime(item.createdAt)}</b>
            </div>

            {tab === "cashout" && status === "processing" && (
              <button
                className="cancel-btn"
                onClick={() => handleCancel(item)}
              >
                Cancel Withdrawal
              </button>
            )}

          </div>

        );

      })}

      {list.length === 0 && (
        <div className="empty">
          Loading {tab} records
        </div>
      )}

      <div className="bottom-nav">

        <button onClick={() => navigate("/depositrecord")}>
          Deposit Record
        </button>

        <button onClick={() => navigate("/withdrawrecord")}>
          Withdraw Record
        </button>

      </div>

    </div>

  );
}