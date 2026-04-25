import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Register.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterLoader = () => (
  <div className="register-loader-screen">
    <img src="/images/player.png" className="register-loader-bg" alt="loading" />
    <div className="register-loader-overlay"></div>

    <div className="register-loader-content">
      <div className="register-solar-system">
        <div className="register-orbit register-orbit-one">
          <span className="register-planet-ball">⚽</span>
        </div>

        <div className="register-orbit register-orbit-two">
          <span className="register-planet-ball small">⚽</span>
        </div>

        <div className="register-sun">
          <img src="/favicon.ico" alt="logo" />
        </div>
      </div>

      <p>Creating Account...</p>
    </div>
  </div>
);

const translations = {
  sw: {
    title: "Create an account",
    realName: "Real Name",
    username: "6-16 Characters+Numbers",
    email: "Gmail address",
    password: "Password",
    confirmPassword: "Confirm password",
    referralCode: "Invitation code",
    phoneNumber: "Your phone number",
    register: "SIGNUP",
    contactUs: "CONTACT US",
    verification: "Type the verification...",
    agree:
      "I have reached the age of 18 and I agree to trade regulations and Terms of Service",
  },
  en: {
    title: "Create an account",
    realName: "Real Name",
    username: "6-16 Characters+Numbers",
    email: "Gmail address",
    password: "Password",
    confirmPassword: "Confirm password",
    referralCode: "Invitation code",
    phoneNumber: "Your phone number",
    register: "SIGNUP",
    contactUs: "CONTACT US",
    verification: "Type the verification...",
    agree:
      "I have reached the age of 18 and I agree to trade regulations and Terms of Service",
  },
};



const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";





const prefixes = {
  Tanzania: "🇹🇿 +255",
  Kenya: "🇰🇪 +254",
  Uganda: "🇺🇬 +256",
  Burundi: "🇧🇮 +257",
  Rwanda: "🇷🇼 +250",
  DR_Congo: "🇨🇩 +243",
  Zambia: "🇿🇲 +260",
  Botswana: "🇧🇼 +267",
  Madagascar: "🇲🇬 +261",
  Malawi: "🇲🇼 +265",
  Mozambique: "🇲🇿 +258",
  SouthSudan: "🇸🇸 +211",
  Zimbabwe: "🇿🇼 +263",

  Nigeria: "🇳🇬 +234",
  Ghana: "🇬🇭 +233",
  SouthAfrica: "🇿🇦 +27",
  Namibia: "🇳🇦 +264",
  Ethiopia: "🇪🇹 +251",
  Somalia: "🇸🇴 +252",
  Sudan: "🇸🇩 +249",
  Egypt: "🇪🇬 +20",
  Morocco: "🇲🇦 +212",
  Algeria: "🇩🇿 +213",
  Tunisia: "🇹🇳 +216",
  Libya: "🇱🇾 +218",
  Senegal: "🇸🇳 +221",
  IvoryCoast: "🇨🇮 +225",
  Cameroon: "🇨🇲 +237",
  Congo: "🇨🇬 +242",
  SierraLeone: "🇸🇱 +232",
  Liberia: "🇱🇷 +231",
  Benin: "🇧🇯 +229",
  Togo: "🇹🇬 +228",
  BurkinaFaso: "🇧🇫 +226",
  Mali: "🇲🇱 +223",
  Niger: "🇳🇪 +227",
  Guinea: "🇬🇳 +224",
  Gambia: "🇬🇲 +220",

  UnitedKingdom: "🇬🇧 +44",
  Germany: "🇩🇪 +49",
  France: "🇫🇷 +33",
  Italy: "🇮🇹 +39",
  Spain: "🇪🇸 +34",
  Netherlands: "🇳🇱 +31",
  Belgium: "🇧🇪 +32",
  Switzerland: "🇨🇭 +41",
  Sweden: "🇸🇪 +46",
  Norway: "🇳🇴 +47",
  Denmark: "🇩🇰 +45",
  Finland: "🇫🇮 +358",
  Ireland: "🇮🇪 +353",
  Portugal: "🇵🇹 +351",
  Poland: "🇵🇱 +48",
  Austria: "🇦🇹 +43",
  Greece: "🇬🇷 +30",

  UnitedStates: "🇺🇸 +1",
  Canada: "🇨🇦 +1",
  Mexico: "🇲🇽 +52",
  Brazil: "🇧🇷 +55",
  Argentina: "🇦🇷 +54",
  Chile: "🇨🇱 +56",
  Colombia: "🇨🇴 +57",
  Peru: "🇵🇪 +51",
  Venezuela: "🇻🇪 +58",

  India: "🇮🇳 +91",
  Pakistan: "🇵🇰 +92",
  Bangladesh: "🇧🇩 +880",
  SriLanka: "🇱🇰 +94",
  Nepal: "🇳🇵 +977",
  China: "🇨🇳 +86",
  Japan: "🇯🇵 +81",
  SouthKorea: "🇰🇷 +82",
  Indonesia: "🇮🇩 +62",
  Malaysia: "🇲🇾 +60",
  Singapore: "🇸🇬 +65",
  Thailand: "🇹🇭 +66",
  Philippines: "🇵🇭 +63",
  Vietnam: "🇻🇳 +84",

  SaudiArabia: "🇸🇦 +966",
  UnitedArabEmirates: "🇦🇪 +971",
  Qatar: "🇶🇦 +974",
  Kuwait: "🇰🇼 +965",
  Oman: "🇴🇲 +968",
  Israel: "🇮🇱 +972",
  Turkey: "🇹🇷 +90",
  Iran: "🇮🇷 +98",
  Iraq: "🇮🇶 +964",

  Australia: "🇦🇺 +61",
  NewZealand: "🇳🇿 +64",
  Other: "🌍",
};

