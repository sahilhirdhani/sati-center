import "../styles/Leaderboard.css";

export default function Leaderboard({ players, finishOrder, onBackToLobby, onLeave }) {

  return (
    <div className="leaderboardOverlay">

      <div className="leaderboardCard">

        <h2 className="leaderboardTitle">Game Over</h2>

        <div className="leaderboardList">

          {finishOrder.map((playerId, index) => {

            const player = players.find(p => p.id === playerId);
            const position = index + 1;

            return (
              <div
                key={playerId}
                className={`leaderboardRow ${position === 1 ? "winnerRow" : ""}`}
              >

                <div className="leaderboardPosition">
                  {position === 1 ? "👑" : position}
                </div>

                <div className="leaderboardName">
                  {player?.name}
                </div>

              </div>
            );
          })}

        </div>

        <div className="leaderboardButtons">

          <button className="primaryBtn" onClick={onBackToLobby}>
            Back to lobby
          </button>

          <button className="secondaryBtn" onClick={onLeave}>
            Leave Room
          </button>

        </div>

      </div>

    </div>
  );
}