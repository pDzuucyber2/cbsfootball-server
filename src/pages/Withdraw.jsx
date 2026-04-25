import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import "./Withdraw.css";
import { doc, getDoc } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";



import { useNavigate } from "react-router-dom";

// 🔥 MIN CONFIG
const countryMinAmounts = {
  Kenya: 927.64,
  Uganda: 25974.02,
  Rwanda: 10526.36,
  Burundi: 21276.6,
  "DRC - Congo": 7.24,
  Zambia: 135.84,
  Malawi: 14468.8,
  Mozambique: 457.56,
  Zimbabwe: 7.24,
  "South Sudan": 42553.2,
  Botswana: 94.36,
  Madagascar: 29198,
};

// 🔥 MAP
const currencyMap = {
  TZS: "Tanzania",
  KES: "Kenya",
  UGX: "Uganda",
  RWF: "Rwanda",
  BIF: "Burundi",
  ZMW: "Zambia",
  MWK: "Malawi",
  MZN: "Mozambique",
  USD: "Zimbabwe",
  SSP: "South Sudan",
  BWP: "Botswana",
  MGA: "Madagascar",
};

// 🔥 ROUND TO 00
const roundToHundreds = (num) => {
  if (num < 100) return Math.floor(num);
  return Math.floor(num / 100) * 100;
};

export default function Withdraw() {

const navigate = useNavigate();


  const userId = localStorage.getItem("username");



  const [userWallets, setUserWallets] = useState([]);
const [selectedWallet, setSelectedWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [fee] = useState(5);
  const [selectedQuick, setSelectedQuick] = useState("");

const [walletLoading, setWalletLoading] = useState(true);







const [totalBets, setTotalBets] = useState(0);
const requiredBets = 3;

  const [balances, setBalances] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState("");

  // 🔥 BALANCE
  const balance = balances[selectedCurrency] || 0;
  const hasMultiple = Object.keys(balances).length > 1;




// wallets filter
const selectedCountry = currencyMap[selectedCurrency] || "";

const filteredWallets = userWallets.filter((w) => {
  const walletCountry = (w.country || "").toLowerCase().trim();
  const currentCountry = selectedCountry.toLowerCase().trim();

  // TZS → ruhusu hata kama country haijawekwa
  if (selectedCurrency === "TZS") {
    return !walletCountry || walletCountry === "tanzania";
  }

  return walletCountry === currentCountry;
});



const hasWallet = filteredWallets.length > 0;


useEffect(() => {

  if (walletLoading) return;
  if (!selectedCurrency) return;
  if (balance <= 0) return;

  if (!hasWallet) {
    navigate(
      selectedCurrency === "TZS"
        ? "/add-card"
        : "/other-country-wallet"
    );
  }

}, [selectedCurrency, walletLoading, balance, hasWallet, navigate]);









const percent = Math.min(
  (totalBets / requiredBets) * 100,
  100
);




const maskNumber = (num = "") => {
  if (num.length <= 4) return num;

  const last4 = num.slice(-4);
  return "**" + last4;
};







  // 🔥 MIN
  const minAmount =
    selectedCurrency === "TZS"
      ? 10000
      : countryMinAmounts[currencyMap[selectedCurrency]] || 10000;

  // 🔥 MAX
  const maxAmount =
    selectedCurrency === "TZS"
      ? 5000000
      : Math.floor((5000000 / 10000) * minAmount);

  // 🔥 QUICK BUTTONS (SMART + ROUND 00)
  const quickAmounts = useMemo(() => {
    if (!balance) return [];

    const list = [];

    list.push(roundToHundreds(minAmount));

    const step1 = roundToHundreds((minAmount + balance) / 4);
    const step2 = roundToHundreds((minAmount + balance) / 2);
    const step3 = roundToHundreds((balance + maxAmount) / 2);

    if (step1 > minAmount && step1 < balance) list.push(step1);
    if (step2 > minAmount && step2 < balance) list.push(step2);
    if (step3 > balance && step3 < maxAmount) list.push(step3);

    if (balance > minAmount && balance < maxAmount) {
      list.push(roundToHundreds(balance));
    }

    list.push(roundToHundreds(maxAmount));

    return [...new Set(list)].sort((a, b) => a - b);
  }, [balance, minAmount, maxAmount]);

  // 🔥 FETCH BALANCE
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userId) return;

      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", userId)
        );

        const snap = await getDocs(q);
        if (snap.empty) return;

        const data = snap.docs[0].data();

        const allBalances = {
          TZS: Number(data.tshBalance || 0),
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

        const filtered = Object.fromEntries(
          Object.entries(allBalances).filter(([_, val]) => val > 0)
        );

        setBalances(filtered);

        const keys = Object.keys(filtered);
        if (keys.length > 0) {
          setSelectedCurrency(keys[0]);
        }

      } catch (err) {
        console.log(err);
      }
    };

    fetchBalance();
  }, [userId]);


useEffect(() => {
  const fetchBets = async () => {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const q1 = query(
        collection(standardDb, "antscore"),
        where("username", "==", username)
      );

      const q2 = query(
        collection(standardDb, "correctscore"),
        where("username", "==", username)
      );

      const [snap1, snap2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const total = snap1.size + snap2.size;

      setTotalBets(total);

    } catch (err) {
      console.log(err);
    }
  };

  fetchBets();
}, []);







