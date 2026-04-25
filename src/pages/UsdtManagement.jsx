import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import { useNavigate } from "react-router-dom";
import "./UsdtManagement.css";

export default function CryptoWalletManagement() {

  const userId = localStorage.getItem("username");
  const navigate = useNavigate();

  const [wallets, setWallets] = useState([]);
  const [realName, setRealName] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [coin, setCoin] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const [showFull, setShowFull] = useState({});

  const inputRef = useRef(null);

  const coins = [
    "USDT (TRC20)",
    "USDT (ERC20)",
    "USDT (BEP20)",
    "BTC",
    "ETH" ,
    "TRON  (TRX)",
    "SOLANA"
  ];

  /* NETWORK */
  const getNetwork = () => {
    if (coin.includes("TRC20")) return "TRC20";
    if (coin === "TRX") return "TRON (TRX)";
    if (coin === "BTC") return "BTC";
    if (coin === "ETH") return "ERC20";
    if (coin.includes("BEP20")) return "BEP20 (BNB)";
    if (coin === "SOLANA") return "SOLANA";
    return "TRC20";
  };

  /* MASK */
  const maskAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "********" + addr.slice(-4);
  };

  /* 🔥 FETCH + PROTECTION */
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        navigate("/settings");
        return;
      }

      const data = snap.data();

      // 🔒 PROTECTION
      if (
        !data.realName ||
        !data.withdrawalCode ||
        !data.securityQuestion
      ) {
        alert("Complete your account setup first ⚠️");
        navigate("/settings");
        return;
      }

      setWallets(data.cryptoWallets || []);
      setRealName(data.realName || "");
    };

    fetchData();
  }, [userId, navigate]);

  /* PASTE */
  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text.trim());
        return;
      }
    } catch {}

    inputRef.current?.focus();
  };

  /* COPY */
  const handleCopy = async (addr) => {

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(addr);
        alert("Copied ✅");
        return;
      } catch {}
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = addr;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.execCommand("copy");

      document.body.removeChild(textArea);

      alert("Copied ✅");

    } catch {
      alert("Copy failed ❌");
    }
  };

  /* TOGGLE */
  const toggleShow = (index) => {
    setShowFull(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  /* ADD */
  const handleAdd = async () => {

    setError("");

    if (!coin || !address) {
      setError("Fill all fields");
      return;
    }

    if (address.length < 10) {
      setError("Invalid wallet address");
      return;
    }

    if (wallets.length >= 3) {
      setError("Max 3 wallets");
      return;
    }

    try {

      const newWallets = [
        ...wallets,
        {
          coin,
          network: getNetwork(),
          address
        }
      ];

      const ref = doc(standardDb, "security", userId);

      await setDoc(ref, {
        cryptoWallets: newWallets
      }, { merge: true });

      setWallets(newWallets);
      setShowModal(false);

      setCoin("");
      setAddress("");

      alert("Wallet added ✅");

    } catch {
      setError("Error saving wallet");
    }
  };

  return (

    <div className="wallet-page">

      <div className="wallet-container">

        <div className="country-header">💰 Crypto Wallet</div>

        <h2>USDT / Crypto Management</h2>

        {/* ADD */}
        <div
          className="add-wallet-card"
          onClick={() => setShowModal(true)}
        >
          <div>
            <b>Add Crypto Wallet</b>
            <p>Max 3 wallets</p>
          </div>
          <span>›</span>
        </div>

        {/* LIST */}
        {wallets.map((w, i) => (
          <div key={i} className="wallet-card">

            <div className="wallet-top">
              <b>{w.coin}</b>
              <span>{w.network}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              
              <p style={{ flex: 1 }}>
                {showFull[i] ? w.address : maskAddress(w.address)}
              </p>

              <button onClick={() => toggleShow(i)}>
                {showFull[i] ? "🙈" : "👁️"}
              </button>

              <button onClick={() => handleCopy(w.address)}>
                Copy
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>

          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="row">
             
            
            </div>

            <div className="row">
              <span>Select Coin:</span>
              <select
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
              >
                <option value="">Select</option>
                {coins.map((c, i) => (
                  <option key={i}>{c}</option>
                ))}
              </select>
            </div>

            <div className="row">
              <span>Wallet Address:</span>

              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  ref={inputRef}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Paste wallet address"
                  style={{ flex: 1 }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    if (pasted) setAddress(pasted.trim());
                  }}
                />

                <button onClick={handlePasteClick}>
                  Paste
                </button>
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <button onClick={handleAdd}>CONFIRM</button>
            <button onClick={() => setShowModal(false)}>CANCEL</button>

          </div>

        </div>
      )}

    </div>
  );
}