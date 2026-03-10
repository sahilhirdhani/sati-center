import "../styles/Leaderboard.css";

export default function Leaderboard({ players, finishOrder, onBackToLobby, onLeave }) {

  return (
    <div className="leaderboardOverlay">

      <div className="leaderboardCard">

        <h2 className="leaderboardTitle">Game Over</h2>

        <div className="leaderboardList" role="list">

          {finishOrder.map((playerId, index) => {

            const player = players.find(p => p.id === playerId);
            const position = index + 1;

            return (
              <div
                key={playerId}
                className={`leaderboardRow ${position === 1 ? "winnerRow" : ""}`}
                role="listitem"
              >

                <div className="leaderboardPosition" aria-label={`Position ${position}`}>
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

          <button 
            className="primaryBtn" 
            onClick={onBackToLobby}
            aria-label="Go back to the lobby"
          >
            Back to lobby
          </button>

          <button 
            className="secondaryBtn" 
            onClick={onLeave}
            aria-label="Leave the game room"
          >
            Leave Room
          </button>

        </div>

      </div>

    </div>
  );
}
