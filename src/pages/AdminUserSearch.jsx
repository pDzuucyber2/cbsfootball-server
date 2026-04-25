import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import "./AdminUserSearch.css";

const AdminUserManager = () => {
  const [searchField, setSearchField] = useState("username");
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    setUsers([]);
    setEditingUser(null);

    if (!searchValue.trim()) {
      setMessage("Please enter a search value.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where(searchField, "==", searchValue));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage("No users found.");
        return;
      }

      const fetchedUsers = [];

      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        const userId = docSnap.id;

        const referrerQuery = query(
          usersRef,
          where("referralCode", "==", userData.whoReferredWho || "")
        );
        const referrerSnapshot = await getDocs(referrerQuery);

        const referrer =
          !referrerSnapshot.empty
            ? referrerSnapshot.docs[0].data().username
            : "Unknown";

        fetchedUsers.push({
          id: userId,
          ...userData,
          referrer,
        });
      }

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage("Failed to fetch users.");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditedData({ ...user });
    setMessage("");
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditedData({});
    setMessage("");
  };

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", editingUser.id);

      const dataToUpdate = {
        fullName: editedData.fullName || "",
        username: editedData.username || "",
        phoneNumber: editedData.phoneNumber || "",
        password: editedData.password || "",
        referralCode: editedData.referralCode || "",
        referralLink: editedData.referralLink || "",
        country: editedData.country || "",
        language: editedData.language || "",
        role: editedData.role || "",
        depositedAmountOnJoinDay: Number(
          editedData.depositedAmountOnJoinDay || 0
        ),
        whoReferredWho: editedData.whoReferredWho || "",

        tshBalance: Number(editedData.tshBalance || 0),
        usdtBalance: Number(editedData.usdtBalance || 0),
        KESBalance: Number(editedData.KESBalance || 0),
        UGXBalance: Number(editedData.UGXBalance || 0),
        RWFBalance: Number(editedData.RWFBalance || 0),
        BIFBalance: Number(editedData.BIFBalance || 0),
        ZMWBalance: Number(editedData.ZMWBalance || 0),
        MWKBalance: Number(editedData.MWKBalance || 0),
        MZNBalance: Number(editedData.MZNBalance || 0),
        USDBalance: Number(editedData.USDBalance || 0),
        SSPBalance: Number(editedData.SSPBalance || 0),
        BWPBalance: Number(editedData.BWPBalance || 0),
        MGABalance: Number(editedData.MGABalance || 0),
      };

      await updateDoc(userRef, dataToUpdate);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? { ...user, ...dataToUpdate } : user
        )
      );

      setMessage("User updated successfully.");
      setEditingUser(null);
      setEditedData({});
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage("Failed to update user.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setMessage("User deleted successfully.");
    } catch (err) {
      console.error("Error deleting user:", err);
      setMessage("Failed to delete user.");
    }
  };

  const renderField = (label, field, type = "text") => (
    <div className="admin-field-row">
      <label className="admin-label">{label}</label>
      <input
        className="admin-input"
        type={type}
        value={editedData[field] ?? ""}
        onChange={(e) =>
          setEditedData({
            ...editedData,
            [field]: e.target.value,
          })
        }
      />
    </div>
  );

  const renderBalanceBox = (label, value) => (
    <div className="admin-balance-box">
      <span className="admin-balance-title">{label}</span>
      <span className="admin-balance-value">{Number(value || 0)}</span>
    </div>
  );

  return (
    <div className="admin-user-manager">
      <div className="admin-header">
        <h2>Admin User Manager</h2>
        <p>Search, view, edit and delete users easily.</p>
      </div>

      <form onSubmit={handleSearch} className="admin-search-form">
        <select
          className="admin-select"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="username">Username</option>
          <option value="fullName">Full Name</option>
          <option value="phoneNumber">Phone Number</option>
          <option value="referralCode">Referral Code</option>
        </select>

        <input
          className="admin-search-input"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Enter search value"
        />

        <button className="admin-btn admin-btn-search" type="submit">
          Search
        </button>
      </form>

      {message && <div className="admin-message">{message}</div>}

      {users.map((user) => (
        <div key={user.id} className="admin-user-card">
          {editingUser && editingUser.id === user.id ? (
            <div className="admin-edit-section">
              <h3 className="admin-card-title">Edit User</h3>

              <div className="admin-form-grid">
                {renderField("Full Name", "fullName")}
                {renderField("Username", "username")}
                {renderField("Phone Number", "phoneNumber")}
                {renderField("Password", "password")}
                {renderField("Referral Code", "referralCode")}
                {renderField("Referral Link", "referralLink")}
                {renderField("Country", "country")}
                {renderField("Language", "language")}
                {renderField("Role", "role")}
                {renderField("Who Referred Who", "whoReferredWho")}
                {renderField(
                  "Deposited Amount on Join Day",
                  "depositedAmountOnJoinDay",
                  "number"
                )}
              </div>

              <h4 className="admin-subtitle">Balances</h4>
              <div className="admin-form-grid">
                {renderField("TZS Balance", "tshBalance", "number")}
                {renderField("USDT Balance", "usdtBalance", "number")}
                {renderField("KES Balance", "KESBalance", "number")}
                {renderField("UGX Balance", "UGXBalance", "number")}
                {renderField("RWF Balance", "RWFBalance", "number")}
                {renderField("BIF Balance", "BIFBalance", "number")}
                {renderField("ZMW Balance", "ZMWBalance", "number")}
                {renderField("MWK Balance", "MWKBalance", "number")}
                {renderField("MZN Balance", "MZNBalance", "number")}
                {renderField("USD Balance", "USDBalance", "number")}
                {renderField("SSP Balance", "SSPBalance", "number")}
                {renderField("BWP Balance", "BWPBalance", "number")}
                {renderField("MGA Balance", "MGABalance", "number")}
              </div>

              <div className="admin-created-at">
                <strong>Created At:</strong>{" "}
                {user.createdAt?.toDate
                  ? user.createdAt.toDate().toString()
                  : "N/A"}
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-save"
                  onClick={handleUpdate}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-view-section">
              <h3 className="admin-card-title">{user.username || "User"}</h3>

              <div className="admin-info-grid">
                <p><strong>Full Name:</strong> {user.fullName || "-"}</p>
                <p><strong>Username:</strong> {user.username || "-"}</p>
                <p><strong>Phone Number:</strong> {user.phoneNumber || "-"}</p>
                <p><strong>Password:</strong> {user.password || "-"}</p>
                <p><strong>Referral Code:</strong> {user.referralCode || "-"}</p>
                <p>
                  <strong>Referral Link:</strong>{" "}
                  {user.referralLink ? (
                    <a
                      href={user.referralLink}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-link"
                    >
                      {user.referralLink}
                    </a>
                  ) : (
                    "-"
                  )}
                </p>
                <p><strong>Country:</strong> {user.country || "-"}</p>
                <p><strong>Language:</strong> {user.language || "-"}</p>
                <p><strong>Role:</strong> {user.role || "-"}</p>
                <p>
                  <strong>Deposited Amount on Join Day:</strong>{" "}
                  {Number(user.depositedAmountOnJoinDay || 0)}
                </p>
                <p><strong>Who Referred Who:</strong> {user.whoReferredWho || "-"}</p>
                <p><strong>Referred By:</strong> {user.referrer || "Unknown"}</p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {user.createdAt?.toDate
                    ? user.createdAt.toDate().toString()
                    : "N/A"}
                </p>
              </div>

              <h4 className="admin-subtitle">Balances</h4>
              <div className="admin-balance-grid">
                {renderBalanceBox("TZS", user.tshBalance)}
                {renderBalanceBox("USDT", user.usdtBalance)}
                {renderBalanceBox("KES", user.KESBalance)}
                {renderBalanceBox("UGX", user.UGXBalance)}
                {renderBalanceBox("RWF", user.RWFBalance)}
                {renderBalanceBox("BIF", user.BIFBalance)}
                {renderBalanceBox("ZMW", user.ZMWBalance)}
                {renderBalanceBox("MWK", user.MWKBalance)}
                {renderBalanceBox("MZN", user.MZNBalance)}
                {renderBalanceBox("USD", user.USDBalance)}
                {renderBalanceBox("SSP", user.SSPBalance)}
                {renderBalanceBox("BWP", user.BWPBalance)}
                {renderBalanceBox("MGA", user.MGABalance)}
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-edit"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-delete"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminUserManager;