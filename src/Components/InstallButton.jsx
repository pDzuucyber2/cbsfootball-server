import React, { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      alert("App already installed ✅");
      return;
    }

    if (!deferredPrompt) {
      alert("Tap ⋮ Chrome menu ➜ Install app");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <div
      onClick={handleInstallClick}
      style={{
        position: "fixed",
        bottom: "80px",
        right: "12px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(180deg, #0b3d1b, #08d3da, #00c853, #f88705)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
        cursor: "pointer",
        zIndex: 999999,
      }}
    >
      {/* 🔥 LOGO CENTER */}
      <img
        src="/logo192.png"
        alt="logo"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />

      {/* 🔥 ROTATING TEXT RING */}
      <div
        style={{
          position: "absolute",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          animation: "spin 8s linear infinite",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <path
              id="circlePath"
              d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
            />
          </defs>

          <text fill="white" fontSize="8" fontWeight="bold">
            <textPath href="#circlePath">
              INSTALL APP • INSTALL APP •
            </textPath>
          </text>
        </svg>
      </div>

      {/* 🔥 ANIMATION */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}