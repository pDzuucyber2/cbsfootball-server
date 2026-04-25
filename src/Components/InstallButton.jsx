import React from "react";

const InstallButton = () => {
  return (
    <button
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        padding: "10px 15px",
        background: "green",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold"
      }}
    >
      Install App
    </button>
  );
};

export default InstallButton;