import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { secondaryDb } from "../firebaseSecondary";
import { db } from "../firebase";
import "./PendingWithdrawals.css";

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

export default function AdminWithdraw() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({});

  // =========================
  // 🔥 GET RATES
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

    } catch (err) {
      console.log(err);
      return {};
    }
  };

  // =========================
  // 🔥 CONVERT
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
  // 🔥 FETCH
  // =========================
  const fetchWithdrawals = async () => {
    try {
      const q = query(
        collection(secondaryDb, "withdrawals"),
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
  // 🔥 UPDATE STATUS
  // =========================
  const updateStatus = async (id, newStatus) => {

    const confirm = window.confirm(`Badilisha status kuwa "${newStatus}" ?`);
    if (!confirm) return;

    try {
      const ref = doc(secondaryDb, "withdrawals", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const withdrawal = snap.data();

      if (withdrawal.status === "cancelled") return;

      // 💰 REFUND
      if (newStatus === "cancelled") {

        const userQuery = query(
          collection(db, "users"),
          where("username", "==", withdrawal.username)
        );

        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
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

            await updateDoc(userDoc.ref, {
              [field]: current + Number(withdrawal.amount)
            });
          }
        }
      }

      await updateDoc(ref, { status: newStatus });

      // remove
      if (newStatus === "success" || newStatus === "cancelled") {
        setData(prev => prev.filter(item => item.id !== id));
        return;
      }

      setData(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // =========================
  // 🎨 COLORS
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

  if (loading) return <h3>Loading...</h3>;

  // 🔥 ONLY PROCESSING
  const processingList = data.filter(
    item => item.status?.toLowerCase() === "processing"
  );

  return (
    <div className="admin-container">

      <h2>Withdraw Management</h2>

      {processingList.length === 0 ? (

        <p style={{
          textAlign: "center",
          marginTop: 30,
          color: "red",
          fontWeight: "bold"
        }}>
          No withdrawal found
        </p>

      ) : (

        processingList.map(item => {

          const status = item.status?.toLowerCase();

          const tzsValue = convertToTZS(
            Number(item.actualAmount),
            item.currency,
            rates
          );

          const country = countryInfo[item.currency];

          return (
            <div key={item.id} className="card">

              <div className="row top">

                <div>
                  <b>{item.username}</b>
                  <div>{item.realName}</div>
                  <div style={{ fontSize: 12 }}>
                    {country?.flag} {country?.name}
                  </div>
                </div>

                <div>
                  <b>{item.currency} {Number(item.amount).toLocaleString()}</b>

                  <div>
                    Receive: {item.currency} {Number(item.actualAmount).toLocaleString()}
                  </div>

                  <div style={{ color: "green", fontSize: 12 }}>
                    ≈ TZS {Number(tzsValue || 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <b>{item.walletNetwork}</b>
                  <div>{item.walletCode}{item.walletNumber}</div>
                </div>

                <div>
                  <span style={{
                    background: getStatusColor(status),
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "6px"
                  }}>
                    {item.status}
                  </span>
                </div>

              </div>

              {/* 🔥 SELECT */}
              <div style={{ marginTop: 10 }}>
                <select
                  className="select"
                  defaultValue=""
                  onChange={(e) =>
                    updateStatus(item.id, e.target.value)
                  }
                >
                  <option value="" disabled>Change status</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="success">Success</option>
                  <option value="cancelled">Cancel</option>
                </select>
              </div>

            </div>
          );
        })

      )}

    </div>
  );
}