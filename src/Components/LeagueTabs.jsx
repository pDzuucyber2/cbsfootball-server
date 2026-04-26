import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import "./LeagueTabs.css";

const failedLogos = new Set();

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cbsfootball-server.onrender.com";

export default function LeagueTabs() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);

  const getInitials = (name) => {
    if (!name) return "LG";

    return String(name)
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  const getServerLogo = (url) => {
    if (!url || failedLogos.has(url)) return "";
    return `${BASE_URL}/logo?url=${encodeURIComponent(url)}`;
  };

  const getWeservLogo = (url) => {
    if (!url) return "";
    if (url.includes("images.weserv.nl")) return url;

    return `https://images.weserv.nl/?url=${url.replace(
      /^https?:\/\//,
      ""
    )}&w=120&h=120&fit=contain`;
  };

  const LeagueLogo = ({ src, name }) => {
    const [logoSrc, setLogoSrc] = useState(() => getServerLogo(src));
    const [error, setError] = useState(false);

    useEffect(() => {
      setLogoSrc(getServerLogo(src));
      setError(false);
    }, [src]);

    if (!src || error || failedLogos.has(src)) {
      return (
        <div className="league-fallback">
          <div className="ball">⚽</div>
          <div className="initials">{getInitials(name)}</div>
        </div>
      );
    }

    return (
      <img
        src={logoSrc}
        alt={name || "league logo"}
        className="league-logo"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (logoSrc?.includes(BASE_URL)) {
            setLogoSrc(src);
            return;
          }

          if (logoSrc === src) {
            setLogoSrc(getWeservLogo(src));
            return;
          }

          failedLogos.add(src);
          setError(true);
        }}
      />
    );
  };

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "matches"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;

      const grouped = {};

      data.forEach((match) => {
        if (!match.date) return;

        const matchTime = new Date(
          String(match.date).replace(" ", "T") + "Z"
        ).getTime();

        if (matchTime - now <= fifteenMinutes) return;

        const leagueName = match.league || "Other";

        if (!grouped[leagueName]) {
          grouped[leagueName] = {
            name: leagueName,
            logo: match.logoA || "",
            count: 0,
          };
        }

        grouped[leagueName].count++;
      });

      setLeagues(Object.values(grouped));
    };

    load();
  }, []);

  return (
    <div className="league-tabs">
      {leagues.map((league, i) => (
        <div
          key={i}
          className="league-card"
          onClick={() => navigate(`/league/${encodeURIComponent(league.name)}`)}
        >
          <LeagueLogo src={league.logo} name={league.name} />

          <span className="league-name">{league.name}</span>

          <span className="league-count">{league.count}</span>
        </div>
      ))}
    </div>
  );
}