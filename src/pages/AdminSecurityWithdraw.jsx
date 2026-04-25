
import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { standardDb } from "../firebaseStandard";
import "./AdminSecurityWithdraw.css";

export default function AdminSecurityWithdraw() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    realName: "",
    nickname: "",
    email: "",
    facebook: "",
    line: "",
    birthdate: "",
    withdrawalCode: "",
    securityQuestion: "",
    securityAnswer: "",
    autoBet: "",
    autoRange: ""
  });

  const [mobileWalletsForm, setMobileWalletsForm] = useState([]);
  const [cryptoWalletsForm, setCryptoWalletsForm] = useState([]);

  const maskValue = (value = "", start = 2, end = 2) => {
    const str = String(value || "");
    if (!str) return "-";
    if (str.length <= start + end) return "*".repeat(str.length);
    return `${str.slice(0, start)}${"*".repeat(Math.max(4, str.length - (start + end)))}${str.slice(-end)}`;
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError("Enter username");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setEditing(false);

    try {
      const cleanUsername = username.trim();

      const userQuery = query(
        collection(db, "users"),
        where("username", "==", cleanUsername)
      );

      const userSnap = await getDocs(userQuery);

      let userData = null;
      if (!userSnap.empty) {
        const firstUser = userSnap.docs[0];
        userData = {
          id: firstUser.id,
          ...firstUser.data()
        };
      }

      const securityRef = doc(standardDb, "security", cleanUsername);
      const securitySnap = await getDoc(securityRef);

      if (!userData && !securitySnap.exists()) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const securityData = securitySnap.exists() ? securitySnap.data() : {};

      const wallets = Array.isArray(securityData.wallets) ? securityData.wallets : [];
      const cryptoWallets = Array.isArray(securityData.cryptoWallets)
        ? securityData.cryptoWallets
        : [];

      setForm({
        realName: securityData.realName || "",
        nickname: securityData.nickname || "",
        email: securityData.email || "",
        facebook: securityData.facebook || "",
        line: securityData.line || "",
        birthdate: securityData.birthdate || "",
        withdrawalCode: securityData.withdrawalCode || "",
        securityQuestion: securityData.securityQuestion || "",
        securityAnswer: securityData.securityAnswer || "",
        autoBet: securityData.autoBet || "",
        autoRange: securityData.autoRange || ""
      });

      setMobileWalletsForm(wallets);
      setCryptoWalletsForm(cryptoWallets);

      setResult({
        username: cleanUsername,
        userData,
        securityData,
        wallets,
        cryptoWallets
      });
    } catch (err) {
      console.log(err);
      setError("Failed to load user data");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!result?.username) return;

    setSaving(true);
    try {
      const securityRef = doc(standardDb, "security", result.username);

      await setDoc(
        securityRef,
        {
          ...form,
          wallets: mobileWalletsForm,
          cryptoWallets: cryptoWalletsForm
        },
        { merge: true }
      );

      const newSecurityData = {
        ...(result.securityData || {}),
        ...form,
        wallets: mobileWalletsForm,
        cryptoWallets: cryptoWalletsForm
      };

      setResult((prev) => ({
        ...prev,
        securityData: newSecurityData,
        wallets: mobileWalletsForm,
        cryptoWallets: cryptoWalletsForm
      }));

      setEditing(false);
      alert("Saved successfully ✅");
    } catch (err) {
      console.log(err);
      alert("Failed to save ❌");
    }
    setSaving(false);
  };

  const handleDeleteMobileWallet = (index) => {
    if (!window.confirm("Delete this mobile wallet?")) return;
    setMobileWalletsForm((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteCryptoWallet = (index) => {
    if (!window.confirm("Delete this crypto wallet?")) return;
    setCryptoWalletsForm((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMobileWalletChange = (index, field, value) => {
    setMobileWalletsForm((prev) =>
      prev.map((wallet, i) =>
        i === index ? { ...wallet, [field]: value } : wallet
      )
    );
  };

  const handleCryptoWalletChange = (index, field, value) => {
    setCryptoWalletsForm((prev) =>
      prev.map((wallet, i) =>
        i === index ? { ...wallet, [field]: value } : wallet
      )
    );
  };

  const renderField = (label, key, masked = false) => (
    <div className="info-row">
      <span>{label}</span>
      {editing ? (
        <input
          className="edit-input"
          value={form[key]}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [key]: e.target.value
            }))
          }
        />
      ) : (
        <b>
          {masked
            ? form[key]
              ? maskValue(
                  form[key],
                  key === "withdrawalCode" ? 0 : 1,
                  key === "withdrawalCode" ? 0 : 1
                )
              : "-"
            : form[key] || "-"}
        </b>
      )}
    </div>
  );

  return (
    <div className="admin-security-container">
      <h2>Admin Security Withdraw</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "SEARCH"}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="result-wrapper">
          <div className="card">
            <div className="card-top-actions">
              <h3>Basic Info</h3>
            </div>

            <div className="info-row">
              <span>Username</span>
              <b>{result.username}</b>
            </div>
            <div className="info-row">
              <span>Phone Number</span>
              <b>{result.userData?.phoneNumber || "-"}</b>
            </div>
            <div className="info-row">
              <span>User Email</span>
              <b>{result.userData?.email || "-"}</b>
            </div>
            <div className="info-row">
              <span>Referral By</span>
              <b>{result.userData?.referralBy || result.userData?.whoReferredWho || "-"}</b>
            </div>
          </div>

          <div className="card">
            <div className="card-top-actions">
              <h3>Security Setup</h3>

              {!editing ? (
                <button className="action-btn" onClick={() => setEditing(true)}>
                  Edit
                </button>
              ) : (
                <div className="top-btn-group">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        realName: result.securityData?.realName || "",
                        nickname: result.securityData?.nickname || "",
                        email: result.securityData?.email || "",
                        facebook: result.securityData?.facebook || "",
                        line: result.securityData?.line || "",
                        birthdate: result.securityData?.birthdate || "",
                        withdrawalCode: result.securityData?.withdrawalCode || "",
                        securityQuestion: result.securityData?.securityQuestion || "",
                        securityAnswer: result.securityData?.securityAnswer || "",
                        autoBet: result.securityData?.autoBet || "",
                        autoRange: result.securityData?.autoRange || ""
                      });
                      setMobileWalletsForm(result.wallets || []);
                      setCryptoWalletsForm(result.cryptoWallets || []);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {renderField("Real Name", "realName")}
            {renderField("Nickname", "nickname")}
            {renderField("Email", "email")}
            {renderField("Facebook/WhatsApp", "facebook")}
            {renderField("Line/Network", "line")}
            {renderField("Birthdate", "birthdate")}
            {renderField("Withdrawal Code", "withdrawalCode", true)}
            {renderField("Security Question", "securityQuestion")}
            {renderField("Security Answer", "securityAnswer", true)}
            {renderField("Automatic Betting", "autoBet")}
            {renderField("Auto Range", "autoRange")}
          </div>

          <div className="card">
            <h3>Mobile Wallets</h3>
            {mobileWalletsForm.length === 0 ? (
              <p className="empty-text">No mobile wallets</p>
            ) : (
              mobileWalletsForm.map((wallet, index) => (
                <div key={index} className="wallet-item">
                  <div className="wallet-head">
                    <b>Mobile Wallet #{index + 1}</b>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMobileWallet(index)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="info-row">
                    <span>Country</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.country || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "country", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.country || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Network</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.network || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "network", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.network || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Code</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.code || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "code", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.code || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Number</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.number || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "number", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.number || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Bank</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.bank || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "bank", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.bank || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Province</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.province || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "province", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.province || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>City</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.city || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "city", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.city || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Remarks</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.remarks || ""}
                        onChange={(e) =>
                          handleMobileWalletChange(index, "remarks", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.remarks || "-"}</b>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h3>Crypto Wallets</h3>
            {cryptoWalletsForm.length === 0 ? (
              <p className="empty-text">No crypto wallets</p>
            ) : (
              cryptoWalletsForm.map((wallet, index) => (
                <div key={index} className="wallet-item">
                  <div className="wallet-head">
                    <b>Crypto Wallet #{index + 1}</b>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCryptoWallet(index)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="info-row">
                    <span>Coin</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.coin || ""}
                        onChange={(e) =>
                          handleCryptoWalletChange(index, "coin", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.coin || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Network</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.network || ""}
                        onChange={(e) =>
                          handleCryptoWalletChange(index, "network", e.target.value)
                        }
                      />
                    ) : (
                      <b>{wallet.network || "-"}</b>
                    )}
                  </div>

                  <div className="info-row">
                    <span>Address</span>
                    {editing ? (
                      <input
                        className="edit-input"
                        value={wallet.address || ""}
                        onChange={(e) =>
                          handleCryptoWalletChange(index, "address", e.target.value)
                        }
                      />
                    ) : (
                      <b className="break-text">{wallet.address || "-"}</b>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}