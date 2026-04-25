import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AllOthersCountry.css";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";

const countryMethods = {
  Kenya: [
    {
      network: "Safaricom or Airtel",
      ussd: "*840#",
      steps: [
        "Select (1) Send Money To Abroad",
        "Select (1) Send to Mobile Number",
        "Select (3) Send to Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter recipient mobile number in international format e.g 255XXXXXXXX",
        "Enter amount in KES (Minimum 927.64)",
        "Select (2) Business or Investment",
        "Select (1) Confirm and enter Your PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Uganda: [
    {
      network: "Airtel or MTN",
      ussd: "*165#",
      steps: [
        "Select Send Money",
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter mobile number 255XXXXXXXX",
        "Enter amount (Minimum 25974.02 UGX)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Rwanda: [
    {
      network: "Airtel or MTN",
      ussd: "*182#",
      steps: [
        "Select Send Money",
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXXX",
        "Enter amount (Minimum 10526.36 RWF)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Burundi: [
    {
      network: "Ecocash or Lumicash",
      ussd: "",
      steps: [
        "Dial Ecocash or Lumicash USSD",
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXXX",
        "Enter amount (Minimum 21276.6 BIF)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  "DRC - Congo": [
    {
      network: "Vodacom M-Pesa / Airtel / Orange / Illico Cash",
      ussd: "",
      steps: [
        "Dial M-Pesa USSD",//
        "Select Send Money",
        "Select International",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXXX",
        "Enter amount (Minimum 7.24 USD)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Zambia: [
    {
      network: "Airtel / MTN / Zamtel",
      ussd: "*115#",
      steps: [
        "Select Send Money",
        "Select Cross Border",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXXX",
        "Enter amount (Minimum 135.84 ZMW)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Malawi: [
    {
      network: "Airtel / TNM",
      ussd: "*211#",
      steps: [
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXXX",
        "Enter amount (Minimum 14468.8 MWK)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Mozambique: [
    {
      network: "Vodacom",
      ussd: "",
      steps: [
        "Dial M-Pesa USSD",
        "Select Send Money",
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXX",
        "Enter amount (Minimum 457.56 MZN)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Zimbabwe: [
    {
      network: "EcoCash",
      ussd: "*151#",
      steps: [
        "Select Send Money",
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXX",
        "Enter amount (Minimum 7.24 USD)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  "South Sudan": [
    {
      network: "MGurush / MTN",
      ussd: "",
      steps: [
        "Select International Transfer",
        "Select Tanzania",
        "Enter number 255XXXXXXX",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter amount (Minimum 42553.2 SSP)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Botswana: [
    {
      network: "Orange / BTC / Mascom",
      ussd: "",
      steps: [
        "Select International Transfer",
        "Select Tanzania",
        "Enter number 255XXXXXXX",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter amount (Minimum 94.36 BWP)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
  Madagascar: [
    {
      network: "Airtel / Orange",
      ussd: "",
      steps: [
        "Select International Transfer",
        "Select Tanzania",
        "Select Network(Enter vodacom/M-Pesa)",
        "Enter number 255XXXXXXX",
        "Enter amount (Minimum 29198 MGA)",
        "Select Business or Investment(If the option appears)",
        "Confirm with PIN",
        "Submitte/Confirm",
      ],
    },
  ],
};

const countryCodes = {
  Kenya: "+254",
  Uganda: "+256",
  Rwanda: "+250",
  Burundi: "+257",
  "DRC - Congo": "+243",
  Zambia: "+260",
  Malawi: "+265",
  Mozambique: "+258",
  Zimbabwe: "+263",
  "South Sudan": "+211",
  Botswana: "+267",
  Madagascar: "+261",
};

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

const currencyRates = {
  Kenya: 21.5,
  Uganda: 0.77,
  Rwanda: 1.9,
  Burundi: 0.94,
  "DRC - Congo": 2762.43,
  Zambia: 147.23,
  Malawi: 1.382,
  Mozambique: 43.71,
  Zimbabwe: 2762.43,
  "South Sudan": 0.469,
  Botswana: 211.95,
  Madagascar: 0.684,
};


const countryCurrency = {
  Kenya: "KES",
  Uganda: "UGX",
  Rwanda: "RWF",
  Burundi: "BIF",
  "DRC - Congo": "USD",
  Zambia: "ZMW",
  Malawi: "MWK",
  Mozambique: "MZN",
  Zimbabwe: "USD",
  "South Sudan": "SSP",
  Botswana: "BWP",
  Madagascar: "MGA",
};

const OtherCountry = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { countryName, flag } = location.state || {};

  const storedUser = localStorage.getItem("username") || "Guest";

  const [username, setUsername] = useState(storedUser);
  const [phone, setPhone] = useState(countryCodes[countryName] || "");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [orbitaInfo, setOrbitaInfo] = useState({ account: "", name: "" });
 

  const methods = countryMethods[countryName] || [];

  const fetchRandomOrbita = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(standardDb, "othercountry") // 👈 badala ya db
    );

    if (!querySnapshot.empty) {
      const docs = querySnapshot.docs;
      const randomDoc =
        docs[Math.floor(Math.random() * docs.length)].data();

      setOrbitaInfo({
        account: randomDoc.number
  ? randomDoc.number.toString().replace(/^0/, "255")
  : "",
        name: randomDoc.name || "",
      });
    }
  } catch (err) {
    console.error("Error fetching Orbita info:", err);
  }
};


  useEffect(() => {

    if (!countryName) {
      navigate("/");
      return;
    }

    fetchRandomOrbita();

    

  }, [countryName, navigate]);

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

  

   

const handleDeposit = async () => {

  const minCountry = countryMinAmounts[countryName] || 0;

  if (parseFloat(amount) < minCountry) {

    alert(
      `Minimum deposit for ${countryName} is ${minCountry}. Please enter ${minCountry} or more to continue.`
    );

    return;

  }

  if (!phone || !amount || !transactionId) {

    alert("Please fill all fields");

    return;

  }

  try {

   await addDoc(collection(standardDb, "visterdeposte"), { // 👈 badala ya db
  username: username,
  country: countryName,
  customerPhone: phone,
  orbitaPhone: orbitaInfo.account,
  orbitaName: orbitaInfo.name,
  amount: amount,
  transactionId: transactionId,
  status: "processing",
  createdAt: serverTimestamp()
});

    alert(
     
  `Deposit Request Submitted\n\nUser: ${username}\nCountry: ${countryName}\nPhone: ${phone}\nAmount: ${amount} ${countryCurrency[countryName]}\nYou receive: ${amount} ${countryCurrency[countryName]}\nTransaction ID: ${transactionId}\n\nStatus: Processing`);
    

    setAmount("");
    setTransactionId("");

  } catch (error) {

    console.error("Deposit error:", error);

    alert("Failed to submit deposit request");

  }

};

  return (
    <div className="other-country-container">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="input-box username-box">
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <h2 className="country-title">
        <span className="flag">{flag}</span> {countryName}
      </h2>

      {methods.map((method, idx) => (
        <div key={idx} className="mobile-method-card">

          <div className="method-content">

            <div className="instructions">

              <h3>{method.network}</h3>

              <p>Deposit Instructions</p>

              {method.ussd && <p>USSD: {method.ussd}</p>}

              <ol>
  {method.steps.map((step, i) => (
    <li key={i}>
      {step.includes("255XXXXXXXX") || step.includes("255XXXXXXX")
        ? step.replace(
            /255X+/g,
            orbitaInfo.account || "Loading..."
          )
        : step}
    </li>
  ))}
  </ol>

            </div>

            <div className="user-info-box">

              <p>
                 Account: {orbitaInfo.account || "Loading..."}
                {orbitaInfo.account && (
                  <button
                    onClick={() => copyText(orbitaInfo.account)}
                  >
                    Copy
                  </button>
                )}
              </p>
              <p>
                Name: {orbitaInfo.name || "Loading..."}
                {orbitaInfo.name && (
                  <button
                    onClick={() => copyText(orbitaInfo.name)}
                  >
                    Copy
                  </button>
                )}
              </p>

            </div>

          </div>

        </div>
      ))}

      <div className="input-box">
        <label>Enter Your Deposit Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="input-box">

        <label>Deposit Amount</label>

        <input
          placeholder="Enter amount"
          value={amount}
         onChange={(e) => setAmount(e.target.value)}
        />

     

      </div>

      <div className="input-box">

        <label>Transaction ID / Message</label>

        <input
          placeholder="Example: DCQ..... / PP276......."
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />

      </div>

      <button className="deposit-btn" onClick={handleDeposit}>
        Confirm Deposit
      </button>

    </div>
  );
};

export default OtherCountry;