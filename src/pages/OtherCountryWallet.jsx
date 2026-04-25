import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import "./OtherCountryWallet.css";

export default function OtherCountryWallet() {

  const userId = localStorage.getItem("username");
  const navigate = useNavigate();

  const [wallets, setWallets] = useState([]);
  const [realName, setRealName] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [viewCards, setViewCards] = useState(false);

  const [country, setCountry] = useState("");
  const [network, setNetwork] = useState("");
  const [number, setNumber] = useState("");
  const [numberError, setNumberError] = useState("");

  const [error, setError] = useState("");

  // 🔥 COUNTRIES DATA
  const countries = {
    "🇰🇪 Kenya": { name:"Kenya", code:"+254", networks:["Safaricom (M-Pesa)","Airtel Kenya"] },
    "🇲🇬 Madagascar": { name:"Madagascar", code:"+261", networks:["Airtel","Orange"] },
    "🇧🇼 Botswana":{ name:"Botswana", code:"+267", networks:["Orange","BTC","Mascom"] },
    "🇸🇸 South Sudan":{ name:"South Sudan", code:"+211", networks:["MGurush","MTN"] },
    "🇿🇼 Zimbabwe":{ name:"Zimbabwe", code:"+263", networks:["EcoCash"] },
    "🇲🇿 Mozambique":{ name:"Mozambique", code:"+258", networks:["Vodacom"] },
    "🇲🇼 Malawi":{ name:"Malawi", code:"+265", networks:["Airtel","TNM"] },
    "🇿🇲 Zambia":{ name:"Zambia", code:"+260", networks:["Zamtel","Airtel Zambia","MTN Zambia"] },
    "🇹🇿 Tanzania": { name:"Tanzania", code:"+255", networks:["BANK TRANSFER ONLY"] },
    "🇨🇩 DRC - Congo":{ name:"DRC - Congo", code:"+243", networks:["Airtel","Vodacom Congo","Orange","Illico Cash"] },
    "🇧🇮 Burundi":{ name:"Burundi", code:"+257", networks:["Ecocash","Lumicash"] },
    "🇷🇼 Rwanda":{ name:"Rwanda", code:"+250", networks:["Airtel Rwanda","MTN Rwanda"] },
    "🇺🇬 Uganda":{ name:"Uganda", code:"+256", networks:["Airtel","MTN"] }
  };

  const selectedCountry = countries[country];

  // 🔥 FETCH
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setWallets(data.wallets || []);
        setRealName(data.realName || "");
      }
    };

    fetchData();
  }, [userId]);

  // 🔥 LOCK SCROLL
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showModal]);

  // 🔥 ADD WALLET
  const handleAdd = async () => {

    setError("");

    if (!country || !network || !number) {
      setError("Fill all required fields");
      return;
    }

    if (number.length < 5 || number.length > 25) {
      setError("Enter between 5 and 25 digits");
      return;
    }

    if (wallets.length >= 2) {
      setError("Limit reached: Only 2 accounts allowed");
      return;
    }

    try {
      const newWallets = [
        ...wallets,
        {
          country: selectedCountry.name,
          code: selectedCountry.code,
          network,
          number
        }
      ];

      const ref = doc(standardDb, "security", userId);
      await setDoc(ref, { wallets: newWallets }, { merge: true });

      setWallets(newWallets);
      setShowModal(false);

      // RESET
      setCountry("");
      setNetwork("");
      setNumber("");
      setNumberError("");

      alert("Wallet added successfully ✅");

    } catch {
      setError("Error saving wallet");
    }
  };

  return (
    <div className="wallet-page">

      <div className="wallet-container">

        <h2>Other Country Wallet</h2>

        {/* ADD */}
        <div
          className="add-wallet-card"
          onClick={() => {

            if (!realName) {
              alert("Set real name first");
              return;
            }

            if (wallets.length >= 2) {
              alert("Limit reached: Only 2 accounts allowed");
              return;
            }

            setShowModal(true);
          }}
        >
          <div>
            <b>Add Wallet</b>
            <p>Still can bind {2 - wallets.length} accounts</p>
          </div>
          <span>›</span>
        </div>

        {/* VIEW */}
        {wallets.length > 0 && (
          <button
            className="view-btn"
            onClick={() => setViewCards(!viewCards)}
          >
            {viewCards ? "Hide Wallets" : "View Wallets"}
          </button>
        )}

        {/* CARDS */}
        {viewCards && wallets.map((w, i) => (
          <div key={i} className="wallet-card">
            <div className="wallet-top">
              <b>{w.country}</b>
              <span>{w.network}</span>
            </div>

            <p className="full-number">
              {w.code} {w.number}
            </p>
          </div>
        ))}

        <small className="reminder">
          Max: 2 accounts only
        </small>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>

          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="row">
              <span>Account Name:</span>
              <b className="readonly">{realName}</b>
            </div>

            {/* COUNTRY */}
            <div className="row">
              <span>Country:</span>
              <select
                value={country}
                onChange={(e) => {
                  const selected = e.target.value;

                  // 🔥 REDIRECT TANZANIA
                  if (countries[selected]?.name === "Tanzania") {
                    navigate("/add-card");
                    return;
                  }

                  setCountry(selected);
                  setNetwork("");
                }}
              >
                <option value="">Select country</option>
                {Object.keys(countries).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* NETWORK */}
            {selectedCountry && (
              <div className="row">
                <span>Network:</span>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  <option value="">Select network</option>
                  {selectedCountry.networks.map((n, i) => (
                    <option key={i}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* NUMBER */}
            {selectedCountry && (
              <div className="row">
                <span>Number:</span>
                <div style={{ display: "flex", gap: "5px" }}>
                  <span>{selectedCountry.code}</span>
                  <input
                    value={number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setNumber(val);

                      if (val.length > 0 && (val.length < 5 || val.length > 25)) {
                        setNumberError("5 - 25 digits required");
                      } else {
                        setNumberError("");
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {numberError && (
              <div className="input-error">{numberError}</div>
            )}

            {error && <div className="error">{error}</div>}

            <button className="confirm" onClick={handleAdd}>
              CONFIRM
            </button>

            <button
              className="cancel"
              onClick={() => setShowModal(false)}
            >
              CANCEL
            </button>

          </div>

        </div>
      )}

    </div>
  );
}