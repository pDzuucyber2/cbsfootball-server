import { useEffect, useState } from "react";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./WithdrawByUsdt.css";

export default function WithdrawByUsdt() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username");

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [btcRate, setBtcRate] = useState(0);
  const [rateLoading, setRateLoading] = useState(false);

  const fee = 5;
  const minimumWithdraw = 5;
  const maximumWithdraw = 100000;

  const maskAddress = (addr) => {
    if (!addr) return "";
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}******${addr.slice(-6)}`;
  };

  const selectedWalletData =
    selectedWallet >= 0 && wallets[selectedWallet]
      ? wallets[selectedWallet]
      : null;

  const isBTCWallet = selectedWalletData?.coin?.toUpperCase().includes("BTC");

  /* FETCH USDT BALANCE */
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userId) return;

      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", userId)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const data = snap.docs[0].data();
          setBalance(Number(data.usdtBalance || 0));
        }
      } catch (err) {
        console.log("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, [userId]);

  /* FETCH BTC RATE */
  useEffect(() => {
    const fetchBtcRate = async () => {
      try {
        setRateLoading(true);

        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();

        const btcUsd = Number(data?.bitcoin?.usd || 0);

        if (btcUsd > 0) {
          setBtcRate(1 / btcUsd);
        }
      } catch (err) {
        console.log("Error fetching BTC rate:", err);
      } finally {
        setRateLoading(false);
      }
    };

    fetchBtcRate();
  }, []);

  /* FETCH CRYPTO WALLETS + REDIRECT IF NONE */
  useEffect(() => {
    const fetchWallets = async () => {
      if (!userId) {
        navigate("/usdt-management");
        return;
      }

      try {
        const ref = doc(standardDb, "security", userId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Add crypto wallet first ⚠️");
          navigate("/usdt-management");
          return;
        }

        const data = snap.data();
        const savedWallets = data.cryptoWallets || [];

        if (savedWallets.length === 0) {
          alert("Add crypto wallet first ⚠️");
          navigate("/usdt-management");
          return;
        }

        setWallets(savedWallets);
      } catch (err) {
        console.log("Error fetching wallets:", err);
        alert("Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [userId, navigate]);

  /* CALCULATION */
  const amountNumber = Number(amount || 0);
  const feeAmount = (amountNumber * fee) / 100;
  const actualAmountUsdt = amountNumber > 0 ? amountNumber - feeAmount : 0;
  const actualAmountBtc =
    actualAmountUsdt > 0 && btcRate > 0 ? actualAmountUsdt * btcRate : 0;

  const displayReceiveAmount = isBTCWallet
    ? actualAmountBtc.toFixed(8)
    : actualAmountUsdt.toFixed(2);

  const displayReceiveCurrency = isBTCWallet ? "BTC" : "USDT";

  const conversionText =
    isBTCWallet && btcRate > 0 ? `1 USDT = ${btcRate.toFixed(8)} BTC `: "";

  return (
    <div className="withdraw-page">
      <div className="header">
        <h2>Withdraw Crypto</h2>
      </div>

      {/* BALANCE */}
      <div className="section">
        <div className="row">
          <span>USDT Balance</span>
          <b>{balance.toLocaleString()} USDT</b>
        </div>
      </div>

      {/* WALLET */}
      <div className="section">
        <div className="row">
          <span>Select Wallet</span>

          {wallets.length > 0 ? (
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(Number(e.target.value))}
            >
              <option value={-1}>Select</option>
              {wallets.map((w, i) => (
                <option key={i} value={i}>
                  {w.coin} ({w.network})
                </option>
              ))}
            </select>
          ) : (
            <b style={{ color: "red" }}>No crypto wallet</b>
          )}
        </div>

        {selectedWalletData && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "10px",
              background: "#f5f5f5",
              fontSize: "13px"
            }}
          >
            <div>
              <b>Coin:</b> {selectedWalletData.coin}
            </div>
            <div>
              <b>Network:</b> {selectedWalletData.network}
            </div>
            <div>
              <b>Address:</b> {maskAddress(selectedWalletData.address)}
            </div>
          </div>
        )}
      </div>

      {/* AMOUNT */}
      <div className="section">
        <p className="placeholder">Enter Amount in USDT</p>

        <input
          type="number"
          min={minimumWithdraw}
          max={maximumWithdraw}
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            const num = Number(val);

            if (num > balance) {
              setAmount(String(balance));
            } else if (num > maximumWithdraw) {
              setAmount(String(maximumWithdraw));
            } else {
              setAmount(val);
            }
          }}
          placeholder={`Min ${minimumWithdraw} / Max ${maximumWithdraw} USDT`}
        />

        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "#272525"
          }}
        >
          Minimum withdrawal is {minimumWithdraw} USDT and maximum is {maximumWithdraw} USDT
        </p>
      </div>

      {/* RATE INFO */}
      {isBTCWallet && (
        <div className="section">
          <div className="row">
            <span>Conversion Rate</span>
            <b>{rateLoading ? "Loading..." : conversionText || "-"}</b>
          </div>
        </div>
      )}

      {/* FEES */}
      <div className="section">
        <div className="row">
          <span>Fee</span>
          <b>{fee}%</b>
        </div>

        <div className="row">
          <span>Fee Amount</span>
          <b>{feeAmount.toFixed(2)} USDT</b>
        </div>

        <div className="row">
          <span>You Receive</span>
          <b>
            {displayReceiveAmount} {displayReceiveCurrency}
          </b>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        className="submit"
        onClick={() => {
          if (loading) {
            alert("Loading...");
            return;
          }

          if (balance <= 0) {
            alert("No USDT balance");
            return;
          }

          if (!amount || Number(amount) <= 0) {
            alert("Enter amount");
            return;
          }

          if (Number(amount) < minimumWithdraw) {
            alert(`Minimum withdrawal is ${minimumWithdraw} USDT`);
            return;
          }

          if (Number(amount) > maximumWithdraw) {
            alert(`Maximum withdrawal is ${maximumWithdraw} USDT`);
            return;
          }

          if (Number(amount) > balance) {
            alert("Insufficient balance");
            return;
          }

          if (wallets.length === 0) {
            alert("Add crypto wallet first ⚠️");
            navigate("/usdt-management");
            return;
          }

          if (selectedWallet === -1 || !wallets[selectedWallet]) {
            alert("Select wallet");
            return;
          }

          if (isBTCWallet && btcRate <= 0) {
            alert("BTC rate unavailable, try again");
            return;
          }

          navigate("/submitWithdraw", {
            state: {
              amount: Number(amount),
              wallet: wallets[selectedWallet],
              fee,
              feeAmount,
              actualAmountUsdt: Number(actualAmountUsdt.toFixed(2)),
              actualAmountBtc: Number(actualAmountBtc.toFixed(8)),
              actualAmount: displayReceiveAmount,
              receiveCurrency: displayReceiveCurrency,
              conversionRate: isBTCWallet ? btcRate : null,
              sourceCurrency: "USDT",
              targetCurrency: isBTCWallet ? "BTC" : "USDT"
            }
          });
        }}
      >
        WITHDRAW
      </button>
    </div>
  );
}