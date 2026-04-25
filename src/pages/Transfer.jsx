import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  runTransaction,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import "./Transfer.css";
import { useBalance } from "../context/BalanceContext";

import {
  ensureHourlyRateSnapshot,
  getPreviousHourRateSnapshot,
  convertCurrency,
} from "../utils/exchangeRateManager";

export default function Transfer() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("TZS");
  const [toCurrency, setToCurrency] = useState("USDT");
  const [loading, setLoading] = useState(false);

  const [rateInfo, setRateInfo] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [rateError, setRateError] = useState("");

  const senderUsername = localStorage.getItem("username");
  const { balances, setBalances } = useBalance();

  const CONVERSION_FEE_PERCENT = 15;

  const getBalanceField = (currencyCode) => {
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

    return map[currencyCode] || "tshBalance";
  };

  const buildBalancesFromUser = (userData) => ({
    TZS: Number(userData?.tshBalance || 0),
    USDT: Number(userData?.usdtBalance || 0),
    USD: Number(userData?.USDBalance || 0),
    KES: Number(userData?.KESBalance || 0),
    UGX: Number(userData?.UGXBalance || 0),
    RWF: Number(userData?.RWFBalance || 0),
    BIF: Number(userData?.BIFBalance || 0),
    ZMW: Number(userData?.ZMWBalance || 0),
    MWK: Number(userData?.MWKBalance || 0),
    MZN: Number(userData?.MZNBalance || 0),
    SSP: Number(userData?.SSPBalance || 0),
    BWP: Number(userData?.BWPBalance || 0),
    MGA: Number(userData?.MGABalance || 0),
  });

  useEffect(() => {
    const prepareRates = async () => {
      try {
        setRateLoading(true);
        setRateError("");

        await ensureHourlyRateSnapshot();
        const prevHourSnapshot = await getPreviousHourRateSnapshot();
        setRateInfo(prevHourSnapshot);
      } catch (err) {
        console.error(err);
        setRateError("Imeshindikana kupata rate ya saa iliyopita");
      } finally {
        setRateLoading(false);
      }
    };

    prepareRates();
  }, []);

  useEffect(() => {
    const loadUserBalances = async () => {
      if (!senderUsername) return;

      try {
        const userQ = query(
          collection(db, "users"),
          where("username", "==", senderUsername)
        );

        const userSnap = await getDocs(userQ);

        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          setBalances(buildBalancesFromUser(userData));
        }
      } catch (err) {
        console.error("Failed to load balances:", err);
      }
    };

    loadUserBalances();
  }, [senderUsername, setBalances]);

  const handleTransfer = async () => {
    if (!amount) {
      alert("Enter Amount");
      return;
    }

    if (!senderUsername) {
      alert("Username haipo kwenye localStorage");
      return;
    }

    if (fromCurrency === toCurrency) {
      alert("Select Different Currency");
      return;
    }

    const transferAmount = Number(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      alert("Enter Correct Amount");
      return;
    }

    if (rateLoading) {
      alert("Rate bado zinapakiwa");
      return;
    }

    if (rateError || !rateInfo?.rates) {
      alert("Rate ya saa iliyopita haijapatikana");
      return;
    }

    setLoading(true);

    try {
      const userQ = query(
        collection(db, "users"),
        where("username", "==", senderUsername)
      );

      const userSnap = await getDocs(userQ);

      if (userSnap.empty) {
        alert("User not found");
        return;
      }

      const userDocSnap = userSnap.docs[0];
      const userRef = doc(db, "users", userDocSnap.id);

      const fromField = getBalanceField(fromCurrency);
      const toField = getBalanceField(toCurrency);

      let oldFromBalance = 0;
      let oldToBalance = 0;
      let newFromBalance = 0;
      let newToBalance = 0;

      const grossConvertedAmount = convertCurrency(
        transferAmount,
        fromCurrency,
        toCurrency,
        rateInfo.rates
      );

      const feeAmount = (grossConvertedAmount * CONVERSION_FEE_PERCENT) / 100;
      const netConvertedAmount = grossConvertedAmount - feeAmount;

      await runTransaction(db, async (transaction) => {
        const userFresh = await transaction.get(userRef);

        if (!userFresh.exists()) {
          throw new Error("User not found");
        }

        const userData = userFresh.data();

        oldFromBalance = Number(userData[fromField] || 0);
        oldToBalance = Number(userData[toField] || 0);

        if (oldFromBalance < transferAmount) {
          throw new Error("Not Balance Available");
        }

        newFromBalance = Number((oldFromBalance - transferAmount).toFixed(6));
        newToBalance = Number((oldToBalance + netConvertedAmount).toFixed(6));

        transaction.update(userRef, {
          [fromField]: newFromBalance,
          [toField]: newToBalance,
        });
      });

      await addDoc(collection(db, "transfers"), {
        username: senderUsername,
        type: "self_currency_conversion",
        fromCurrency,
        toCurrency,
        fromAmount: Number(transferAmount.toFixed(6)),
        grossToAmount: Number(grossConvertedAmount.toFixed(6)),
        feePercent: CONVERSION_FEE_PERCENT,
        feeAmount: Number(feeAmount.toFixed(6)),
        toAmount: Number(netConvertedAmount.toFixed(6)),
        rateType: "previous_hour_snapshot",
        rateSource: rateInfo.provider || "ExchangeRate-API",
        rateSnapshotId: rateInfo.id || null,
        rateSnapshotCreatedAtMs: rateInfo.createdAtMs || null,
        fromRate:
          fromCurrency === "USD" || fromCurrency === "USDT"
            ? 1
            : Number(rateInfo.rates?.[fromCurrency] || 0),
        toRate:
          toCurrency === "USD" || toCurrency === "USDT"
            ? 1
            : Number(rateInfo.rates?.[toCurrency] || 0),
        balanceBeforeFrom: oldFromBalance,
        balanceAfterFrom: newFromBalance,
        balanceBeforeTo: oldToBalance,
        balanceAfterTo: newToBalance,
        status: "success",
        createdAt: serverTimestamp(),
      });

      // update context balance papo hapo
      setBalances((prev) => ({
        ...prev,
        [fromCurrency]: newFromBalance,
        [toCurrency]: newToBalance,
      }));

      alert(
        `Conversion successful 🎉\n\nReceived ${netConvertedAmount.toFixed(
          6
        )} ${toCurrency}\nFee Charge: ${feeAmount.toFixed(6)} ${toCurrency}`
      );

      setAmount("");
    } catch (err) {
      console.error("Conversion failed:", err);
      alert(err.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const grossPreview =
    amount && rateInfo?.rates
      ? convertCurrency(Number(amount || 0), fromCurrency, toCurrency, rateInfo.rates)
      : 0;

  const feePreview = (grossPreview * CONVERSION_FEE_PERCENT) / 100;
  const netPreview = grossPreview - feePreview;

  return (
    <div className="transfer-page">
      <h2>🔁 Convert Balance</h2>

      <div className="transfer-box">
        <input
          type="number"
          placeholder="The amount you want to change"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          <option value="TZS">TZS</option>
          <option value="USDT">USDT</option>
          <option value="USD">USD</option>
          <option value="KES">KES</option>
          <option value="UGX">UGX</option>
          <option value="RWF">RWF</option>
          <option value="BIF">BIF</option>
          <option value="ZMW">ZMW</option>
          <option value="MWK">MWK</option>
          <option value="MZN">MZN</option>
          <option value="SSP">SSP</option>
          <option value="BWP">BWP</option>
          <option value="MGA">MGA</option>
        </select>

        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
        >
          <option value="TZS">TZS</option>
          <option value="USDT">USDT</option>
          <option value="USD">USD</option>
          <option value="KES">KES</option>
          <option value="UGX">UGX</option>
          <option value="RWF">RWF</option>
          <option value="BIF">BIF</option>
          <option value="ZMW">ZMW</option>
          <option value="MWK">MWK</option>
          <option value="MZN">MZN</option>
          <option value="SSP">SSP</option>
          <option value="BWP">BWP</option>
          <option value="MGA">MGA</option>
        </select>

        {!loading && (
          <div style={{ fontSize: "13px", color: "#555", marginBottom: "10px" }}>
            <p>Available {fromCurrency}: {Number(balances[fromCurrency] || 0).toFixed(6)}</p>
            <p>Available {toCurrency}: {Number(balances[toCurrency] || 0).toFixed(6)}</p>
          </div>
        )}

        {rateLoading ? (
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>
            Looking for the rate of the previous hour...
          </p>
        ) : rateError ? (
          <p style={{ fontSize: "13px", color: "red", marginBottom: "10px" }}>
            {rateError}
          </p>
        ) : (
          <div style={{ fontSize: "13px", color: "#555", marginBottom: "10px" }}>
            <p>
              Rate time:{" "}
              {rateInfo?.createdAtMs
                ? new Date(rateInfo.createdAtMs).toLocaleString()
                : "Unknown"}
            </p>
            <p>
              Gross: {amount || 0} {fromCurrency} ={" "}
              {grossPreview ? grossPreview.toFixed(6) : "0.000000"} {toCurrency}
            </p>
            <p>
              Fee ({CONVERSION_FEE_PERCENT}%):{" "}
              {feePreview ? feePreview.toFixed(6) : "0.000000"} {toCurrency}
            </p>
            <p style={{ fontWeight: "700", color: "#16a34a" }}>
              You will receive: {netPreview ? netPreview.toFixed(6) : "0.000000"}{" "}
              {toCurrency}
            </p>
          </div>
        )}

        <button onClick={handleTransfer} disabled={loading || rateLoading}>
          {loading ? "Processing..." : "Convert Now"}
        </button>
      </div>
    </div>
  );
}