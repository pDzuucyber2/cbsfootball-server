import React from "react";
import "./News.css";

const newsData = [
  {
    id: 1,
    title: "Odds Calculation System Upgrade",
    description:
      "We have improved our odds engine to deliver more accurate, stable, and real-time betting odds across all sports markets. This ensures better fairness and faster updates for users.",
    type: "new",
    date: "2026",
  },
  {
    id: 2,
    title: "Live Match Score Updates Enhanced",
    description:
      "Live match tracking has been optimized. Users will now receive faster score updates with reduced delay, improving live betting experience and accuracy.",
    type: "live",
    date: "2026",
  },
  {
    id: 3,
    title: "Weekly Commission Payout System",
    description:
      "All affiliate commissions from Level 1 to Level 3 are now calculated and paid out every week automatically. This ensures transparent and consistent earnings for all partners.",
    type: "hot",
    date: "2026",
  },
  {
    id: 4,
    title: "New User Reward Program Introduced",
    description:
      "New users will now receive welcome bonuses and daily rewards for active participation on the platform.",
    type: "new",
    date: "2026",
  },
  {
    id: 5,
    title: "Enhanced Security & Fraud Detection",
    description:
      "Our system now includes advanced fraud detection tools to protect accounts, prevent suspicious activity, and ensure a safe betting environment.",
    type: "hot",
    date: "2026",
  },
];

const News = () => {
  return (
    <div className="news-container">
      <h2 className="news-title">📰 Latest Platform Updates</h2>

      <p className="news-subtitle">
        Stay informed with the latest improvements, features, and system updates
        on ContraBetScoreFootball.
      </p>

      {newsData.map((item) => (
        <div key={item.id} className={`news-card ${item.type}`}>
          <div className="news-header">
            <h3>{item.title}</h3>
            <span className="news-tag">{item.type.toUpperCase()}</span>
          </div>

          <p>{item.description}</p>

          <div className="news-footer">
            <small>Published: {item.date}</small>
          </div>
        </div>
      ))}

      {/* EXTRA INFO SECTION */}
      <div className="news-extra">
        <h3>🚀 Why These Updates Matter</h3>
        <ul>
          <li>✔ Faster and more accurate live betting experience</li>
          <li>✔ Improved odds stability across all matches</li>
          <li>✔ Transparent weekly commission system</li>
          <li>✔ Stronger account security and fraud protection</li>
          <li>✔ Better user rewards and engagement system</li>
        </ul>
      </div>
    </div>
  );
};

export default News;