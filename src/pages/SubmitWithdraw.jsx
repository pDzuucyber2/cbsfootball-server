import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import { secondaryDb } from "../firebaseSecondary";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SubmitWithdraw.css";

// 🌍 COUNTRY + FLAG
const countryInfo = {
  TZS: { name: "Tanzania", flag: "🇹🇿" },
  KES: { name: "Kenya", flag: "🇰🇪" },
  UGX: { name: "Uganda", flag: "🇺🇬" },
  RWF: { name: "Rwanda", flag: "🇷🇼" },
  BIF: { name: "Burundi", flag: "🇧🇮" },
  ZMW: { name: "Zambia", flag: "🇿🇲" },
  MWK: { name: "Malawi", flag: "🇲🇼" },
  MZN: { name: "Mozambique", flag: "🇲🇿" },
  USD: { name: "Zimbabwe", flag: "🇿🇼" },
  SSP: { name: "South Sudan", flag: "🇸🇸" },
  BWP: { name: "Botswana", flag: "🇧🇼" },
  MGA: { name: "Madagascar", flag: "🇲🇬" },
};

export default function SubmitWithdraw() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [realName, setRealName] = useState("");
  const [showValue, setShowValue] = useState(false);

  if (!state) {
    return (
      <div style={{ padding: 20 }}>
        <h3>No data ❌</h3>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const {
    amount,
    currency,
    wallet,
    fee,
    actualAmount,
    feeAmount,
    sourceCurrency,
    targetCurrency,
    receiveCurrency,
    conversionRate,
    actualAmountUsdt,
    actualAmountBtc
  } = state;

  const finalSourceCurrency = sourceCurrency || currency || "USDT";
  const finalReceiveCurrency =
    receiveCurrency || targetCurrency || currency || "USDT";

  const country = countryInfo[currency];

  const isCryptoWallet = !!wallet?.address;
  const isMobileWallet = !!wallet?.number || !!wallet?.code;

  const isCryptoTransaction =
    isCryptoWallet ||
    finalSourceCurrency === "USDT" ||
    finalSourceCurrency === "BTC" ||
    finalReceiveCurrency === "USDT" ||
    finalReceiveCurrency === "BTC" ||
    currency === "USDT" ||
    currency === "BTC";

  const showCountrySection =
    !isCryptoTransaction && !!country;

  const showRealNameSection = !isCryptoTransaction;

  const maskNumber = (num = "") => {
    if (!num) return "";
    if (num.length <= 4) return num;
    return "*" + num.slice(-4);
  };

  const maskAddress = (addr = "") => {
    if (!addr) return "";
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}******${addr.slice(-6)}`;
  };

  const getWalletTitle = () => {
    if (isCryptoWallet) {
      return `${wallet?.coin || ""}${wallet?.network ? ` (${wallet.network})` : ""}`;
    }

    if (isMobileWallet) {
      return wallet?.network || "Mobile Wallet";
    }

    return "Wallet";
  };

  const getVisibleWalletValue = () => {
    if (isCryptoWallet) {
      return showValue
        ? wallet?.address || "No address"
        : maskAddress(wallet?.address || "");
    }

    if (isMobileWallet) {
      return showValue
        ? `${wallet?.code || ""}${wallet?.number || ""}`
        : `${wallet?.code || ""}${maskNumber(wallet?.number || "")}`;
    }

    return "No wallet data";
  };

  const formatAmountByCurrency = (value, currencyCode) => {
    const num = Number(value || 0);

    if (currencyCode === "BTC") {
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8,
      });
    }

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const fetchRealName = async () => {
      try {
        const username = localStorage.getItem("username");
        const ref = doc(standardDb, "security", username);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setRealName(data.realName || "N/A");
        }
      } catch (err) {
        console.log("Error fetching real name:", err);
      }
    };

    fetchRealName();
  }, []);

  const handleConfirm = async () => {
    if (!code.trim()) {
      alert("Enter withdrawal code");
      return;
    }

    setLoading(true);

    try {
      const username = localStorage.getItem("username");

      const securityRef = doc(standardDb, "security", username);
      const securitySnap = await getDoc(securityRef);

      if (!securitySnap.exists()) {
        alert("Security data not found");
        setLoading(false);
        return;
      }

      const securityData = securitySnap.data();

      if (securityData.withdrawalCode?.trim() !== code.trim()) {
        alert("Wrong withdrawal code ❌");
        setLoading(false);
        return;
      }

      const userQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );

      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        alert("User not found");
        setLoading(false);
        return;
      }

      const userDoc = userSnap.docs[0];
      const userRef = userDoc.ref;

      const fieldMap = {
        TZS: "tshBalance",
        USDT: "usdtBalance",
        BTC: "btcBalance",
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

      const balanceField = fieldMap[finalSourceCurrency];
      const currentBalance = Number(userDoc.data()[balanceField] || 0);

      if (currentBalance < Number(amount)) {
        alert("Insufficient balance ❌");
        setLoading(false);
        return;
      }

      await updateDoc(userRef, {
        [balanceField]: currentBalance - Number(amount)
      });

      await addDoc(collection(secondaryDb, "withdrawals"), {
        username,
        realName: realName || "N/A",

        amount: Number(amount),
        currency: currency || finalSourceCurrency || "",
        sourceCurrency: finalSourceCurrency,
        targetCurrency: targetCurrency || finalReceiveCurrency || "",
        receiveCurrency: finalReceiveCurrency,

        fee,
        feeAmount: Number(feeAmount || 0),
        actualAmount: Number(actualAmount || 0),
        actualAmountUsdt: Number(actualAmountUsdt || 0),
        actualAmountBtc: Number(actualAmountBtc || 0),
        conversionRate: conversionRate || null,

        walletType: isCryptoWallet ? "crypto" : "mobile",
        walletNetwork: wallet?.network || "",
        walletCoin: wallet?.coin || "",
        walletAddress: wallet?.address || "",
        walletNumber: wallet?.number || "",
        walletCode: wallet?.code || "",

        status: "Processing",
        createdAt: serverTimestamp()
      });

      alert("Withdrawal successful ✅");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  return (
    <div className="withdraw-page">
      <h2>Confirm Withdrawal</h2>

      {showCountrySection && (
        <div className="section">
          <p>Country:</p>
          <b>
            {country.flag} {country.name} ({currency})
          </b>
        </div>
      )}

      {showRealNameSection && (
        <div className="section">
          <p>Real Name:</p>
          <b>{realName || "Loading..."}</b>
        </div>
      )}

      <div className="section">
        <p>Amount:</p>
        <b>
          {finalSourceCurrency}{" "}
          {formatAmountByCurrency(amount, finalSourceCurrency)}
        </b>
      </div>

      <div className="section">
        <p>Fee:</p>
        <b>{fee}%</b>
      </div>

      {feeAmount !== undefined && (
        <div className="section">
          <p>Fee Amount:</p>
          <b>
            {finalSourceCurrency}{" "}
            {formatAmountByCurrency(feeAmount, finalSourceCurrency)}
          </b>
        </div>
      )}

      {conversionRate ? (
        <div className="section">
          <p>Conversion Rate:</p>
          <b>1 USDT = {Number(conversionRate).toFixed(8)} BTC</b>
        </div>
      ) : null}

      <div className="section">
        <p>You will receive:</p>
        <b>
          {finalReceiveCurrency}{" "}
          {formatAmountByCurrency(actualAmount, finalReceiveCurrency)}
        </b>
      </div>

      <div className="section">
        <p>Wallet:</p>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <b>
            {getWalletTitle()} - {getVisibleWalletValue()}
          </b>

          <span
            style={{ cursor: "pointer", fontSize: "18px" }}
            onClick={() => setShowValue((prev) => !prev)}
          >
            {showValue ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      <div className="section">
        <p>Withdrawal Code:</p>
        <input
          type="password"
          placeholder="Enter withdrawal code"
          value={code}
          maxLength={8}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <button
        className="submit"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? "Processing..." : "CONFIRM"}
      </button>

      <button
        className="cancel"
        onClick={() => navigate(-1)}
      >
        CANCEL
      </button>
    </div>
  );
}