import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import "./AdminBalanceControl.css";

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

export default function AdminBalanceManager() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedCurrency, setSelectedCurrency] = useState("TZS");
  const [amount, setAmount] = useState("");

  const searchUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setUserData(null);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username.trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setMessage("Username haijapatikana.");
        return;
      }

      const userDoc = snap.docs[0];
      const data = userDoc.data();

      setUserData({
        id: userDoc.id,
        ...data,
      });

      setMessage("User amepatikana.");
    } catch (error) {
      console.error(error);
      setMessage("Imeshindikana kutafuta user.");
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (type) => {
    if (!userData) {
      setMessage("Tafuta user kwanza.");
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Weka kiasi sahihi.");
      return;
    }

    const balanceField = fieldMap[selectedCurrency];
    const currentBalance = Number(userData[balanceField] || 0);

    let newBalance = currentBalance;

    if (type === "add") {
      newBalance = currentBalance + numericAmount;
    }

    if (type === "deduct") {
      if (numericAmount > currentBalance) {
        setMessage("Kiasi cha kutoa kinazidi balance iliyopo.");
        return;
      }
      newBalance = currentBalance - numericAmount;
    }

    try {
      setLoading(true);
      setMessage("");

      const userRef = doc(db, "users", userData.id);

      await updateDoc(userRef, {
        [balanceField]: newBalance,
      });

      setUserData((prev) => ({
        ...prev,
        [balanceField]: newBalance,
      }));

      setAmount("");
      setMessage(
        type === "add"
          ? `${selectedCurrency} balance imeongezwa kwa mafanikio.`
          : `${selectedCurrency} balance imepunguzwa kwa mafanikio.`
      );
    } catch (error) {
      console.error(error);
      setMessage("Imeshindikana kubadilisha balance.");
    } finally {
      setLoading(false);
    }
  };

  const renderBalance = (label, field) => (
    <div className="abm-balance-box">
      <span className="abm-balance-title">{label}</span>
      <span className="abm-balance-value">
        {Number(userData?.[field] || 0).toLocaleString()}
      </span>
    </div>
  );

  return (
    <div className="abm-page">
      <div className="abm-container">
        <div className="abm-header">
          <h2>Admin Balance Manager</h2>
          <p>Search username, add amount, or deduct amount.</p>
        </div>

        <form className="abm-search-form" onSubmit={searchUser}>
          <input
            className="abm-input"
            type="text"
            placeholder="Andika username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button className="abm-btn abm-btn-search" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {message && <div className="abm-message">{message}</div>}

        {userData && (
          <div className="abm-card">
            <h3 className="abm-card-title">{userData.username || "User"}</h3>

            <div className="abm-user-info">
              <p>
                <strong>Full Name:</strong> {userData.fullName || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {userData.phoneNumber || "-"}
              </p>
              <p>
                <strong>Country:</strong> {userData.country || "-"}
              </p>
              <p>
                <strong>Role:</strong> {userData.role || "-"}
              </p>
            </div>

            <h4 className="abm-section-title">Balances</h4>
            <div className="abm-balance-grid">
              {renderBalance("TZS", "tshBalance")}
              {renderBalance("USDT", "usdtBalance")}
              {renderBalance("KES", "KESBalance")}
              {renderBalance("UGX", "UGXBalance")}
              {renderBalance("RWF", "RWFBalance")}
              {renderBalance("BIF", "BIFBalance")}
              {renderBalance("ZMW", "ZMWBalance")}
              {renderBalance("MWK", "MWKBalance")}
              {renderBalance("MZN", "MZNBalance")}
              {renderBalance("USD", "USDBalance")}
              {renderBalance("SSP", "SSPBalance")}
              {renderBalance("BWP", "BWPBalance")}
              {renderBalance("MGA", "MGABalance")}
            </div>

            <div className="abm-action-card">
              <h4 className="abm-section-title">Badilisha Balance</h4>

              <div className="abm-action-row">
                <select
                  className="abm-select"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {Object.keys(fieldMap).map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>

                <input
                  className="abm-input"
                  type="number"
                  placeholder="Weka kiasi"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="abm-button-row">
                <button
                  type="button"
                  className="abm-btn abm-btn-add"
                  onClick={() => updateBalance("add")}
                  disabled={loading}
                >
                  Add Amount
                </button>

                <button
                  type="button"
                  className="abm-btn abm-btn-deduct"
                  onClick={() => updateBalance("deduct")}
                  disabled={loading}
                >
                  Deduct Amount
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}