function makeCaptcha() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    referralInput: "",
    language: "en",
    verificationInput: "",
  });

  const [country, setCountry] = useState("Tanzania");
  const [prefix, setPrefix] = useState("+255");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [captcha, setCaptcha] = useState(makeCaptcha());

  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[form.language] || translations.en;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref && ref !== "undefined" && ref !== "null") {
      setForm((prev) => ({ ...prev, referralInput: ref }));
    }
  }, [location]);

  const handleCountryChange = (e) => {
    const selected = e.target.value;
    setCountry(selected);

    const codeOnly = (prefixes[selected] || "").replace(/[^\d+]/g, "");
    setPrefix(codeOnly);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned =
      ["username", "password", "confirmPassword"].includes(name)
        ? value.replace(/\s/g, "")
        : value;

    setForm((prev) => ({ ...prev, [name]: cleaned }));
  };

  const sanitizePhone = (p) => p.replace(/\D/g, "");
  const usernameHasNumber = (uname) => /\d/.test(uname);
  const usernameHasLetter = (uname) => /[A-Za-z]/.test(uname);





  const generateReferralCode = () =>
    `${Math.floor(1000000 + Math.random() * 9000000)}`;

  const stop = (msg) => {
    setIsLoading(false);
    alert(msg);
    return;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setSuccess("");

    const {
      fullName,
      username,
      email,
      password,
      confirmPassword,
      phoneNumber,
      referralInput,
      verificationInput,
    } = form;

    if (!fullName.trim()) return stop("Please enter your real name.");

    if (username.length < 6 || username.length > 16) {
      return stop("Username must be between 6 and 16 characters.");
    }

    if (!usernameHasLetter(username) || !usernameHasNumber(username)) {
      return stop("Username must contain letters and at least one number.");
    }

    if (password.length < 6 || password.length > 18) {
      return stop("Password must be between 6 and 18 characters.");
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return stop("Password must contain letters and numbers.");
    }

    if (password.toLowerCase() === username.toLowerCase()) {
      return stop("Password and username cannot be the same.");
    }

    if (password !== confirmPassword) {
      return stop("Passwords do not match.");
    }

    if (sanitizePhone(phoneNumber).length < 7) {
      return stop("Phone number is not valid.");
    }

    if (!verificationInput.trim()) {
      return stop("Please type the verification code.");
    }

    if (verificationInput.trim() !== captcha) {
      setCaptcha(makeCaptcha());
      setForm((prev) => ({ ...prev, verificationInput: "" }));
      return stop("Verification code is incorrect.");
    }

    try {
      const userSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", username))
      );

      if (!userSnap.empty) return stop("Username already exists.");

      let referralBy = "";

      if (
        referralInput.trim() !== "" &&
        referralInput.trim() !== "undefined" &&
        referralInput.trim() !== "null"
      ) {
        const refSnap = await getDocs(
          query(
            collection(db, "users"),
            where("referralCode", "==", referralInput)
          )
        );

        if (refSnap.empty) return stop("Invitation code is not valid.");

        refSnap.forEach((docSnap) => {
          referralBy = docSnap.data().username;
        });
      }

      const newReferralCode = generateReferralCode();
      const referralLink = `https://cbscontrabetscore.com/register?ref=${newReferralCode}`;

     const walletIndex = Math.floor(Date.now() % 1000000);
      let cryptoWallets = {};

      try {
      const res = await fetch(`${SERVER_URL}/wallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index: walletIndex }),
        });

        const data = await res.json();

        if (data.success) {
          cryptoWallets = data.wallets;
        }
      } catch (err) {
        console.log("Wallet generate error:", err);
      }

      await addDoc(collection(db, "users"), {
        fullName: fullName.trim(),
        username,
        email: email.trim() ? email.trim().toLowerCase() : "",
        password,
        phoneNumber: prefix + sanitizePhone(phoneNumber),
        country,
        language: form.language,

        walletIndex,
        cryptoWallets,
        trc20Address: cryptoWallets?.TRC20?.address || "",
        trxAddress: cryptoWallets?.TRON_TRX?.address || "",
        erc20Address: cryptoWallets?.ERC20?.address || "",
        bep20Address: cryptoWallets?.BNB_BEP20?.address || "",
        solanaAddress: cryptoWallets?.SOLANA?.address || "",
        bitcoinAddress: cryptoWallets?.BITCOIN?.address || "",

        referralCode: newReferralCode,
        referralLink,
        whoReferredWho:
          referralInput && referralInput !== "undefined" ? referralInput : "",
        referralBy,
        role: "user",
        createdAt: new Date(),
        isBlocked: false,
        blockExpiresAt: null,
        depositedAmountOnJoinDay: 0,
        tshBalance: 0,
        usdtBalance: 0,
        KESBalance: 0,
        UGXBalance: 0,
        RWFBalance: 0,
        BIFBalance: 0,
        ZMWBalance: 0,
        MWKBalance: 0,
        MZNBalance: 0,
        USDBalance: 0,
        SSPBalance: 0,
        BWPBalance: 0,
        MGABalance: 0,
      });

      localStorage.setItem("username", username);
      setSuccess("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      {isLoading && <RegisterLoader />}

      <div className="register-bg" />
      <div className="register-overlay" />

      <div className="register-container">
        <div className="register-top">
          <button
            type="button"
            className="return-btn"
            onClick={() => navigate(-1)}
          >
            ← Login
          </button>

          <button
            type="button"
            className="close-btn"
            onClick={() => navigate("/")}
          >
            ✕
          </button>
        </div>

        <div className="language-top">
          <select name="language" value={form.language} onChange={handleChange}>
            <option value="sw">🇹🇿 SW</option>
            <option value="en">🇺🇸 EN</option>

            <option value="ke">🇰🇪 KE</option>
            <option value="ug">🇺🇬 UG</option>
            <option value="rw">🇷🇼 RW</option>
            <option value="bi">🇧🇮 BI</option>
            <option value="zm">🇿🇲 ZM</option>
            <option value="mw">🇲🇼 MW</option>

            <option value="gb">🇬🇧 UK</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="de">🇩🇪 DE</option>
            <option value="it">🇮🇹 IT</option>
            <option value="es">🇪🇸 ES</option>
            <option value="in">🇮🇳 IN</option>
          </select>
        </div>

        <h2 className="register-title">{t.title}</h2>

        <form className="register-form" onSubmit={handleRegister}>
          <label className="register-label">Real Name</label>
          <input
            className="register-input"
            name="fullName"
            placeholder={t.realName}
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <label className="register-label">Username</label>
          <input
            className="register-input"
            name="username"
            placeholder={t.username}
            value={form.username}
            onChange={handleChange}
            required
          />

          <label className="register-label">Gmail</label>
          <input
            className="register-input"
            name="email"
            placeholder={t.email}
            value={form.email}
            onChange={handleChange}
          />

          <div className="password-wrap">
            <input
              className="register-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t.password}
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="password-wrap">
            <input
              className="register-input"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t.confirmPassword}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label className="register-label invite-label">
            {t.referralCode}
          </label>
          <input
            className="register-input"
            name="referralInput"
            placeholder={t.referralCode}
            value={form.referralInput === "undefined" ? "" : form.referralInput}
            onChange={handleChange}
          />

          <label className="register-label">Mobile Phone Number</label>
          <div className="phone-row">
            <select
              className="prefix-select"
              value={country}
              onChange={handleCountryChange}
            >
              {Object.keys(prefixes).map((c) => (
                <option key={c} value={c}>
                  {prefixes[c]} {c}
                </option>
              ))}
            </select>

            <input
              className="register-input phone-input"
              name="phoneNumber"
              placeholder={t.phoneNumber}
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="captcha-row">
            <input
              className="register-input captcha-input"
              name="verificationInput"
              placeholder={t.verification}
              value={form.verificationInput}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="captcha-box"
              onClick={() => setCaptcha(makeCaptcha())}
              title="Refresh code"
            >
              {captcha}
            </button>
          </div>

          <label className="agree-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I have reached the age of 18 and I agree to trade regulations and{" "}
              <Link to="/about-contra-bet-score">Terms of Service</Link>
            </span>
          </label>

          <button className="signup-btn" disabled={isLoading}>
            {isLoading ? "Processing..." : t.register}
          </button>
        </form>

        {success && <p className="success">{success}</p>}

        <div className="contact-us">
          <Link to="/customer-cares">{t.contactUs}</Link>
        </div>
      </div>
    </div>
  );
}