useEffect(() => {
  const checkSecurity = async () => {
    if (!userId) return;

    try {
      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        navigate("/settings");
        return;
      }

      const data = snap.data();

      // 🔒 RULES
      if (
        !data.realName ||
        !data.securityQuestion ||
        !data.withdrawalCode
      ) {
        alert("Complete your security setup first ⚠️");
        navigate("/settings");
      }

    } catch (err) {
      console.log(err);
    }
  };

  checkSecurity();
}, [userId, navigate]);






useEffect(() => {
  const fetchWallets = async () => {
    if (!userId) return;

    try {
      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserWallets(data.wallets || []);
      }

      setWalletLoading(false); // muhimu
    } catch (err) {
      console.log(err);
      setWalletLoading(false);
    }
  };

  fetchWallets();
}, [userId]);




  // 🔥 CALCULATION
  const actualAmount = amount
    ? (Number(amount) - (Number(amount) * fee) / 100).toFixed(2)
    : 0;

 
  return (
    <div className="withdraw-page">

      <div className="header">
        <h2>Deposit and withdrawal</h2>

        <div className="tabs">
          <span>Deposit</span>
          <span className="active">Withdrawal</span>
        </div>
      </div>

    <div className="top-buttons">
  <button className="active-btn">LOCAL PAYMENT</button>

  <button
    onClick={() => navigate("/withdrawbyusdt")}
  >
    WITHDRAWAL USDT
  </button>
</div>

      <div className="section">


<div className="section">
  <div className="row">
    <span>Valid Trade Volume</span>
    <b className="green">
      {Math.min(totalBets, requiredBets)} / {requiredBets}
    </b>
  </div>

  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${percent}%` }}
    ></div>
  </div>
</div>


  
      </div>

      <div className="section">
        <div className="row">
          <span>Payment Channel</span>

        

{hasWallet ? (
  <select
    value={selectedWallet}
    onChange={(e) => setSelectedWallet(e.target.value)}
  >
    <option value="">Select Wallet</option>

    {filteredWallets.map((w, i) => (
      <option key={i} value={i}>
        {w.network} ({w.code}{maskNumber(w.number)})
      </option>
    ))}
  </select>
) : (
  <>
    <b style={{ color: "red" }}>
      No wallet found for {selectedCountry}
    </b>

    <button
      style={{ marginTop: 10 }}
      onClick={() =>
        navigate(
          selectedCurrency === "TZS"
            ? "/add-card"
            : "/other-country-wallet"
        )
      }
    >
      Add Wallet
    </button>
  </>
)}







        </div>
      </div>

      {/* 🔥 BALANCE */}
      <div className="section">
        <div className="row">
          <span>Balance</span>

          {hasMultiple ? (
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {Object.keys(balances).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} - {balances[cur].toLocaleString()}
                </option>
              ))}
            </select>
          ) : (
            <b>
              {balance > 0
                ? `${selectedCurrency} ${balance.toLocaleString()}`
                : "0.00"}
            </b>
          )}
        </div>
      </div>

      {/* AMOUNT */}
      <div className="section">
        <p className="placeholder">Please Enter The Amount</p>

        <input
          type="number"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;

            if (Number(val) > balance) {
              setAmount(balance);
            } else {
              setAmount(val);
            }

            setSelectedQuick("");
          }}
          placeholder="Enter amount"
        />

        <div className="quick">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              disabled={amt > balance}
              className={`${selectedQuick === amt ? "selected" : ""} ${amt > balance ? "disabled" : ""}`}
              onClick={() => {
                setAmount(amt);
                setSelectedQuick(amt);
              }}
            >
              {amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* FEES */}
      <div className="section">
        <div className="row">
          <span>Withdrawal fee (%)</span>
          <b>{fee}%</b>
        </div>

        <div className="row">
          <span>Actual transaction amount</span>
          <b>{actualAmount}</b>
        </div>

        <div className="row red">
          <span>Amount Range</span>
          <b>
            {minAmount.toLocaleString()} - {maxAmount.toLocaleString()}
          </b>
        </div>
      </div>

      <div className="note">
        Withdrawal Fee = Amount charged as Handling Fee <br />
        * Note: The Actual Transaction Amount may still be subject to bank charges.
      </div>

      {/* SUBMIT */}
      <button
        className="submit"
  
onClick={async () => {

  const ref = doc(standardDb, "security", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    navigate("/settings");
    return;
  }

  const data = snap.data();

  if (
    !data.realName ||
    !data.securityQuestion ||
    !data.withdrawalCode
  ) {
    alert("Complete your security setup first ⚠️");
    navigate("/settings");
    return;
  }


  if (walletLoading) {
    alert("Loading wallets...");
    return;
  }

  const numAmount = Number(amount);

  if (!numAmount || numAmount < minAmount) {
    alert(`Minimum amount is ${minAmount}`);
    return;
  }

  if (numAmount > maxAmount) {
    alert(`Maximum amount is ${maxAmount}`);
    return;
  }

  if (numAmount > balance) {
    alert("Insufficient balance");
    return;
  }

  if (!hasWallet) {
    navigate(
      selectedCurrency === "TZS"
        ? "/add-card"
        : "/other-country-wallet"
    );
    return;
  }

  if (selectedWallet === "") {
    alert("Select wallet");
    return;
  }

  // ✅ HAPA NDIYO MUHIMU
  navigate("/submitWithdraw", {
    state: {
      amount: numAmount,
      currency: selectedCurrency,
      wallet: filteredWallets[selectedWallet],
      fee,
      actualAmount
    }
  });

}}


      >
        SUBMIT
      </button>
  {/* MODAL */}
   

    </div>
  );
}