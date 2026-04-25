import React, { useEffect, useState } from "react";
import "./Accounts.css";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SolarLogo = () => (
  <div className="acc-solar-system">
    <div className="acc-orbit acc-orbit-one">
      <span className="acc-planet-ball">⚽</span>
    </div>

    <div className="acc-orbit acc-orbit-two">
      <span className="acc-planet-ball small">⚽</span>
    </div>

    <div className="acc-sun">
      <img src="/favicon.ico" alt="logo" />
    </div>
  </div>
);

const LoadingScreen = ({ text = "Loading account..." }) => (
  <div className="acc-loader-screen">
    <img src="/images/player.png" className="acc-loader-bg" alt="loading" />
    <div className="acc-loader-overlay"></div>

    <div className="acc-loader-content">
      <SolarLogo />
      <p>{text}</p>
    </div>
  </div>
);

export default function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [totalDepositTsh, setTotalDepositTsh] = useState(0);

  const [pageLoading, setPageLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  const USDT_RATE = 2500;

  const [currencyRates, setCurrencyRates] = useState({
    KES: 0,
    UGX: 0,
    RWF: 0,
    BIF: 0,
    ZMW: 0,
    MWK: 0,
    MZN: 0,
    USD: 0,
    SSP: 0,
    BWP: 0,
    MGA: 0,
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const cachedUser = localStorage.getItem("userData");
    const cachedTotal = localStorage.getItem("totalDepositTsh");

    if (!storedUsername) {
      setPageLoading(false);
      return;
    }

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (error) {
        console.log("Failed to parse cached user:", error);
      }
    }

    if (cachedTotal) {
      try {
        setTotalDepositTsh(Number(JSON.parse(cachedTotal)) || 0);
      } catch (error) {
        console.log("Failed to parse cached total deposit:", error);
      }
    }

    setTimeout(() => {
      setPageLoading(false);
    }, 1200);
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();

        if (data?.rates) {
          const rates = data.rates;
          const usdToTzs = Number(rates.TZS || 0);

          setCurrencyRates({
            KES: usdToTzs / Number(rates.KES || 1),
            UGX: usdToTzs / Number(rates.UGX || 1),
            RWF: usdToTzs / Number(rates.RWF || 1),
            BIF: usdToTzs / Number(rates.BIF || 1),
            ZMW: usdToTzs / Number(rates.ZMW || 1),
            MWK: usdToTzs / Number(rates.MWK || 1),
            MZN: usdToTzs / Number(rates.MZN || 1),
            USD: usdToTzs,
            SSP: usdToTzs / Number(rates.SSP || 1),
            BWP: usdToTzs / Number(rates.BWP || 1),
            MGA: usdToTzs / Number(rates.MGA || 1),
          });
        }
      } catch (error) {
        console.log("Exchange API error:", error);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const hasRates = Object.values(currencyRates).some((rate) => rate > 0);

    if (!storedUsername || !hasRates) return;

    const fetchAllData = async () => {
      setFetchingData(true);

      try {
        const userQuery = query(
          collection(db, "users"),
          where("username", "==", storedUsername)
        );

        const tshQuery = query(
          collection(db, "tsh_transactions"),
          where("username", "==", storedUsername),
          where("type", "==", "deposit"),
          where("status", "==", "success")
        );

        const usdtQuery = query(
          collection(db, "usdt_transactions"),
          where("username", "==", storedUsername),
          where("type", "==", "deposit"),
          where("status", "==", "success")
        );

        const visterQuery = query(
          collection(standardDb, "visterdeposite"),
          where("username", "==", storedUsername),
          where("status", "==", "success")
        );

        const [userSnapshot, tshSnapshot, usdtSnapshot, visterSnapshot] =
          await Promise.all([
            getDocs(userQuery),
            getDocs(tshQuery),
            getDocs(usdtQuery),
            getDocs(visterQuery),
          ]);

        if (!userSnapshot.empty) {
          const freshUser = userSnapshot.docs[0].data();
          setUser(freshUser);
          localStorage.setItem("userData", JSON.stringify(freshUser));
        }

        let tshTotal = 0;
        tshSnapshot.forEach((doc) => {
          tshTotal += Number(doc.data().amount || 0);
        });

        let usdtTotal = 0;
        usdtSnapshot.forEach((doc) => {
          usdtTotal += Number(doc.data().amount || 0);
        });

        const usdtToTsh = usdtTotal * USDT_RATE;

        let visterTotalTsh = 0;
        visterSnapshot.forEach((doc) => {
          const data = doc.data();

          const allBalances = {
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

          Object.entries(allBalances).forEach(([currency, amount]) => {
            const rate = Number(currencyRates[currency] || 0);
            visterTotalTsh += Number(amount || 0) * rate;
          });
        });

        const grandTotal = tshTotal + usdtToTsh + visterTotalTsh;

        setTotalDepositTsh(grandTotal);
        localStorage.setItem("totalDepositTsh", JSON.stringify(grandTotal));
      } catch (err) {
        console.log("Error fetching account data:", err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchAllData();
  }, [currencyRates]);

  const getVIP = () => {
    const total = Number(totalDepositTsh || 0);

    if (total < 10000) return "VIP 0";
    if (total <= 199999) return "VIP 1";
    if (total <= 1000000) return "VIP 2";
    if (total <= 2500000) return "VIP 3";
    if (total <= 5000000) return "VIP 4";

    return `VIP ${5 + Math.floor((total - 5000001) / 3000000)}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (pageLoading) {
    return <LoadingScreen text="Loading account..." />;
  }

  if (!user) {
    return <LoadingScreen text="User loading..." />;
  }

  return (
    <div className="account-container">
      {fetchingData && (
        <div className="acc-mini-loading">
          <SolarLogo />
          <span>Updating account data...</span>
        </div>
      )}

      <div className="account-header">
        <h2>My Account</h2>
      </div>

      <div className="content">
        <div className="profile-card">
          <h3>{user.username}</h3>
          <p>{user.fullName}</p>
          <p>{user.email}</p>
          <p>{user.phoneNumber}</p>
          <span className="vip">{getVIP()}</span>
        </div>

        <div className="actions">
          <button className="main-btn" onClick={() => navigate("/total-balance")}>
            View Total Balance
          </button>

          <button
            className="main-btn"
            onClick={() => navigate("/successful-deposits")}
          >
            View Successful Deposits
          </button>
        </div>

        <div className="actions">
          <button className="main-btn" onClick={() => navigate("/deposit")}>
            Deposit
          </button>

          <button className="main-btn" onClick={() => navigate("/withdraw")}>
            Withdraw
          </button>
        </div>

        <div className="security-title">Security Settings</div>

        <div className="security-section">
          <button className="security-card" onClick={() => navigate("/settings")}>
            🔊 Security Settings Info
          </button>

          <button
            className="security-card"
            onClick={() => navigate("/change-login-password")}
          >
            🔐 Change Login Password
          </button>

          <button
            className="security-card"
            onClick={() => navigate("/change-withdraw-password")}
          >
            💸 Change Withdraw Code
          </button>
        </div>

        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}