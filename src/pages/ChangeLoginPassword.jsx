import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import "./ChangeLoginPassword.css";

export default function ChangeLoginPassword() {

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {

    if (!oldPass || !newPass || !confirmPass) {
      alert("Fill all fields");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      const username = localStorage.getItem("username");

      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("User not found");
        return;
      }

      const userDoc = snap.docs[0];
      const data = userDoc.data();

      // 🔥 CHECK OLD PASSWORD
      if (data.password !== oldPass) {
        alert("Wrong old password");
        return;
      }

      // 🔥 UPDATE
      await updateDoc(doc(db, "users", userDoc.id), {
        password: newPass
      });

      alert("Password changed successfully ✅");

      setOldPass("");
      setNewPass("");
      setConfirmPass("");

    } catch (err) {
      console.log(err);
      alert("Error updating password");
    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="change-container">

      <h2>Change Login Password</h2>

      <input
        type="password"
        placeholder="Old Password"
        value={oldPass}
        onChange={(e)=>setOldPass(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPass}
        onChange={(e)=>setNewPass(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPass}
        onChange={(e)=>setConfirmPass(e.target.value)}
      />

      <button onClick={handleChange} disabled={loading}>
        {loading ? "Processing..." : "Change Password"}
      </button>

    </div>

  );
}