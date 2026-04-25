import { useState, useEffect } from "react";
import "./CasinoWheell.css";
import useSound from "use-sound";

import { db } from "../firebase";
import { secondaryDb } from "../firebaseSecondary";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

import { useBalance } from "../context/BalanceContext";

export default function CasinoWheel() {
  const { setBalances } = useBalance();

  const wheel = [
    { type: "flag", code: "BF", multi: 2, img: "https://flagcdn.com/w80/bf.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "CI", multi: 2, img: "https://flagcdn.com/w80/ci.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "CM", multi: 2, img: "https://flagcdn.com/w80/cm.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "DZ", multi: 2, img: "https://flagcdn.com/w80/dz.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "GQ", multi: 2, img: "https://flagcdn.com/w80/gq.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "GA", multi: 2, img: "https://flagcdn.com/w80/ga.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "MZ", multi: 2, img: "https://flagcdn.com/w80/mz.png" },
    { type: "multi", multi: 2, label: "x2" },
    { type: "flag", code: "SD", multi: 2, img: "https://flagcdn.com/w80/sd.png" },
    { type: "multi", multi: 2, label: "x2" }
  ];

  const flags = [
    { code: "BF", img: "https://flagcdn.com/w80/bf.png" },
    { code: "CI", img: "https://flagcdn.com/w80/ci.png" },
    { code: "CM", img: "https://flagcdn.com/w80/cm.png" },
    { code: "DZ", img: "https://flagcdn.com/w80/dz.png" },
    { code: "GQ", img: "https://flagcdn.com/w80/gq.png" },
    { code: "GA", img: "https://flagcdn.com/w80/ga.png" },
    { code: "MZ", img: "https://flagcdn.com/w80/mz.png" },
    { code: "SD", img: "https://flagcdn.com/w80/sd.png" }
  ];

  const MIN_BETS = {
    TZS: 2500,
    USDT: 1,
    KES: 130,
    UGX: 3800,
    RWF: 1300,
    BIF: 2900,
    ZMW: 27,
    MWK: 1700,
    MZN: 64,
    USD: 1,
    SSP: 1300,
    BWP: 13.5,
    MGA: 4500
  };

  const BET_SHORTCUTS = {
    TZS: [2500, 5000, 8000, 10000, 20000],
    USDT: [1, 5, 10, 20, 25],
    KES: [130, 500, 1000, 2000, 5000],
    UGX: [3800, 10000, 20000, 50000, 100000],
    RWF: [1300, 3000, 5000, 10000, 20000],
    BIF: [2900, 5000, 10000, 20000, 50000],
    ZMW: [27, 50, 100, 200, 500],
    MWK: [1700, 3000, 5000, 10000, 20000],
    MZN: [64, 100, 200, 500, 1000],
    USD: [1, 5, 10, 20, 50],
    SSP: [1300, 3000, 5000, 10000, 20000],
    BWP: [13.5, 25, 50, 100, 200],
    MGA: [4500, 10000, 20000, 50000, 100000]
  };

  const [credit, setCredit] = useState(0);
  const [displayBalance, setDisplayBalance] = useState("Loading...");
  const [currency, setCurrency] = useState("TZS");

  const [bet, setBet] = useState(2500);
  const [manualBet, setManualBet] = useState(2500);
  const [selected, setSelected] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [message, setMessage] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [ticker, setTicker] = useState(null);

  const [playSpin] = useSound("/sounds/spin.mp3");
  const [playWin] = useSound("/sounds/win.mp3");
  const [playLose] = useSound("/sounds/lose.mp3");

  const currentMinBet = MIN_BETS[currency] || 0;
  const currentButtons = BET_SHORTCUTS[currency] || [currentMinBet];

  const maskName = (name) => {
    const first = name[0];
    const last = name[name.length - 1];
    const stars = "*".repeat(Math.max(name.length - 2, 1));
    return first + stars + last;
  };

  const formatMoney = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getCurrencyBalanceField = (curr) => {
    const map = {
      TZS: "tshBalance",
      USDT: "usdtBalance",
      KES: "KESBalance",
      UGX: "UGXBalance",
      RWF: "RWFBalance",
      BIF: "BIFBalance",
      ZMW: "ZMWBalance",
      MWK: "MWKBalance",
      MZN: "MZNBalance",
      USD: "USDBalance",
      SSP: "SSPBalance",
      BWP: "BWPBalance",
      MGA: "MGABalance"
    };

    return map[curr] || "tshBalance";
  };

  const getAllBalancesFromUser = (data) => ({
    TZS: Number(data.tshBalance || 0),
    USDT: Number(data.usdtBalance || 0),
    USD: Number(data.USDBalance || 0),
    KES: Number(data.KESBalance || 0),
    UGX: Number(data.UGXBalance || 0),
    RWF: Number(data.RWFBalance || 0),
    BIF: Number(data.BIFBalance || 0),
    ZMW: Number(data.ZMWBalance || 0),
    MWK: Number(data.MWKBalance || 0),
    MZN: Number(data.MZNBalance || 0),
    SSP: Number(data.SSPBalance || 0),
    BWP: Number(data.BWPBalance || 0),
    MGA: Number(data.MGABalance || 0)
  });

  const getMainBalance = (data) => {
    const allBalances = {
      TZS: Number(data.tshBalance || 0),
      USDT: Number(data.usdtBalance || 0),
      KES: Number(data.KESBalance || 0),
      UGX: Number(data.UGXBalance || 0),
      RWF: Number(data.RWFBalance || 0),
      BIF: Number(data.BIFBalance || 0),
      ZMW: Number(data.ZMWBalance || 0),
      MWK: Number(data.MWKBalance || 0),
      MZN: Number(data.MZNBalance || 0),
      USD: Number(data.USDBalance || 0),
      SSP: Number(data.SSPBalance || 0),
      BWP: Number(data.BWPBalance || 0),
      MGA: Number(data.MGABalance || 0)
    };

    const validBalances = Object.entries(allBalances).filter(
      ([, amount]) => amount > 0
    );

    if (validBalances.length === 0) {
      return "0.00 TZS";
    }

    const highest = validBalances.reduce((max, current) => {
      return current[1] > max[1] ? current : max;
    });

    return `${highest[1].toFixed(2)} ${highest[0]}`;
  };

  const validateBet = (amount) => {
    const finalBet = Number(amount || 0);

    if (!finalBet || finalBet <= 0) {
      return `Minimum bet is ${currentMinBet} ${currency}`;
    }

    if (finalBet < currentMinBet) {
      return `Minimum bet is ${currentMinBet} ${currency}`;
    }

    if (finalBet > credit) {
      return "Insufficient balance";
    }

    return "";
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;

    const q = query(collection(db, "users"), where("username", "==", username));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();

        const main = getMainBalance(data);
        const [value, curr] = main.split(" ");

        setCredit(Number(value));
        setCurrency(curr);
        setDisplayBalance(`${formatMoney(value)} ${curr}`);
        setBalances(getAllBalancesFromUser(data));

        const newMin = MIN_BETS[curr] || 0;
        const newButtons = BET_SHORTCUTS[curr] || [newMin];

        setBet(newButtons[0] || newMin);
        setManualBet(newButtons[0] || newMin);
      }
    });

    return () => unsubscribe();
  }, [setBalances]);

  const names = ["Alex", "John", "Victor", "Musa", "Ali", "James", "Samuel", "David"];
  const countryData = {
    Kenya: { min: 927.64, currency: "KES", flag: "https://flagcdn.com/w40/ke.png" },
    Uganda: { min: 25974.02, currency: "UGX", flag: "https://flagcdn.com/w40/ug.png" },
    Rwanda: { min: 10526.36, currency: "RWF", flag: "https://flagcdn.com/w40/rw.png" },
    Burundi: { min: 21276.6, currency: "BIF", flag: "https://flagcdn.com/w40/bi.png" },
    "DRC - Congo": { min: 7.24, currency: "CDF", flag: "https://flagcdn.com/w40/cd.png" },
    Zambia: { min: 135.84, currency: "ZMW", flag: "https://flagcdn.com/w40/zm.png" },
    Malawi: { min: 14468.8, currency: "MWK", flag: "https://flagcdn.com/w40/mw.png" },
    Mozambique: { min: 457.56, currency: "MZN", flag: "https://flagcdn.com/w40/mz.png" },
    Zimbabwe: { min: 7.24, currency: "USD", flag: "https://flagcdn.com/w40/zw.png" },
    "South Sudan": { min: 42553.2, currency: "SSP", flag: "https://flagcdn.com/w40/ss.png" },
    Botswana: { min: 94.36, currency: "BWP", flag: "https://flagcdn.com/w40/bw.png" },
    Madagascar: { min: 29198, currency: "MGA", flag: "https://flagcdn.com/w40/mg.png" }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const name = names[Math.floor(Math.random() * names.length)];
      const masked = maskName(name);
      const countries = Object.keys(countryData);
      const country = countries[Math.floor(Math.random() * countries.length)];
      const data = countryData[country];
      const min = data.min;
      const max = min * 3;
      const amount = Math.floor(Math.random() * (max - min) + min);

      setTicker({
        name: masked,
        amount,
        currency: data.currency,
        flag: data.flag
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const spin = async () => {
    if (spinning) return;

    if (!selected) {
      alert("Select a team Flag");
      return;
    }

    const finalBet = Number(manualBet || bet);
    const error = validateBet(finalBet);

    if (error) {
      alert(error);
      return;
    }

    setSpinning(true);
    setMessage("");
    playSpin();

    const deductedBalance = Number((credit - finalBet).toFixed(2));
    setCredit(deductedBalance);
    setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
    setBalances((prev) => ({
      ...prev,
      [currency]: deductedBalance
    }));

    const index = Math.floor(Math.random() * wheel.length);
    const slice = 360 / wheel.length;
    const deg = 360 * 6 + index * slice + slice / 2;
    setRotation((prev) => prev + deg);

    setTimeout(async () => {
      const result = wheel[index];
      let win = 0;
      let outcome = "lost";

      if (result.type === "flag" && result.code === selected) {
        win = finalBet * 2;
        outcome = "won";
      }

      const updatedBalance = Number((deductedBalance + win).toFixed(2));

      if (win > 0) {
        setCredit(updatedBalance);
        setDisplayBalance(`${formatMoney(updatedBalance)} ${currency}`);
        setMessage(`YOU WIN ${formatMoney(win)} ${currency}`);
        playWin();
      } else {
        setCredit(deductedBalance);
        setDisplayBalance(`${formatMoney(deductedBalance)} ${currency}`);
        setMessage("YOU LOST");
        playLose();
      }

      setBalances((prev) => ({
        ...prev,
        [currency]: updatedBalance
      }));

      try {
        const username = localStorage.getItem("username");
        if (username) {
          const q = query(collection(db, "users"), where("username", "==", username));
          const snapshot = await getDocs(q);

          const balanceField = getCurrencyBalanceField(currency);

          for (const docSnap of snapshot.docs) {
            const userRef = doc(db, "users", docSnap.id);
            await updateDoc(userRef, {
              [balanceField]: updatedBalance
            });
          }
        }
      } catch (err) {
        console.log("Error updating balance:", err);
      }

      try {
        await addDoc(collection(secondaryDb, "casinos"), {
          game: "casinoWheel",
          username: localStorage.getItem("username") || "guest",
          currency,
          selected,
          result: result.type === "flag" ? result.code : result.type,
          bet: finalBet,
          winAmount: win,
          outcome,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.log("Error saving to secondaryDb:", err);
      }

      setSpinning(false);
    }, 10000);
  };

  return (
    <div className="casino">
      <div className="top">
        <div>
          BONUS WIN
          <h2>{message.includes("WIN") ? message.replace("YOU WIN ", "") : `0.00 ${currency}`}</h2>
        </div>

        <div className="title">
          AFRICUP
        </div>

        <div>
          Balance
          <h2>{displayBalance}</h2>
        </div>
      </div>

      <div className="ticker">
        {ticker && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <img src={ticker.flag} width="20" alt="" />
            <span>
              {ticker.name} won {ticker.amount} {ticker.currency}
            </span>
          </div>
        )}
      </div>

      <div className="wheel-container">
        <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          {wheel.map((item, i) => {
            const angle = (i / wheel.length) * 2 * Math.PI;
            const radius = item.type === "flag" ? 140 : 95;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={i}
                className="slice"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
              >
                {item.type === "flag" && <img src={item.img} alt={item.code} />}
                {item.type === "multi" && <span className="multi">{item.label}</span>}
              </div>
            );
          })}
        </div>

        <div className="center-player">
          <img src="/player.png" alt="player" />
          <div className="ball">
            <img src="/ball.png" alt="ball" />
          </div>
        </div>

        <div className="pointer" />
      </div>

      <div className="bet-buttons">
        {currentButtons.map((b) => (
          <button
            key={b}
            className={Number(manualBet) === Number(b) ? "active" : ""}
            onClick={() => {
              setBet(b);
              setManualBet(b);
            }}
          >
            {b} {currency}
          </button>
        ))}
      </div>

      <div className="manual-bet">
        <input
          type="number"
          min={currentMinBet}
          value={manualBet}
          onChange={(e) => setManualBet(Number(e.target.value))}
          placeholder={`Min ${currentMinBet} ${currency}`}
        />
      </div>

      <button className="spin-btn" onClick={spin} disabled={spinning}>
        {spinning ? "SPINNING..." : `SPIN ${formatMoney(manualBet)} ${currency}`}
      </button>

      <div className="grid">
        {flags.map((f, i) => (
          <div
            key={i}
            className={`card ${selected === f.code ? "selected" : ""}`}
            onClick={() => setSelected(f.code)}
          >
            <img src={f.img} alt={f.code} />
          </div>
        ))}
      </div>

      <div className="message">{message}</div>
    </div>
  );
}