import React, { useEffect, useState, useRef } from "react";
import "./Banner.css";

export default function Banner() {

  const banners = [
   {
  title:"RECORD-BREAKING",
  number:"$ 251,455",
  text:"Aviator daily winnings are estimated to reach up to this amount every day."
},
    {
      title:"2UP NOW ON",
      number:"DOUBLE CHANCE",
      text:"First in the market. Only on ContraBetScore."
    },
    {
      title:"SUPER BONUS",
      number:"100% DEPOSIT",
      text:"Bet and win big with today's bonus."
    },

    // 🔥 NEW CONTENT
    {
      title:"🔥 HOT COMMISSIONS",
      number:"ALWAYS AVAILABLE",
      text:"Earn daily commissions from your team. Fast payouts guaranteed."
    },
    {
      title:"👥 REFERRAL BONUS",
      number:"UNLIMITED EARNING",
      text:"Invite friends and earn every day. Referral bonuses are always active."
    },
    {
      title:"🎰 CASINO GAMES",
      number:"94% WIN RATE",
      text:"Play top casino games with high chances of winning big."
    },
    {
      title:"🎮 ALL GAMES",
      number:"94% WIN CHANCE",
      text:"Enjoy exciting games with up to 94% winning probability."
    },
    {
      title:"🎁 DAILY PROMOTIONS",
      number:"BONUSES EVERYDAY",
      text:"Get rewarded with daily promotions and special offers."
    }
  ];

  const [index,setIndex] = useState(0);
  const touchStartX = useRef(0);

  // AUTO SLIDE
  useEffect(()=>{
    const interval = setInterval(()=>{
      setIndex((prev)=>(prev+1)%banners.length);
    },5000);

    return ()=>clearInterval(interval);
  },[]);

  // SWIPE HANDLING
  const handleTouchStart = (e)=>{
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e)=>{
    const endX = e.changedTouches[0].clientX;

    if(touchStartX.current - endX > 50){
      setIndex((prev)=>(prev+1)%banners.length);
    }

    if(endX - touchStartX.current > 50){
      setIndex((prev)=>(prev-1 + banners.length)%banners.length);
    }
  };

  const banner = banners[index];

  return(
    <div 
      className="banner"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      <div className="banner-content">

        <div className="banner-title">
          {banner.title}
        </div>

        <div className="banner-number">
          {banner.number}
        </div>

        <div className="banner-text">
          {banner.text}
        </div>

        <button className="banner-btn">
          READ MORE
        </button>

      </div>

      {/* DOTS */}
      <div className="banner-dots">
        {banners.map((_,i)=>(
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={()=>setIndex(i)}
          />
        ))}
      </div>

    </div>
  );
}