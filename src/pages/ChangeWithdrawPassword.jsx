import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import { useNavigate } from "react-router-dom";

import "./ChangeWithdrawPassword.css";

export default function ChangeWithdrawCode() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [question, setQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("username");

  /* =========================
     🔥 FETCH + CHECK SECURITY
  ========================= */
  useEffect(() => {

    const fetchData = async () => {

      if (!userId) return navigate("/settings");

      try {
        const ref = doc(standardDb, "security", userId);
        const snap = await getDoc(ref);

        // ❌ hakuna record
        if (!snap.exists()) {
          return navigate("/settings");
        }

        const data = snap.data();

        // ❌ hakuna question au answer
        if (!data.securityQuestion || !data.securityAnswer) {
          return navigate("/settings");
        }

        setQuestion(data.securityQuestion);

      } catch (err) {
        console.log(err);
        navigate("/settings");
      }

    };

    fetchData();

  }, [userId, navigate]);

  /* =========================
     🔥 STEP 1 VERIFY
  ========================= */
  const verifySecurity = async () => {

    setError("");
    setSuccess("");

    if (!securityAnswer) {
      setError("Enter answer");
      return;
    }

    try {
      setLoading(true);

      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError("User not found");
        return;
      }

      const data = snap.data();

      if (data.securityAnswer !== securityAnswer) {
        setError("Wrong answer");
        return;
      }

      setStep(2);

    } catch (err) {
      setError("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🔥 STEP 2 CHANGE CODE
  ========================= */
  const handleChange = async () => {

    setError("");
    setSuccess("");

    if (!oldCode || !newCode || !confirmCode) {
      setError("Fill all fields");
      return;
    }

    if (newCode !== confirmCode) {
      setError("Codes do not match");
      return;
    }

    if (newCode.length < 4 || newCode.length > 8) {
      setError("Code must be 4–8 characters");
      return;
    }

    try {
      setLoading(true);

      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError("User not found");
        return;
      }

      const data = snap.data();

      if (data.withdrawalCode !== oldCode) {
        setError("Wrong old code");
        return;
      }

      await updateDoc(ref, {
        withdrawalCode: newCode
      });

      setSuccess("Withdraw code changed successfully ✅");

      // RESET
      setStep(1);
      setSecurityAnswer("");
      setOldCode("");
      setNewCode("");
      setConfirmCode("");

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError("Error updating");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (

    <div className="withdraw-page">

      <div className="change-container">

        <h2>Change Withdraw Code</h2>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="question">
              {question || "No security question"}
            </div>

            <input
              placeholder="Your Answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />

            <button onClick={verifySecurity} disabled={loading}>
              {loading ? "Checking..." : "Next"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="password"
              placeholder="Old Withdraw Code"
              value={oldCode}
              onChange={(e) => setOldCode(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Withdraw Code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Code"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
            />

            <button onClick={handleChange} disabled={loading}>
              {loading ? "Processing..." : "Change Code"}
            </button>
          </>
        )}

      </div>

    </div>
  );
}