import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import "./AdminVistorDeposit.css";

// 🌍 COUNTRY → CURRENCY MAP
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

// 💱 COUNTRY → TZS RATE
const currencyRates = {
  Kenya: 21.5,
  Uganda: 0.77,
  Rwanda: 1.9,
  Burundi: 0.94,
  "DRC - Congo": 2762.43,
  Zambia: 147.23,
  Malawi: 1.382,
  Mozambique: 43.71,
  Zimbabwe: 2762.43,
  "South Sudan": 0.469,
  Botswana: 211.95,
  Madagascar: 0.684,
};

// 🔥 CONVERT FUNCTION
const convertToTZS = (amount, country) => {
  const rate = currencyRates[country];
  if (!rate) return 0;
  return Math.round(amount * rate);
};

const AdminVistorDeposit = () => {
  const [deposits, setDeposits] = useState([]);

  const getDepositOrderTypeLabel = (type) => {
    if (type === "first") return "First";
    if (type === "second") return "Second";
    if (type === "other") return "Other";
    return "-";
  };

  const computeNextDepositTypeForUser = async (username, currentDepositId = null) => {
    const snap = await getDocs(collection(standardDb, "visterdeposte"));

    const userSuccessDeposits = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter(
        (item) =>
          item.username === username &&
          item.status === "success" &&
          item.id !== currentDepositId
      )
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      });

    const nextCount = userSuccessDeposits.length + 1;

    if (nextCount === 1) return "first";
    if (nextCount === 2) return "second";
    return "other";
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(standardDb, "visterdeposte"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        list.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setDeposits(list);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateStatus = async (deposit, newStatus) => {
    try {
      const prevStatus = deposit.status;
      let updateData = { status: newStatus };

      // usifanye tena kama tayari success
      if (prevStatus === "success" && newStatus === "success") return;

      if (newStatus === "success") {
        if (!countryCurrency[deposit.country]) {
          alert("Country not supported");
          return;
        }

        const currency = countryCurrency[deposit.country];
        const fieldName = `${currency}Balance`;

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", deposit.username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("User not found");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        const currentBalance = Number(userData[fieldName] || 0);
        const newBalance = currentBalance + Number(deposit.amount || 0);

        // 🔥 first / second / other
        const depositOrderType = await computeNextDepositTypeForUser(
          deposit.username,
          deposit.id
        );

        updateData.depositOrderType = depositOrderType;

        // 🔥 update user balance
        await updateDoc(doc(db, "users", userDoc.id), {
          [fieldName]: newBalance
        });
      }

      await updateDoc(doc(standardDb, "visterdeposte", deposit.id), updateData);
    } catch (error) {
      console.error(error);
      alert("Status update failed");
    }
  };

  return (
    <div className="admin-container">
      <h2>Visitor Deposits</h2>

      <table className="deposit-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Country</th>
            <th>Customer Phone</th>
            <th>Receiver Name</th>
            <th>Receiver Phone</th>
            <th>Amount</th>
            <th>TZS Value</th>
            <th>Deposit Type</th>
            <th>Transaction</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {deposits.map((dep) => {
            const tzsValue = convertToTZS(Number(dep.amount || 0), dep.country);

            return (
              <tr key={dep.id}>
                <td>{dep.username}</td>
                <td>{dep.country}</td>
                <td>{dep.customerPhone}</td>
                <td>{dep.orbitaName}</td>
                <td>{dep.orbitaPhone}</td>

                <td>
                  {dep.amount} ({dep.country})
                </td>

                <td>≈ {tzsValue.toLocaleString()} TZS</td>

                <td>
                  {dep.status === "success" ? (
                    <span
                      className={`deposit-type ${
                        dep.depositOrderType === "first"
                          ? "deposit-first"
                          : dep.depositOrderType === "second"
                          ? "deposit-second"
                          : "deposit-other"
                      }`}
                    >
                      {getDepositOrderTypeLabel(dep.depositOrderType)}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td>{dep.transactionId}</td>

                <td>
                  <select
                    value={dep.status}
                    onChange={(e) => updateStatus(dep, e.target.value)}
                    className={`status-select ${dep.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="success">Success</option>
                    <option value="rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminVistorDeposit;