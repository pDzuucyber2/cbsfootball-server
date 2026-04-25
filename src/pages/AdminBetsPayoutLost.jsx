import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import "./AdminPayoutLost.css";

export default function AdminPayoutLost() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const fieldMap = {
    TZS: "tshBalance",
    USDT: "usdtBalance",
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

  useEffect(() => {
    fetchBets();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const fetchBets = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(standardDb, "antscore"));

      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((b) => b.result === "lose");

      setBets(list);
    } catch (err) {
      console.error(err);
      showMessage("❌ Error loading bets");
    } finally {
      setLoading(false);
    }
  };

  const refundUser = async (bet) => {
    try {
      if (bet.refunded) {
        showMessage("⚠️ Already refunded");
        return;
      }

      if (bet.locked) {
        showMessage("🔒 This bet is locked");
        return;
      }

      const q = query(
        collection(db, "users"),
        where("username", "==", bet.username)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        showMessage("User not found");
        return;
      }

      const userDoc = snap.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      const userData = userDoc.data();

      const field = fieldMap[bet.currency];

      if (!field) {
        showMessage("❌ Currency field not found");
        return;
      }

      const refundAmount = Number(bet.amount || 0);
      const currentBalance = Number(userData[field] || 0);

      await updateDoc(userRef, {
        [field]: currentBalance + refundAmount
      });

      await updateDoc(doc(standardDb, "antscore", bet.id), {
        refunded: true,
        refundedAt: new Date()
      });

      showMessage(`✅ Refund done for ${bet.username}`);
      fetchBets();
    } catch (err) {
      console.error(err);
      showMessage("❌ Error refunding");
    }
  };

  const refundAll = async () => {
    const availableBets = filteredBets.filter(
      (bet) => !bet.refunded && !bet.locked
    );

    if (availableBets.length === 0) {
      showMessage("⚠️ No unlocked lost bets to refund");
      return;
    }

    try {
      for (const bet of availableBets) {
        const q = query(
          collection(db, "users"),
          where("username", "==", bet.username)
        );

        const snap = await getDocs(q);
        if (snap.empty) continue;

        const userDoc = snap.docs[0];
        const userRef = doc(db, "users", userDoc.id);
        const userData = userDoc.data();

        const field = fieldMap[bet.currency];
        if (!field) continue;

        await updateDoc(userRef, {
          [field]: Number(userData[field] || 0) + Number(bet.amount || 0)
        });

        await updateDoc(doc(standardDb, "antscore", bet.id), {
          refunded: true,
          refundedAt: new Date()
        });
      }

      showMessage("🔥 All unlocked refunds completed");
      fetchBets();
    } catch (err) {
      console.error(err);
      showMessage("❌ Error refunding all");
    }
  };

  const toggleLock = async (bet) => {
    try {
      if (bet.refunded) {
        showMessage("⚠️ Refunded bet cannot be locked");
        return;
      }

      await updateDoc(doc(standardDb, "antscore", bet.id), {
        locked: !bet.locked,
        lockedAt: !bet.locked ? new Date() : null
      });

      showMessage(
        bet.locked
          ? `🔓 Unlocked ${bet.username}`
          : `🔒 Locked ${bet.username}`
      );

      fetchBets();
    } catch (err) {
      console.error(err);
      showMessage("❌ Error updating lock");
    }
  };

  const filteredBets = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return bets;

    return bets.filter((bet) => {
      const username = String(bet.username || "").toLowerCase();
      const teamA = String(bet.teamA || "").toLowerCase();
      const teamB = String(bet.teamB || "").toLowerCase();
      const currency = String(bet.currency || "").toLowerCase();
      const amount = String(bet.amount || "").toLowerCase();
      const status = bet.refunded ? "refunded" : "not refunded";
      const lockStatus = bet.locked ? "locked" : "unlocked";

      return (
        username.includes(term) ||
        teamA.includes(term) ||
        teamB.includes(term) ||
        currency.includes(term) ||
        amount.includes(term) ||
        status.includes(term) ||
        lockStatus.includes(term)
      );
    });
  }, [bets, search]);

  return (
    <div className="admin-refund">
      <h2>🔴 Lost Bets Refund (AntScore)</h2>

      {message && <p className="msg">{message}</p>}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px",
          flexWrap: "wrap"
        }}
      >
        <input
          type="text"
          placeholder="Search username / match / currency..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1",
            minWidth: "220px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
        />

        {!loading && filteredBets.length > 0 && (
          <button className="refund-all" onClick={refundAll}>
            🔥 Refund All Unlocked
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredBets.length === 0 ? (
        <p>No lost bets found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Match</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Refund Status</th>
              <th>Lock Status</th>
              <th>Refund</th>
              <th>Lock</th>
            </tr>
          </thead>

          <tbody>
            {filteredBets.map((bet) => (
              <tr key={bet.id}>
                <td>{bet.username}</td>
                <td>
                  {bet.teamA} vs {bet.teamB}
                </td>
                <td>{bet.amount}</td>
                <td>{bet.currency}</td>

                <td>
                  {bet.refunded ? "✅ Refunded" : "❌ Not Refunded"}
                </td>

                <td>{bet.locked ? "🔒 Locked" : "🔓 Unlocked"}</td>

                <td>
                  {!bet.refunded ? (
                    <button
                      onClick={() => refundUser(bet)}
                      disabled={bet.locked}
                      style={{
                        opacity: bet.locked ? 0.5 : 1,
                        cursor: bet.locked ? "not-allowed" : "pointer"
                      }}
                    >
                      {bet.locked ? "Locked" : "Refund"}
                    </button>
                  ) : (
                    "Done"
                  )}
                </td>

                <td>
                  {!bet.refunded && (
                    <button onClick={() => toggleLock(bet)}>
                      {bet.locked ? "Unlock" : "Lock"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}