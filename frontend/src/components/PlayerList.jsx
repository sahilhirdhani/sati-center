import "../styles/PlayerList.css";

export default function PlayerList({ players, currentTurn, finishOrder }) {
  const getPosition = (id) => {
    const index = finishOrder?.indexOf(id);
    return index === -1 || index === undefined ? null : index + 1;
  };
  return (
    <div className="playersSection playersBox">
      <h3 className="sectionTitle">Players</h3>
      {players.map(p => {
        const isTurn = p.id === currentTurn;
        const position = getPosition(p.id);
        return (
          <div
            key={p.id}
            className={`playerItem 
                        ${isTurn ? "currentTurn" : ""} 
                        ${p.disconnected ? "disconnected" : ""}`}
          >
            <div className="playerPosition">
              {position === 1 ? "👑" : position ? position : ""}
            </div>
            <div className="playerName">
              {p.name} {p.disconnected && "(Disconnected)"}
            </div>
          </div>
        );
      })}

    </div>
  );
}