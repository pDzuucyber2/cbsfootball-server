import { useNavigate } from "react-router-dom";
import "./Casino.css";

export default function Casino() {
  const navigate = useNavigate();

  const mainGames = [
    {
      name: "Lucky Spin",
      img: "/Lucky.png",
      route: "/casino/wheell"
    },
    {
      name: "Spin Pro",
      img: "/luckyspinpro.png",
      route: "/casino/lucky-spin"
    },
    {
      name: "Aviator",
      img: "/aviator.png",
      route: "/aviator"
    },
    {
      name: "Aviator Spin",
      img: "/aviatorspin.png",
      route: "/aviator-spin"
    },
    {
      name: "Red Fate 5",
      img: "/redfate5.png",
      route: "/casino/slots"
    },
    {
      name: "Mines",
      img: "/mines.png",
      route: "/casino/mines"
    },
    {
      name: "Crash Rocket",
      img: "/rocket.png",
      route: "/casino/crash-rocket"
    },
    {
      name: "Dice Roll",
      img: "/dice.png",
      route: "/casino/dice-roll"
    },
    {
      name: "Card Flip",
      img: "/cards.png",
      route: "/casino/card-flip"
    },

{
      name: "PlinkoGame",
      img: "/Plinko.png",
      route: "/plinko/game"
    }

  ];

  const lockedCasinos = Array.from({ length: 40 }, (_, i) => ({
    name: `Casino ${i + 1}`,
    img: `/casinos${i + 1}.png`,
    route: `/casino/free-preview/${i + 1}`
  }));

  const extraGames = [
    {
      name: "Mega/Wheel",
      img: "https://cdn-icons-png.flaticon.com/512/1040/1040230.png",
      route: "/casino/mega-wheel"
    },
    {
      name: "Golden Spin",
      img: "https://cdn-icons-png.flaticon.com/512/2331/2331966.png",
      route: "/casino/golden-spin"
    },
    {
      name: "Diamond Wheel",
      img: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
      route: "/casino/diamond-wheel"
    },
    {
      name: "Super Jackpot",
      img: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      route: "/casino/super-jackpot"
    }
  ];

  const allGames = [...mainGames, ...lockedCasinos, ...extraGames];

  const lockedNames = [
    "Mega/Wheel",
    "Golden Spin",
    "Diamond Wheel",
    "Super Jackpot"
  ];

  const handleClick = (game) => {
    if (lockedNames.includes(game.name)) {
      alert(
        "You have not met the requirements for this promotion.\n\n" +
        "This game is only available to qualified users.\n" +
        "Please complete the required conditions to unlock this feature."
      );
      return;
    }

    if (game.route) {
      navigate(game.route);
    }
  };

  return (
    <div className="casino-page">
      <h2>Casino Games</h2>

      <div className="casino-grid">
        {allGames.map((game, i) => (
          <div
            key={i}
            className="casino-card"
            onClick={() => handleClick(game)}
          >
            <img
              src={game.img}
              alt={game.name}
              className="casino-img"
            />

            <div className="casino-name">
              {game.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}