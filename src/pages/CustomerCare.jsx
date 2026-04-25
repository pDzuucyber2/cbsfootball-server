import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerCare.css";

export default function Support(){

  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "84dd6bf4-cbfa-4dc7-95dd-fc575e0d56ce";

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    window.$crisp.push(["set", "user:nickname", username]);

    const chatClosed = localStorage.getItem("chatClosed");

    // Ficha chat mwanzo
    window.$crisp.push(["do", "chat:hide"]);

    if (chatClosed === "true") {
      setLoading(false);
      return;
    }

    // Loading → open chat
    const timer = setTimeout(() => {
      setLoading(false);
      window.$crisp.push(["do", "chat:show"]);
      window.$crisp.push(["do", "chat:open"]);
    }, 3000);

    // User akifunga chat
    window.$crisp.push([
      "on",
      "chat:closed",
      function () {
        localStorage.setItem("chatClosed", "true");
        window.$crisp.push(["do", "chat:hide"]);
      }
    ]);

    return () => clearTimeout(timer);

  }, [username]);

  return (
    <div className="support-container">

      {/* BACK BUTTON */}
      <button
        className="support-back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {loading ? (
        <div className="loader-box">

          {/* Picha yako haijaondolewa */}
          <img 
            src="/logo192.png" 
            alt="logo" 
            className="logo-spin" 
          />

          <p className="loading-text">
            Chat with our customer care...
          </p>

        </div>
      ) : (
        <div className="connected-box">

          <h2>Connecting to support...</h2>

          <button
            className="reset-btn"
            onClick={() => {
              localStorage.removeItem("chatClosed");
              window.location.reload();
            }}
          >
            Start Chat
          </button>

        </div>
      )}

    </div>
  );
}