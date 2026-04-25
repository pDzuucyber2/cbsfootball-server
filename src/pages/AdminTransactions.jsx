
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import "./AdminTransactions.css";
import { standardDb } from "../firebaseStandard";

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [approvedCount, setApprovedCount] = useState(0);
  const [approvedCountPerUser, setApprovedCountPerUser] = useState({});
  const [searchUser, setSearchUser] = useState("");
  const [todayDeposits, setTodayDeposits] = useState([]);
  const [visitorProcessing, setVisitorProcessing] = useState([]);
  const [depositOrderTypeMap, setDepositOrderTypeMap] = useState({});

  // 👇 WEKA HAPA
  useEffect(() => {
    const fetchVisitorDeposits = async () => {
      try {
        const snap = await getDocs(collection(standardDb, "visterdeposte"));

        const all = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔥 CHUJA PROCESSING TU
        const processingOnly = all.filter((tx) => tx.status === "processing");

        setVisitorProcessing(processingOnly);
      } catch (err) {
        console.error("Visitor deposits error", err);
      }
    };

    fetchVisitorDeposits();
  }, []);

  const getDepositOrderTypeMap = (transactionsList) => {
    const successOnly = [...transactionsList]
      .filter((tx) => tx.status === "success")
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds
          ? a.createdAt.seconds
          : a.createdAt?.toDate
          ? Math.floor(a.createdAt.toDate().getTime() / 1000)
          : 0;

        const bTime = b.createdAt?.seconds
          ? b.createdAt.seconds
          : b.createdAt?.toDate
          ? Math.floor(b.createdAt.toDate().getTime() / 1000)
          : 0;

        return aTime - bTime;
      });

    const userCounts = {};
    const typeMap = {};

    successOnly.forEach((tx) => {
      const user = tx.username || "Unknown";
      userCounts[user] = (userCounts[user] || 0) + 1;

      let type = "other";
      if (userCounts[user] === 1) type = "first";
      else if (userCounts[user] === 2) type = "second";

      typeMap[tx.id] = type;
    });

    return typeMap;
  };

  const getDepositOrderTypeLabel = (type) => {
    if (type === "first") return "First";
    if (type === "second") return "Second";
    if (type === "other") return "Other";
    return "-";
  };

  const computeNextDepositTypeForUser = async (username, currentTxId = null) => {
    const tshSnap = await getDocs(collection(db, "tsh_transactions"));

    const userSuccessTx = tshSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter(
        (item) =>
          item.username === username &&
          item.status === "success" &&
          item.id !== currentTxId
      )
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

    const nextCount = userSuccessTx.length + 1;

    if (nextCount === 1) return "first";
    if (nextCount === 2) return "second";
    return "other";
  };

  // Fetch TZS transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const tshSnap = await getDocs(collection(db, "tsh_transactions"));

        const combined = tshSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          collection: "tsh_transactions",
        }));

        combined.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setTransactions(combined);

        const orderTypeMap = getDepositOrderTypeMap(combined);
        setDepositOrderTypeMap(orderTypeMap);

        const approved = combined.filter((tx) => tx.status === "success").length;
        setApprovedCount(approved);

        const countPerUser = combined.reduce((acc, tx) => {
          if (tx.status === "success") {
            const user = tx.username || "Unknown";
            acc[user] = (acc[user] || 0) + 1;
          }
          return acc;
        }, {});
        setApprovedCountPerUser(countPerUser);

        // ===== Today approved deposits (TZS) =====
        const today = new Date().toDateString();

        const todayApproved = combined.filter((tx) => {
          if (tx.status !== "success") return false;
          const txDate = tx.createdAt?.seconds
            ? new Date(tx.createdAt.seconds * 1000)
            : tx.createdAt?.toDate
            ? tx.createdAt.toDate()
            : null;
          return txDate && txDate.toDateString() === today;
        });

        // fetch referralBy
        const depositsWithReferral = await Promise.all(
          todayApproved.map(async (tx) => {
            try {
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("username", "==", tx.username));
              const snap = await getDocs(q);
              let referralBy = "Unknown";
              if (!snap.empty) referralBy = snap.docs[0].data().referralBy || "None";

              return {
                username: tx.username,
                amount: tx.amount,
                referralBy,
                id: tx.id,
                status: tx.status,
                depositOrderType:
                  tx.depositOrderType || orderTypeMap[tx.id] || "other",
              };
            } catch {
              return {
                username: tx.username,
                amount: tx.amount,
                referralBy: "Unknown",
                id: tx.id,
                status: tx.status,
                depositOrderType:
                  tx.depositOrderType || orderTypeMap[tx.id] || "other",
              };
            }
          })
        );

        setTodayDeposits(depositsWithReferral);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const navigate = useNavigate();

  const addTshToUserBalance = async (username, amount) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        const currentBalance = userDoc.data().tshBalance || 0;

        await updateDoc(userDoc.ref, {
          tshBalance: currentBalance + amount,
        });
      } else {
        const userRef = doc(db, "users", username);
        await setDoc(userRef, { username, tshBalance: amount }, { merge: true });
      }
    } catch (err) {
      console.error("Failed to update TSH balance:", err);
    }
  };

  const updateStatus = async (id, collectionName, newStatus, tx) => {
    setUpdatingId(id);
    try {
      const docRef = doc(db, collectionName, id);
      const prevStatus = tx.status;

      let updateData = { status: newStatus };

      // 🚫 USIONGEZE MARA MBILI
      if (prevStatus === "success" && newStatus === "success") return;

      // ✅ WEKA DEPOSIT TYPE IKIWA INAENDA SUCCESS
      if (newStatus === "success") {
        const depositOrderType = await computeNextDepositTypeForUser(
          tx.username,
          id
        );
        updateData.depositOrderType = depositOrderType;
      }

      // ✅ ONGEZA PESA IKIWA INAENDA SUCCESS
      if (newStatus === "success" && tx.amount) {
        const amount = Number(tx.amount);
        await addTshToUserBalance(tx.username, amount);
      }

      await updateDoc(docRef, updateData);

      // Update state locally
      if (collectionName === "tsh_transactions") {
        setTransactions((prev) => {
          const updated = prev.map((t) =>
            t.id === id ? { ...t, ...updateData } : t
          );

          const newTypeMap = getDepositOrderTypeMap(updated);
          setDepositOrderTypeMap(newTypeMap);

          return updated;
        });

        setTodayDeposits((prev) =>
          prev.map((d) =>
            d.id === id
              ? {
                  ...d,
                  ...updateData,
                  depositOrderType:
                    updateData.depositOrderType || d.depositOrderType,
                }
              : d
          )
        );

        // Remove from todayDeposits if status != pending
        if (newStatus !== "pending") {
          setTodayDeposits((prev) =>
            prev.filter((d) => d.id !== id)
          );
        }
      }
    } catch (err) {
      console.error("Error updating:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    (tx.username || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h2>Admin Dashboard - Transactions</h2>

      {loading ? (
        <p className="loading">Inapakia...</p>
      ) : (
        <>
          <div className="stats-box">
            <h3>Total Approved Deposits</h3>
            <span>{approvedCount}</span>

            {visitorProcessing.length > 0 && (
              <div
                className="visitor-processing-card"
                onClick={() => navigate("/Admin-VistorDeposit")}
              >
                <h4>Visitor Deposits (Processing)</h4>

                {visitorProcessing.map((tx, i) => (
                  <div key={i} className="processing-item">
                    <p><b>User:</b> {tx.username}</p>
                    <p><b>Country:</b> {tx.country}</p>
                    <p><b>Amount:</b> {tx.amount} ({tx.country})</p>
                    <p><b>Receiver Name:</b> {tx.orbitaName}</p>
                    <p><b>Receiver Phone:</b> {tx.orbitaPhone}</p>

                    <p>
                      <b>Status:</b>{" "}
                      <span className={`status ${tx.status}`}>{tx.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="today-deposits">
              <h4>Today's Deposits</h4>

              {todayDeposits.length === 0 ? (
                <p>No deposits today</p>
              ) : (
                <div className="deposits-boxes">
                  {/* TZS deposits */}
                  {todayDeposits.map((d, i) => (
                    <div className="deposit-card tsh-deposit" key={i}>
                      <p><b>Username:</b> {d.username}</p>
                      <p><b>Amount:</b> {d.amount?.toLocaleString()} TZS</p>
                      <p><b>Referral:</b> {d.referralBy}</p>
                      <p>
                        <b>Deposit Type:</b>{" "}
                        {getDepositOrderTypeLabel(d.depositOrderType)}
                      </p>
                      <select
                        value={d.status || "pending"}
                        onChange={(e) =>
                          updateStatus(d.id, "tsh_transactions", e.target.value, d)
                        }
                      >
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Tafuta username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          {/* Approved deposits per user */}
          <div className="approved-users">
            <h3>Approved Deposits Per User</h3>
            <ul>
              {Object.entries(approvedCountPerUser)
                .filter(([user]) =>
                  user.toLowerCase().includes(searchUser.toLowerCase())
                )
                .map(([user, count]) => (
                  <li key={user}>
                    {user} <span>{count}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* TZS Transactions Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>LipaNumber</th>
                  <th>Provider</th>
                  <th>Phone</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>Deposit Type</th>
                  <th>Status</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      {tx.createdAt?.seconds
                        ? new Date(tx.createdAt.seconds * 1000).toLocaleString()
                        : tx.createdAt?.toDate
                        ? tx.createdAt.toDate().toLocaleString()
                        : "-"}
                    </td>
                    <td>{tx.username}</td>
                    <td>{tx.businessNumber || tx.number || "-"}</td>
                    <td>{tx.provider}</td>
                    <td>{tx.phone}</td>
                    <td>{tx.recipient}</td>
                    <td>
                      {tx.amount?.toLocaleString()} {tx.currency || "TZS"}
                      <br />
                      {`Currency: ${tx.currency || "TZS"}`}
                      <br />
                      {tx.status === "success" ? `TSH: ${tx.amount}` : ""}
                    </td>
                    <td>
                      {tx.status === "success"
                        ? getDepositOrderTypeLabel(
                            tx.depositOrderType || depositOrderTypeMap[tx.id]
                          )
                        : "-"}
                    </td>
                    <td>
                      <span className={`status ${tx.status}`}>{tx.status}</span>
                    </td>
                    <td>
                      <select
                        disabled={updatingId === tx.id}
                        value={tx.status}
                        onChange={(e) =>
                          updateStatus(tx.id, tx.collection, e.target.value, tx)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="success">Success</option>
                        <option value="rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminTransactions;