import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { secondaryDb } from "../firebaseSecondary";
import { collection, getDocs } from "firebase/firestore";
import "./BusinessPayment.css";

export default function BusinessPayment() {
  const navigate = useNavigate();

  const [provider, setProvider] = useState("Vodacom");
  const [currentNumber, setCurrentNumber] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const numbersRef = collection(secondaryDb, "normalNumbers");

  const MIN_AMOUNT = 10000;
  const MAX_AMOUNT = 5000000;

  const copyText = (text) => {
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
        alert("Copied: " + text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");
        textArea.remove();

        alert("Copied: " + text);
      }
    } catch (err) {
      alert("Copy failed");
    }
  };

  const loadNumbers = async () => {
    const snapshot = await getDocs(numbersRef);

    const filtered = snapshot.docs
      .map((doc) => doc.data())
      .filter((n) => n.provider === provider);

    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setCurrentNumber(filtered[randomIndex]);
    } else {
      setCurrentNumber(null);
    }
  };

  useEffect(() => {
    loadNumbers();
  }, [provider]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadNumbers();
    }, 1800000);

    return () => clearInterval(interval);
  }, [provider]);

  const handleContinue = () => {
    const numericAmount = Number(amount);

    if (!currentNumber) {
      setError("Deposit number not available");
      return;
    }

    if (!amount) {
      setError("Please enter amount");
      return;
    }

    if (numericAmount < MIN_AMOUNT) {
      setError("Kiwango cha chini cha deposit ni 10,000 TZS");
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError("Kiwango cha juu cha deposit ni 5,000,000 TZS");
      return;
    }

    setError("");

    navigate("/confirm-deposits", {
      state: {
        provider,
        number: currentNumber?.number,
        fullname: currentNumber?.fullname,
        amount,
      },
    });
  };

  const getInstructions = () => {
    if (!currentNumber) return "";

    if (provider === "Vodacom") {
      return `Dial *150*00#

1 Select 4 Pay by Mpesa
2 Select 1 Pay by phone
3 Enter Number: ${currentNumber.number}

Enter Amount: ${amount}

Enter PIN
Confirm`;
    }

    if (provider === "Airtel") {
      return `Dial *150*60#

1 Select 5 Lipa Bill
2 Select 1 Lipa kwa simu

Enter Number: ${currentNumber.number}

Enter Amount: ${amount}

Enter PIN
Confirm`;
    }

    if (provider === "Tigo") {
      return `Dial *150*01#

1 Select 5 Pay by phone
2 Select Mixx by Yas

Enter Number: ${currentNumber.number}

Enter Amount: ${amount}

Enter PIN
Confirm`;
    }

    if (provider === "Halotel") {
      return `Dial *150*88#

1 Select Send Money
2 Select Send to Halotel

Enter Number: ${currentNumber.number}

Enter Amount: ${amount}

Enter PIN
Confirm`;
    }

    return "";
  };

  return (
    <div className="business-container">
      <div className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </div>

      <h2>Select Network</h2>

      <div className="network-select">
        <button
          className={provider === "Vodacom" ? "active" : ""}
          onClick={() => setProvider("Vodacom")}
        >
          Vodacom
        </button>

        <button
          className={provider === "Airtel" ? "active" : ""}
          onClick={() => setProvider("Airtel")}
        >
          Airtel
        </button>

        <button
          className={provider === "Tigo" ? "active" : ""}
          onClick={() => setProvider("Tigo")}
        >
          Tigo
        </button>

        <button
          className={provider === "Halotel" ? "active" : ""}
          onClick={() => setProvider("Halotel")}
        >
          Halotel
        </button>
      </div>

      <p className="title">Deposit Account</p>

      {currentNumber ? (
        <div className="number-box">
          <p>
            <b>Phone:</b> {currentNumber.number}
            <button
              className="copy-btn"
              type="button"
              onClick={() => copyText(currentNumber.number)}
            >
              Copy
            </button>
          </p>

          <p>
            <b>Name:</b> {currentNumber.fullname}
          </p>
        </div>
      ) : (
        <div className="number-box">
          <p>No number available</p>
        </div>
      )}

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError("");
        }}
        className="amount-input"
      />

      {error && <p className="error-text">{error}</p>}

      <div className="instruction-box">
        <h3>Deposit Instructions</h3>
        <pre>{getInstructions()}</pre>
      </div>

      <button className="continue-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}