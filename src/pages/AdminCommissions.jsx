import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";

import "./AdminCommission.css";

const AdminCommission = () => {
  const adminUsername = localStorage.getItem("username");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currencyMap = {
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

  const LEVEL_PERCENT = {
    level1: 8,
    level2: 6,
    level3: 4,
  };

  const formatMoney = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const addAmountToObject = (obj, currency, amount) => {
    if (!currency) return;
    if (!obj[currency]) obj[currency] = 0;
    obj[currency] += Number(amount || 0);
  };

  const formatCurrency = (obj = {}) => {
    const entries = Object.entries(obj).filter(([, value]) => Number(value) > 0);

    if (entries.length === 0) return "0.00";

    return entries
      .map(([currency, value]) => `${formatMoney(value)} ${currency}`)
      .join(" + ");
  };

  const parseFirestoreDate = (value) => {
    if (!value) return null;

    if (typeof value?.toDate === "function") {
      return value.toDate();
    }

    if (value instanceof Date) {
      return value;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  };

  const isWithinLast7Days = (dateObj) => {
    if (!dateObj) return false;

    const now = new Date();
    const past7 = new Date();
    past7.setDate(now.getDate() - 7);

    return dateObj >= past7 && dateObj <= now;
  };

  const createEmptyReceiverRow = (username, status = "waiting") => ({
    username,
    level1: {},
    level2: {},
    level3: {},
    total: {},
    status,
  });

  const addCommissionToMap = (
    map,
    receiverUsername,
    currency,
    amount,
    level,
    status = "waiting"
  ) => {
    if (!receiverUsername) return;
    if (Number(amount || 0) <= 0) return;

    if (!map[receiverUsername]) {
      map[receiverUsername] = createEmptyReceiverRow(receiverUsername, status);
    }

    addAmountToObject(map[receiverUsername][level], currency, amount);
    addAmountToObject(map[receiverUsername].total, currency, amount);
  };

  const getUserChain = (usersMap, username) => {
    const player = usersMap[username];
    if (!player) {
      return { sponsor1: null, sponsor2: null, sponsor3: null };
    }

    const sponsor1 = player.referralBy || null;
    const sponsor2 =
      sponsor1 && usersMap[sponsor1] ? usersMap[sponsor1].referralBy || null : null;
    const sponsor3 =
      sponsor2 && usersMap[sponsor2] ? usersMap[sponsor2].referralBy || null : null;

    return { sponsor1, sponsor2, sponsor3 };
  };

  const getDownlinesUpTo3Levels = (usersMap, rootUsername) => {
    const level1 = [];
    const level2 = [];
    const level3 = [];

    Object.values(usersMap).forEach((user) => {
      if (user.referralBy === rootUsername && user.username) {
        level1.push(user.username);
      }
    });

    level1.forEach((u1) => {
      Object.values(usersMap).forEach((user) => {
        if (user.referralBy === u1 && user.username) {
          level2.push(user.username);
        }
      });
    });

    level2.forEach((u2) => {
      Object.values(usersMap).forEach((user) => {
        if (user.referralBy === u2 && user.username) {
          level3.push(user.username);
        }
      });
    });

    return {
      level1,
      level2,
      level3,
      set: new Set([rootUsername, ...level1, ...level2, ...level3]),
    };
  };

  const commissionDocId = (receiverUsername) =>
    `${adminUsername}__${receiverUsername}`;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const commissionSnap = await getDocs(
          query(
            collection(db, "admin_commissions"),
            where("createdByAdmin", "==", adminUsername)
          )
        );

        const savedCommissionDocs = {};
        commissionSnap.forEach((item) => {
          const data = item.data();
          if (data.username) {
            savedCommissionDocs[data.username] = {
              id: item.id,
              ...data,
            };
          }
        });

        const usersSnap = await getDocs(collection(db, "users"));
        const usersMap = {};

        usersSnap.forEach((item) => {
          const data = item.data();
          if (data.username) {
            usersMap[data.username] = {
              id: item.id,
              ...data,
            };
          }
        });

        const adminTree = getDownlinesUpTo3Levels(usersMap, adminUsername);
        const adminTeamSet = adminTree.set;

        const betsSnap = await getDocs(collection(standardDb, "antscore"));
        const commissionMap = {};

        betsSnap.forEach((item) => {
          const bet = item.data();

          if (bet.result !== "win") return;

          const matchDate = parseFirestoreDate(
            bet.matchTimestamp || bet.paidAt || bet.createdAt || bet.matchDate
          );

          if (!isWithinLast7Days(matchDate)) return;

          const playerUsername = bet.username;
          if (!playerUsername) return;
          if (!adminTeamSet.has(playerUsername)) return;

          const player = usersMap[playerUsername];
          if (!player) return;

          const currency = bet.currency || "USD";
          const profit = Number(bet.profit || 0);
          if (profit <= 0) return;

          const { sponsor1, sponsor2, sponsor3 } = getUserChain(
            usersMap,
            playerUsername
          );

          if (sponsor1 && adminTeamSet.has(sponsor1)) {
            const amount1 = (profit * LEVEL_PERCENT.level1) / 100;
            addCommissionToMap(
              commissionMap,
              sponsor1,
              currency,
              amount1,
              "level1",
              savedCommissionDocs[sponsor1]?.status || "waiting"
            );
          }

          if (sponsor2 && adminTeamSet.has(sponsor2)) {
            const amount2 = (profit * LEVEL_PERCENT.level2) / 100;
            addCommissionToMap(
              commissionMap,
              sponsor2,
              currency,
              amount2,
              "level2",
              savedCommissionDocs[sponsor2]?.status || "waiting"
            );
          }

          if (sponsor3 && adminTeamSet.has(sponsor3)) {
            const amount3 = (profit * LEVEL_PERCENT.level3) / 100;
            addCommissionToMap(
              commissionMap,
              sponsor3,
              currency,
              amount3,
              "level3",
              savedCommissionDocs[sponsor3]?.status || "waiting"
            );
          }
        });

        const finalRows = Object.values(commissionMap).map((row) => {
          const saved = savedCommissionDocs[row.username];

          if (!saved) return row;

          return {
            ...row,
            status: saved.status || row.status,
          };
        });

        setRows(finalRows);
      } catch (err) {
        console.error("Load commission error:", err);
        setRows([]);
      }

      setLoading(false);
    };

    if (adminUsername) {
      load();
    } else {
      setRows([]);
      setLoading(false);
    }
  }, [adminUsername]);

  const processOne = async (row) => {
    try {
      const ref = doc(db, "admin_commissions", commissionDocId(row.username));

      await setDoc(
        ref,
        {
          createdByAdmin: adminUsername,
          username: row.username,
          total: row.total,
          level1: row.level1,
          level2: row.level2,
          level3: row.level3,
          status: "processing",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setRows((prev) =>
        prev.map((r) =>
          r.username === row.username ? { ...r, status: "processing" } : r
        )
      );
    } catch (err) {
      console.error("Process one error:", err);
    }
  };

  const payOne = async (row) => {
    try {
      const commissionRef = doc(db, "admin_commissions", commissionDocId(row.username));
      const commissionSnap = await getDoc(commissionRef);

      if (!commissionSnap.exists()) return;

      const commissionData = commissionSnap.data();
      if (commissionData.status !== "processing") return;

      const snap = await getDocs(
        query(collection(db, "users"), where("username", "==", row.username))
      );

      if (snap.empty) return;

      const userDoc = snap.docs[0];
      const userData = userDoc.data();
      const updates = {};

      Object.entries(row.total).forEach(([currency, amount]) => {
        const field = currencyMap[currency];
        if (!field) return;

        updates[field] = Number(userData[field] || 0) + Number(amount || 0);
      });

      // HAPA NDIYO BALANCE INAENDA KWENYE COLLECTION YA USERS
      await updateDoc(doc(db, "users", userDoc.id), updates);

      await updateDoc(commissionRef, {
        status: "success",
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setRows((prev) =>
        prev.map((r) =>
          r.username === row.username ? { ...r, status: "success" } : r
        )
      );
    } catch (err) {
      console.error("Pay one error:", err);
    }
  };

  const moveToProcessing = async () => {
    setActionLoading(true);

    for (const row of rows.filter((r) => r.status === "waiting")) {
      await processOne(row);
    }

    setActionLoading(false);
  };

  const moveToSuccess = async () => {
    setActionLoading(true);

    for (const row of rows.filter((r) => r.status === "processing")) {
      await payOne(row);
    }

    setActionLoading(false);
  };

  const renderTable = (title, list) => (
    <>
      <h3>{title}</h3>

      {list.length === 0 ? (
        <p>No data</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Level 1</th>
              <th>Level 2</th>
              <th>Level 3</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {list.map((row, index) => (
              <tr key={index}>
                <td>{row.username}</td>
                <td>{formatCurrency(row.level1)}</td>
                <td>{formatCurrency(row.level2)}</td>
                <td>{formatCurrency(row.level3)}</td>
                <td>{formatCurrency(row.total)}</td>
                <td>{row.status}</td>
                <td>
                  {row.status === "waiting" && (
                    <button onClick={() => processOne(row)}>Process</button>
                  )}

                  {row.status === "processing" && (
                    <button onClick={() => payOne(row)}>Pay</button>
                  )}

                  {row.status === "success" && <span>Paid</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h2>🔥 Admin Commission</h2>

      <div className="action-buttons">
        <button onClick={moveToProcessing} disabled={actionLoading}>
          {actionLoading ? "Processing..." : "🔄 Process All"}
        </button>

        <button onClick={moveToSuccess} disabled={actionLoading}>
          {actionLoading ? "Processing..." : "✅ Pay All"}
        </button>
      </div>

      {renderTable("🟥 Waiting", rows.filter((r) => r.status === "waiting"))}
      {renderTable("🟨 Processing", rows.filter((r) => r.status === "processing"))}
      {renderTable("🟩 Success", rows.filter((r) => r.status === "success"))}
    </div>
  );
};

export default AdminCommission;