import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import "./AddCard.css";

export default function WalletManagement() {

  const userId = localStorage.getItem("username");
  const navigate = useNavigate();

  const [wallets, setWallets] = useState([]);
  const [realName, setRealName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [viewCards, setViewCards] = useState(false);

  const [network, setNetwork] = useState("");
  const [number, setNumber] = useState("");
  const [numberError, setNumberError] = useState("");

  const [showExtra, setShowExtra] = useState(false);
  const [bank, setBank] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [remarks, setRemarks] = useState("");

  const [error, setError] = useState("");

  const networks = ["Vodacom", "Airtel", "Halotel", "Tigo/Zantel"];

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

    if (!network || !number) {
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
          country: "Tanzania",   // 🔥 muhimu
          code: "+255",          // 🔥 muhimu
          network,
          number,
          bank,
          province,
          city,
          remarks
        }
      ];

      const ref = doc(standardDb, "security", userId);
      await setDoc(ref, { wallets: newWallets }, { merge: true });

      setWallets(newWallets);
      setShowModal(false);

      // RESET
      setNetwork("");
      setNumber("");
      setBank("");
      setProvince("");
      setCity("");
      setRemarks("");
      setShowExtra(false);
      setNumberError("");

      alert("Wallet added successfully ✅");

    } catch {
      setError("Error saving wallet");
    }
  };

  return (
    <div className="wallet-page">

      <div className="wallet-container">

        {/* 🇹🇿 HEADER */}
        <div className="country-header">
          🇹🇿 Tanzania Wallet
        </div>

        <h2>Wallet Management</h2>

        {/* ADD */}
        <div
          className="add-wallet-card"
          onClick={() => {

            if (!realName) {
              alert("Set real name first");
              navigate("/settings");
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
              <b>{w.country || "Tanzania"}</b>
              <span>{w.network}</span>
            </div>

            <p className="full-number">
              {w.code || "+255"} {w.number}
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

            <div className="row">
              <span>Mobile Money:</span>
              <select
                value={network}
                onChange={(e) => {
                  setNetwork(e.target.value);
                  setShowExtra(true);
                }}
              >
                <option value="">Select</option>
                {networks.map((n, i) => (
                  <option key={i}>{n}</option>
                ))}
              </select>
            </div>

            <div className="row">
              <span>Mobile Number:</span>
              <div style={{ display: "flex", gap: "5px" }}>
                <span>+255</span>
                <input
                  value={number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setNumber(value);

                    if (value.length > 0 && (value.length < 5 || value.length > 25)) {
                      setNumberError("The Account Must Be Between 5 And 25 Digits");
                    } else {
                      setNumberError("");
                    }
                  }}
                />
              </div>
            </div>

            {numberError && (
              <div className="input-error">{numberError}</div>
            )}

            {network && (
              <button
                className="optional-btn"
                onClick={() => setShowExtra(!showExtra)}
              >
                {showExtra ? "Hide details" : "More details"}
              </button>
            )}

            {showExtra && (
              <>
                <div className="row">
                  <span>Bank:</span>
                  <input value={bank} onChange={(e) => setBank(e.target.value)} />
                </div>

                <div className="row">
                  <span>Province:</span>
                  <input value={province} onChange={(e) => setProvince(e.target.value)} />
                </div>

                <div className="row">
                  <span>City:</span>
                  <input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="row">
                  <span>Remarks:</span>
                  <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
              </>
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