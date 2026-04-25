import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EastafricaDeposit.css";

const Deposit = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const countries = [
    "Tanzania", // 👈 imeongezwa
    "Kenya",
    "Uganda",
    "Burundi",
    "Rwanda",
    "DRC - Congo",
    "Zambia",
    "Botswana",
    "Madagascar",
    "Malawi",
    "Mozambique",
    "South Sudan",
    "Zimbabwe",
  ];

  const countryFlags = {
     // 👈 imeongezwa
    Kenya: "🇰🇪",
    Tanzania: "🇹🇿",
    Uganda: "🇺🇬",
    Burundi: "🇧🇮",
    Rwanda: "🇷🇼",
    "DRC - Congo": "🇨🇩",
    Zambia: "🇿🇲",
    Botswana: "🇧🇼",
    Madagascar: "🇲🇬",
    Malawi: "🇲🇼",
    Mozambique: "🇲🇿",
    "South Sudan": "🇸🇸",
    Zimbabwe: "🇿🇼",
  };

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="deposit-container">
      
      <div className="switch-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </div>

      <h3>Select Country</h3>

      <input
        type="text"
        placeholder="Search country..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredCountries.map((country, i) => (
        <div
          key={i}
          className="country-card"
          onClick={() => {
            if (country === "Tanzania") {
              navigate("/tanzania-deposit"); // 👈 special route
            } else {
              navigate("/all-others-country", {
                state: { countryName: country, flag: countryFlags[country] },
              });
            }
          }}
        >
          <span className="flag">{countryFlags[country]}</span> {country}
        </div>
      ))}
    </div>
  );
};

export default Deposit;