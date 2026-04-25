import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SportsTabs from "../Components/SportsTabs";
import Banner from "../Components/Banner";
import LeagueTabs from "../Components/LeagueTabs";
import MatchList from "../Components/MatchList";
import SpecialGames from "../Components/SpecialGames";
import AboutContraBetScore from "../Components/AboutContraBetScore";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const logout = () => {
      localStorage.clear();
      navigate("/login");
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, 30 * 60 * 1000);
    };

    resetTimer();

    window.addEventListener("click", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <SportsTabs />
      <Banner />
      <LeagueTabs />
      <MatchList />
      <SpecialGames />

      {/* ABOUT CONTRABETSCORE */}
      <AboutContraBetScore />
    </div>
  );
};

export default Dashboard;