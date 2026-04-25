import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./ConfirmDeposit.css";

const ConfirmDeposit = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { provider, number, fullname, amount } = location.state || {};

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const depositRef = collection(db, "tsh_transactions");

  // Load username from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleConfirm = async () => {
    if (!phone || !transactionId) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(depositRef, {
        username: username,
        provider: provider,
        businessNumber: number,
        recipient: fullname,
        amount: Number(amount),
        phone: phone,
        transactionId: transactionId,
        currency: "TZS",
        type: "deposit",
        status: "processing",
        createdAt: serverTimestamp(),
      });

      alert(
        "Deposit submitted successfully. Processing started. Please wait 30 minutes."
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to submit deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirm-container">

     
      <div className="confirm-card">


 {/* Back Button */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

        {/* Username */}
        <div className="username-box">
          <span>User👇🏿</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <h2>Confirm Deposit</h2>

        <div className="info-box">
          <b>Business Number:</b> {number}
        </div>

        <div className="info-box">
          <b>Recipient:</b> {fullname}
        </div>

        <div className="info-box">
          <b>Provider:</b> {provider}
        </div>

        <div className="info-box">
          <b>Amount:</b> TZS {amount}
          <br />
          <b>You Receive:</b> TZS {amount}
        </div>

        <label>Enter Your Deposited Phone Number</label>
        <input
          type="text"
          placeholder="07XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Enter Transaction ID</label>
        <input
          type="text"
          placeholder="Example DC53NA..."
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />

        <button
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : "Complete Deposit"}
        </button>

      </div>
    </div>
  );
};

export default ConfirmDeposit;