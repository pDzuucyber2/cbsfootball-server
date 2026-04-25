import React from "react";
import "./InviteLink.css";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

// 🔥 ICONS
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaQrcode,
  FaShareAlt,
  FaFacebook,
  FaInstagram
} from "react-icons/fa";

import { MdContacts } from "react-icons/md";

export default function InviteLink() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const referralCode = user?.referralCode || "no-code";
  const referralLink =
    user?.referralLink ||
    `https://cbscontrabetscore.com/register?ref=${referralCode}`;

  // 🔥 UNIVERSAL COPY FUNCTION
  const handleCopy = async (text, label = "Copied") => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback (old devices)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      alert(`${label} ✅`);
    } catch (err) {
      console.error(err);
      alert("Failed to copy ❌");
    }
  };

  return (
    <div className="invite-container">

      {/* BACK */}
      <div className="top-bar">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h2 className="title">Invite Friends 🎉</h2>

      {/* QR */}
      <div className="qr-box">
        <QRCodeCanvas value={referralLink} size={180} />
      </div>

      {/* CODE */}
      <div className="card">
        <p>Your Code</p>
        <h3>{referralCode}</h3>
        <button onClick={() => handleCopy(referralCode, "Code copied")}>
          Copy Code
        </button>
      </div>

      {/* LINK */}
      <div className="card">
        <p>Your Link</p>
        <h4 className="link-text">{referralLink}</h4>
        <button onClick={() => handleCopy(referralLink, "Link copied")}>
          Copy Link
        </button>
      </div>

      {/* 🔥 SHARE */}
      <div className="share-icons">

        {/* CONTACT */}
        <div
          className="share-item"
          onClick={() =>
            window.open(`sms:?body=${encodeURIComponent(referralLink)}`)
          }
        >
          <div className="icon contact"><MdContacts /></div>
          <p>Contact</p>
        </div>

        {/* TELEGRAM */}
        <div
          className="share-item"
          onClick={() =>
            window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`)
          }
        >
          <div className="icon telegram"><FaTelegramPlane /></div>
          <p>Telegram</p>
        </div>

        {/* WHATSAPP */}
        <div
          className="share-item"
          onClick={() =>
            window.open(`https://wa.me/?text=${encodeURIComponent(referralLink)}`)
          }
        >
          <div className="icon whatsapp"><FaWhatsapp /></div>
          <p>WhatsApp</p>
        </div>

        {/* FACEBOOK */}
        <div
          className="share-item"
          onClick={() =>
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`)
          }
        >
          <div className="icon facebook"><FaFacebook /></div>
          <p>Facebook</p>
        </div>

        {/* INSTAGRAM */}
        <div
          className="share-item"
          onClick={() =>
            handleCopy(referralLink, "Paste on Instagram")
          }
        >
          <div className="icon instagram"><FaInstagram /></div>
          <p>Instagram</p>
        </div>

        {/* QR */}
        <div
          className="share-item"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="icon qr"><FaQrcode /></div>
          <p>QR Code</p>
        </div>

        {/* MORE */}
        <div
          className="share-item"
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: "Join me 🔥",
                  text: "Register kupitia link yangu 👇",
                  url: referralLink,
                });
              } else {
                handleCopy(referralLink, "Link copied");
                window.open(`https://wa.me/?text=${encodeURIComponent(referralLink)}`);
              }
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <div className="icon more"><FaShareAlt /></div>
          <p>More</p>
        </div>

      </div>

    </div>
  );
}