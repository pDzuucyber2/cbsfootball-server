import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import "./BonusMember.css";

const USDT_TO_TZS_RATE = 2500;

// visterdeposte country -> currency
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

// visterdeposte country -> TZS rate
const countryRates = {
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

export default function AdminBonus() {
  const [bonusList, setBonusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchUser, setSearchUser] = useState("");

  const getDepositOrderTypeLabel = (type) => {
    if (type === "first") return "First";
    if (type === "second") return "Second";
    return "Other";
  };

  const getDisplaySource = (tx) => {
    if (tx.collection === "tsh_transactions") return "TZS";
    if (tx.collection === "usdt_transactions") return "USDT";
    if (tx.collection === "visterdeposte") return tx.country || "Visitor";
    return "Unknown";
  };

  const getDisplayAmount = (tx) => {
    const amount = Number(tx.amount || 0);

    if (tx.collection === "usdt_transactions") {
      return `${amount.toLocaleString()} USDT`;
    }

    if (tx.collection === "visterdeposte") {
      const code = countryCurrency[tx.country] || tx.country || "";
      return `${amount.toLocaleString()} ${code}`.trim();
    }

    return `${amount.toLocaleString()} TZS`;
  };

  const getSourceCurrencyCode = (tx) => {
    if (tx.collection === "tsh_transactions") return "TZS";
    if (tx.collection === "usdt_transactions") return "USDT";
    if (tx.collection === "visterdeposte") return countryCurrency[tx.country] || "";
    return "";
  };

  const getBalanceFieldByCurrency = (currency) => {
    const map = {
      TZS: "tshBalance",
      USDT: "usdtBalance",
      USD: "USDBalance",
      KES: "KESBalance",
      UGX: "UGXBalance",
      RWF: "RWFBalance",
      BIF: "BIFBalance",
      ZMW: "ZMWBalance",
      MWK: "MWKBalance",
      MZN: "MZNBalance",
      SSP: "SSPBalance",
      BWP: "BWPBalance",
      MGA: "MGABalance",
    };

    return map[currency] || "tshBalance";
  };

  const convertVisitorToTZS = (amount, country) => {
    const rate = countryRates[country];
    if (!rate) return 0;
    return Math.round(Number(amount || 0) * rate);
  };

  const convertDepositToTZS = (tx) => {
    const amount = Number(tx.amount || 0);

    if (tx.collection === "tsh_transactions") {
      return amount;
    }

    if (tx.collection === "usdt_transactions") {
      return Math.round(amount * USDT_TO_TZS_RATE);
    }

    if (tx.collection === "visterdeposte") {
      return convertVisitorToTZS(amount, tx.country);
    }

    return amount;
  };

  // second deposit: tier by converted TZS, bonus by source amount
  const getSecondDepositBonusConfig = (sourceAmount, tshEquivalent) => {
    const source = Number(sourceAmount || 0);
    const tsh = Number(tshEquivalent || 0);

    if (tsh < 300000) {
      return {
        locked: true,
        percent: 0,
        amount: 0,
        label: "Locked"
      };
    }

    if (tsh >= 300000 && tsh <= 499999) {
      return {
        locked: false,
        percent: 5,
        amount: Math.round(source * 0.05),
        label: "5%"
      };
    }

    if (tsh >= 500000 && tsh <= 999999) {
      return {
        locked: false,
        percent: 6,
        amount: Math.round(source * 0.06),
        label: "6%"
      };
    }

    if (tsh >= 1000000 && tsh <= 2999999) {
      return {
        locked: false,
        percent: 7,
        amount: Math.round(source * 0.07),
        label: "7%"
      };
    }

    if (tsh >= 3000000 && tsh <= 4999999) {
      return {
        locked: false,
        percent: 8,
        amount: Math.round(source * 0.08),
        label: "8%"
      };
    }

    return {
      locked: false,
      percent: 0,
      amount: 500000,
      label: "500,000 Fixed"
    };
  };

  const getSelfBonusData = (type, sourceAmount, tshEquivalent) => {
    const source = Number(sourceAmount || 0);

    if (type === "first") {
      return {
        locked: false,
        percent: 10,
        amount: Math.round(source * 0.1),
        label: "10%"
      };
    }

    if (type === "second") {
      return getSecondDepositBonusConfig(sourceAmount, tshEquivalent);
    }

    return {
      locked: true,
      percent: 0,
      amount: 0,
      label: "No Bonus"
    };
  };

  const getReferralBonusData = (type, sourceAmount) => {
    const source = Number(sourceAmount || 0);

    if (type === "first") {
      return {
        percent: 15,
        amount: Math.round(source * 0.15),
        label: "15%"
      };
    }

    return {
      percent: 0,
      amount: 0,
      label: "No Bonus"
    };
  };

  const getUserByUsername = async (username) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const userDoc = snap.docs[0];
    const data = userDoc.data();

    const allBalances = {
      TZS: Number(data.tshBalance || 0),
      USDT: Number(data.usdtBalance || 0),
      KES: Number(data.KESBalance || 0),
      UGX: Number(data.UGXBalance || 0),
      RWF: Number(data.RWFBalance || 0),
      BIF: Number(data.BIFBalance || 0),
      ZMW: Number(data.ZMWBalance || 0),
      MWK: Number(data.MWKBalance || 0),
      MZN: Number(data.MZNBalance || 0),
      USD: Number(data.USDBalance || 0),
      SSP: Number(data.SSPBalance || 0),
      BWP: Number(data.BWPBalance || 0),
      MGA: Number(data.MGABalance || 0),
    };

    return {
      id: userDoc.id,
      ref: userDoc.ref,
      ...data,
      allBalances
    };
  };

  const addBonusToUserBalance = async (username, currency, amount) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    const balanceField = getBalanceFieldByCurrency(currency);

    if (!snap.empty) {
      const userDoc = snap.docs[0];
      const currentBalance = Number(userDoc.data()[balanceField] || 0);

      await updateDoc(userDoc.ref, {
        [balanceField]: currentBalance + Number(amount)
      });
    } else {
      const userRef = doc(db, "users", username);
      await setDoc(
        userRef,
        { username, [balanceField]: Number(amount) },
        { merge: true }
      );
    }
  };

  const fetchBonuses = async () => {
    setLoading(true);
    try {
      const [tshSnap, usdtSnap, visitorSnap] = await Promise.all([
        getDocs(collection(db, "tsh_transactions")),
        getDocs(collection(db, "usdt_transactions")),
        getDocs(collection(standardDb, "visterdeposte"))
      ]);

      const tshDeposits = tshSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        collection: "tsh_transactions"
      }));

      const usdtDeposits = usdtSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        collection: "usdt_transactions"
      }));

      const visitorDeposits = visitorSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        collection: "visterdeposte"
      }));

      const successDeposits = [...tshDeposits, ...usdtDeposits, ...visitorDeposits]
        .filter((tx) => tx.status === "success")
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

      const userDepositCount = {};
      const prepared = [];

      for (const tx of successDeposits) {
        const username = tx.username || "Unknown";
        userDepositCount[username] = (userDepositCount[username] || 0) + 1;

        let depositOrderType = "other";
        if (userDepositCount[username] === 1) depositOrderType = "first";
        else if (userDepositCount[username] === 2) depositOrderType = "second";

        const finalDepositType = tx.depositOrderType || depositOrderType;
        const tshEquivalent = Number(tx.tshEquivalent || convertDepositToTZS(tx));
        const sourceCurrency = getSourceCurrencyCode(tx);

        const selfBonusData = getSelfBonusData(
          finalDepositType,
          tx.amount,
          tshEquivalent
        );

        const referralBonusData = getReferralBonusData(
          finalDepositType,
          tx.amount
        );

        let referralBy = "None";
        try {
          const user = await getUserByUsername(username);
          referralBy = user?.referralBy || user?.whoReferredWho || "None";
        } catch {
          referralBy = "Unknown";
        }

        prepared.push({
          ...tx,
          depositOrderType: finalDepositType,
          tshEquivalent,
          sourceCurrency,

          selfBonusLocked: tx.selfBonusLocked ?? selfBonusData.locked,
          selfBonusPercent: tx.selfBonusPercent ?? selfBonusData.percent,
          selfBonusAmount: tx.selfBonusAmount ?? selfBonusData.amount,
          selfBonusLabel: tx.selfBonusLabel ?? selfBonusData.label,
          selfBonusGiven: tx.selfBonusGiven || false,

          referralBy,
          referralBonusPercent: tx.referralBonusPercent ?? referralBonusData.percent,
          referralBonusAmount: tx.referralBonusAmount ?? referralBonusData.amount,
          referralBonusLabel: tx.referralBonusLabel ?? referralBonusData.label,
          referralBonusGiven: tx.referralBonusGiven || false,
          referralBonusReceiver: tx.referralBonusReceiver || ""
        });
      }

      prepared.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBonusList(prepared);
    } catch (err) {
      console.error("Failed to fetch bonuses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const approveBonus = async (item) => {
    setUpdatingId(`${item.collection}-${item.id}`);

    try {
      let selfBonusGiven = item.selfBonusGiven || false;
      let referralBonusGiven = item.referralBonusGiven || false;
      let referralBonusReceiver = item.referralBonusReceiver || "";

      if (
        !selfBonusGiven &&
        !item.selfBonusLocked &&
        Number(item.selfBonusAmount || 0) > 0
      ) {
        await addBonusToUserBalance(
          item.username,
          item.sourceCurrency,
          item.selfBonusAmount
        );
        selfBonusGiven = true;
      }

      if (
        !referralBonusGiven &&
        Number(item.referralBonusAmount || 0) > 0 &&
        item.referralBy &&
        item.referralBy !== "None" &&
        item.referralBy !== "Unknown"
      ) {
        await addBonusToUserBalance(
          item.referralBy,
          item.sourceCurrency,
          item.referralBonusAmount
        );
        referralBonusGiven = true;
        referralBonusReceiver = item.referralBy;
      }

      const targetDb = item.collection === "visterdeposte" ? standardDb : db;

      await updateDoc(doc(targetDb, item.collection, item.id), {
        depositOrderType: item.depositOrderType,
        tshEquivalent: item.tshEquivalent,
        sourceCurrency: item.sourceCurrency,

        selfBonusLocked: item.selfBonusLocked,
        selfBonusPercent: item.selfBonusPercent,
        selfBonusAmount: item.selfBonusAmount,
        selfBonusLabel: item.selfBonusLabel,
        selfBonusGiven,

        referralBonusPercent: item.referralBonusPercent,
        referralBonusAmount: item.referralBonusAmount,
        referralBonusLabel: item.referralBonusLabel,
        referralBonusGiven,
        referralBonusReceiver
      });

      setBonusList((prev) =>
        prev.map((tx) =>
          tx.id === item.id && tx.collection === item.collection
            ? {
                ...tx,
                selfBonusGiven,
                referralBonusGiven,
                referralBonusReceiver
              }
            : tx
        )
      );
    } catch (err) {
      console.error("Bonus approval failed:", err);
      alert("Bonus approval failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBonusList = bonusList.filter((item) =>
    (item.username || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  const totalSelfBonus = filteredBonusList.reduce(
    (sum, item) => sum + Number(item.selfBonusAmount || 0),
    0
  );

  const totalReferralBonus = filteredBonusList.reduce(
    (sum, item) => sum + Number(item.referralBonusAmount || 0),
    0
  );

  return (
    <div className="admin-bonus-container">
      <h2>Admin Bonus Dashboard</h2>

      <div className="bonus-summary-box">
        <div className="summary-card">
          <p>Total Records</p>
          <h3>{filteredBonusList.length}</h3>
        </div>

        <div className="summary-card">
          <p>Total User Bonus</p>
          <h3>{totalSelfBonus.toLocaleString()}</h3>
        </div>

        <div className="summary-card">
          <p>Total Referral Bonus</p>
          <h3>{totalReferralBonus.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bonus-search-box">
        <input
          type="text"
          placeholder="Tafuta username..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-text">Inapakia bonuses...</p>
      ) : (
        <div className="bonus-table-wrapper">
          <table className="bonus-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Source</th>
                <th>Referral</th>
                <th>Amount</th>
                <th>TZS Converted</th>
                <th>Deposit Type</th>
                <th>User Bonus Rule</th>
                <th>User Bonus</th>
                <th>User Bonus Status</th>
                <th>Referral Bonus %</th>
                <th>Referral Bonus</th>
                <th>Referral Receiver</th>
                <th>Referral Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBonusList.map((item) => (
                <tr key={`${item.collection}-${item.id}`}>
                  <td>
                    {item.createdAt?.seconds
                      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>

                  <td>{item.username}</td>
                  <td>{getDisplaySource(item)}</td>
                  <td>{item.referralBy || "No referral"}</td>
                  <td>{getDisplayAmount(item)}</td>
                  <td>{Number(item.tshEquivalent || 0).toLocaleString()} TZS</td>

                  <td>
                    <span
                      className={`deposit-type ${
                        item.depositOrderType === "first"
                          ? "deposit-first"
                          : item.depositOrderType === "second"
                          ? "deposit-second"
                          : "deposit-other"
                      }`}
                    >
                      {getDepositOrderTypeLabel(item.depositOrderType)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        item.selfBonusLocked
                          ? "locked-bonus-badge"
                          : "active-bonus-badge"
                      }
                    >
                      {item.selfBonusLabel}
                    </span>
                  </td>

                  <td>
                    {Number(item.selfBonusAmount || 0).toLocaleString()} {item.sourceCurrency}
                  </td>

                  <td>
                    <span
                      className={
                        item.selfBonusGiven
                          ? "bonus-paid"
                          : item.selfBonusLocked
                          ? "bonus-locked"
                          : "bonus-pending"
                      }
                    >
                      {item.selfBonusGiven
                        ? "Paid"
                        : item.selfBonusLocked
                        ? "Locked"
                        : "Pending"}
                    </span>
                  </td>

                  <td>{item.referralBonusPercent}%</td>

                  <td>
                    {Number(item.referralBonusAmount || 0).toLocaleString()} {item.sourceCurrency}
                  </td>

                  <td>{item.referralBonusReceiver || "-"}</td>

                  <td>
                    <span
                      className={
                        item.referralBonusGiven
                          ? "bonus-paid"
                          : item.referralBy &&
                            item.referralBy !== "None" &&
                            item.referralBy !== "Unknown"
                          ? "bonus-pending"
                          : "bonus-locked"
                      }
                    >
                      {item.referralBonusGiven
                        ? "Paid"
                        : item.referralBy &&
                          item.referralBy !== "None" &&
                          item.referralBy !== "Unknown"
                        ? "Pending"
                        : "No referral"}
                    </span>
                  </td>

                  <td>
                    <button
                      disabled={
                        updatingId === `${item.collection}-${item.id}` ||
                        (
                          (item.selfBonusGiven || item.selfBonusLocked) &&
                          (
                            item.referralBy === "None" ||
                            item.referralBy === "Unknown" ||
                            !item.referralBy ||
                            item.referralBonusGiven
                          )
                        )
                      }
                      onClick={() => approveBonus(item)}
                      className={`approve-btn ${item.selfBonusLocked ? "locked-btn" : ""}`}
                    >
                      {item.selfBonusLocked &&
                      (!item.referralBy ||
                        item.referralBy === "None" ||
                        item.referralBy === "Unknown")
                        ? "Locked"
                        : updatingId === `${item.collection}-${item.id}`
                        ? "Paying..."
                        : "Approve Bonus"}
                    </button>
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