import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { secondaryDb } from "../firebaseSecondary";
import "./WithdrawRecords.css";

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
  USD: { name: "USA", flag: "🇺🇸" },
  SSP: { name: "South Sudan", flag: "🇸🇸" },
  BWP: { name: "Botswana", flag: "🇧🇼" },
  MGA: { name: "Madagascar", flag: "🇲🇬" },
};

export default function UserWithdrawHistory() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({});

  const username = localStorage.getItem("username");

  // =========================
  // 🔥 GET EXCHANGE RATES (CACHE 10 MIN)
  // =========================
  const getRates = async () => {
    const cache = localStorage.getItem("exchangeRates");

    if (cache) {
      const parsed = JSON.parse(cache);
      const diff = Date.now() - parsed.timestamp;

      if (diff < 600000) return parsed.rates;
    }

    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();

      localStorage.setItem("exchangeRates", JSON.stringify({
        rates: data.rates,
        timestamp: Date.now()
      }));

      return data.rates;

    } catch {
      return {};
    }
  };

  // =========================
  // 🔥 CONVERT → TZS
  // =========================
  const convertToTZS = (amount, currency, rates) => {
    if (!amount) return 0;
    if (currency === "TZS") return amount;

    const rate = rates[currency];
    const tzsRate = rates.TZS;

    if (!rate || !tzsRate) return 0;

    return ((amount / rate) * tzsRate);
  };

  // =========================
  // 🔥 FETCH USER DATA
  // =========================
  const fetchWithdrawals = async () => {
    try {
      const q = query(
        collection(secondaryDb, "withdrawals"),
        where("username", "==", username),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(list);
      setLoading(false);

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();

    const loadRates = async () => {
      const r = await getRates();
      setRates(r);
    };

    loadRates();
  }, []);

  // =========================
  // 🎨 STATUS COLORS
  // =========================
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing": return "#ffc107";
      case "reviewing": return "#343a40";
      case "reviewed": return "#007bff";
      case "success": return "#28a745";
      case "cancelled":
      case "error": return "#dc3545";
      default: return "#999";
    }
  };

  if (loading) return <h3 style={{ padding: 20 }}>Loading...</h3>;

  return (
    <div className="user-container">

      <h2>My Withdraw History</h2>

      {data.length === 0 ? (
        <p className="empty">No withdrawals yet</p>
      ) : (

        data.map(item => {

          const tzsValue = convertToTZS(
            Number(item.actualAmount),
            item.currency,
            rates
          );

          const country = countryInfo[item.currency];

          return (
            <div key={item.id} className="card">

              <div className="row">

                {/* 🌍 COUNTRY */}
                <div>
                  <b>{country?.flag} {country?.name}</b>
                </div>

                {/* 💰 AMOUNT */}
                <div>
                  <b>
                    {item.currency} {Number(item.amount).toLocaleString()}
                  </b>

                  <div className="sub">
                    Receive: {item.currency} {Number(item.actualAmount).toLocaleString()}
                  </div>

                  <div className="tzs">
                    ≈ TZS {Number(tzsValue || 0).toLocaleString()}
                  </div>
                </div>

                {/* 📱 WALLET */}
                <div>
                  <b>{item.walletNetwork}</b>
                  <div className="sub">
                    {item.walletCode}{item.walletNumber}
                  </div>
                </div>

                {/* 📊 STATUS */}
                <div>
                  <span
                    className="badge"
                    style={{
                      background: getStatusColor(item.status)
                    }}
                  >
                    {item.status}
                  </span>
                </div>

              </div>

              {/* 🕒 DATE */}
              <div className="date">
                {item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : ""}
              </div>

            </div>
          );
        })

      )}

    </div>
  );
}