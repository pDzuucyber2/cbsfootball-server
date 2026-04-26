import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import "./AppDownload.css";

export default function AppDownload() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [installReady, setInstallReady] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setInstalled(isStandalone);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log("Install ready");
      setDeferredPrompt(e);
      setInstallReady(true);
    };

    const handleAppInstalled = () => {
      console.log("App installed");
      setInstalled(true);
      setDeferredPrompt(null);
      setInstallReady(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installed) {
      alert("App is already installed ✅");
      return;
    }

    if (!deferredPrompt) {
      alert(
        "Tap the Chrome menu ⋮ at the top right, then choose Install app or Add to Home screen."
      );
      return;
    }

    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("User accepted install");
      setInstalled(true);
    } else {
      console.log("User dismissed install");
    }

    setDeferredPrompt(null);
    setInstallReady(false);
  };

  const downloadAPK = () => {
    window.open("/app.apk", "_blank");
  };

  return (
    <div className="app-download">
      <button
        type="button"
        className="close-btn"
        onClick={() => window.history.back()}
      >
        ✕
      </button>

      <div className="hero">
        <div className="overlay"></div>

        <div className="hero-content">
          <div className="logo-loader">
            <img src="/logo192.png" alt="ContraBetScore logo" />
            <div className="ring"></div>
          </div>

          <h2>Experience it</h2>
          <p>anytime, anywhere</p>

          {installed && <div className="install-status">Installed ✅</div>}

          {!installed && installReady && (
            <div className="install-status ready">Ready to install</div>
          )}
        </div>
      </div>

      <div className="buttons">
        <button
          type="button"
          className="btn ios"
          onClick={() => alert("Safari ➜ Share ➜ Add to Home Screen")}
        >
          🍎 IOS USING SAFARI
        </button>

        <button type="button" className="btn android" onClick={handleInstall}>
          <FaDownload /> {installed ? "INSTALLED ✅" : "INSTALL APP"}
        </button>

        <button type="button" className="btn apk" onClick={downloadAPK}>
          ⬇ ANDROID DOWNLOAD (APK)
        </button>
      </div>

      <button
        type="button"
        className="download-floating-install"
        onClick={handleInstall}
      >
        <FaDownload />
      </button>

      <div className="footer">
        <span>Apple Installation Tutorials</span>
        <span>Web PC</span>
      </div>
    </div>
  );
}