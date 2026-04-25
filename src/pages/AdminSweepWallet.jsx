import React, { useState } from "react";
import "./AdminSweepWallet.css";

export default function AdminSweepWallet() {
  const [walletIndex, setWalletIndex] = useState("");
  const [coin, setCoin] = useState("TRX");
  const [amount, setAmount] = useState("");
  const [balanceInfo, setBalanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const SERVER_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://cbsfootball.onrender.com";

  const format = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });

  const checkBalance = async () => {
    if (!walletIndex) return alert("Weka wallet index");

    try {
      setLoading(true);

      const res = await fetch(`${SERVER_URL}/admin/wallet-balances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          index: Number(walletIndex),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        return;
      }

      setBalanceInfo(data);
    } catch (err) {
      alert("Server haipo au network error");
    } finally {
      setLoading(false);
    }
  };

  const getBalance = () => {
    if (!balanceInfo) return 0;

    if (coin === "TRX") return balanceInfo.balances.TRX;
    if (coin === "USDT_TRC20") return balanceInfo.balances.USDT_TRC20;

    return 0;
  };

  const sweep = async () => {
    if (!amount) return alert("Weka amount");

    if (Number(amount) > getBalance()) {
      return alert("Salio halitoshi");
    }

    if (!window.confirm("Una uhakika?")) return;

    try {
      setLoading(true);

      const res = await fetch(`${SERVER_URL}/admin/sweep-trx-to-main`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromIndex: Number(walletIndex),
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        return;
      }

      alert("SUCCESS ✅");
      setAmount("");
      checkBalance();
    } catch (err) {
      alert("Error ya network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-sweep-page">
      <h2>Admin Sweep Wallet</h2>

      <input
        placeholder="Wallet Index"
        value={walletIndex}
        onChange={(e) => setWalletIndex(e.target.value)}
      />

      <button onClick={checkBalance}>
        {loading ? "Loading..." : "Check Balance"}
      </button>

      {balanceInfo && (
        <div>
          <p>Address: {balanceInfo.wallets.TRON_TRX.address}</p>
          <p>TRX: {format(balanceInfo.balances.TRX)}</p>
          <p>USDT: {format(balanceInfo.balances.USDT_TRC20)}</p>
        </div>
      )}

      <select value={coin} onChange={(e) => setCoin(e.target.value)}>
        <option value="TRX">TRX</option>
        <option value="USDT_TRC20">USDT</option>
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={() => setAmount(getBalance())}>ALL</button>

      <button onClick={sweep}>
        {loading ? "Processing..." : "Transfer"}
      </button>
    </div>
  );
}