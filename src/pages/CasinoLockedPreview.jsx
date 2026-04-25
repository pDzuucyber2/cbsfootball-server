import { useParams, useNavigate } from "react-router-dom";
import "./CasinoLockedPreview.css";

export default function CasinoLockedPreview() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="casino-preview-page">
      <div className="casino-preview-card">

        {/* CLOSE BUTTON */}
        <button
          className="casino-close-btn"
          onClick={() => navigate(-1)}
        >
          ✖
        </button>

        <img
          src={`/casinos${id}.png`}
          alt={`Casino ${id}`}
          className="casino-preview-image"
        />

        <div className="casino-preview-status">
          Waiting connected on server
        </div>

        <div className="casino-preview-start">
          Free casino start now
        </div>

        <div className="casino-preview-message">
          You have not met the requirements to choose this casino game.
          This casino is free only for users who invited 85 to 100 members.
          Please refer more friends. You cannot become a winner of millions yet.
        </div>

      </div>
    </div>
  );
}