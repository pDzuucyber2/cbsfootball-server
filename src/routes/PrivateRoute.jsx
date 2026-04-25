import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {

  const isLoggedIn = localStorage.getItem("authenticated") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
}