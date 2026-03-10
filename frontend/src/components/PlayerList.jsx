import "../styles/PlayerList.css";

export default function PlayerList({ players, currentTurn, finishOrder }) {
  const getPosition = (id) => {
    const index = finishOrder?.indexOf(id);
    return index === -1 || index === undefined ? null : index + 1;
  };

  return (
    <div className="playersSection playersBox" role="region" aria-label="Player list">
      <h3 className="sectionTitle">Players</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {players.map(p => {
          const isTurn = p.id === currentTurn;
          const position = getPosition(p.id);
          const positionDisplay = position === 1 ? "👑" : position ? position : "";

          return (
            <div
              key={p.id}
              className={`playerItem 
                        ${isTurn ? "currentTurn" : ""} 
                        ${p.disconnected ? "disconnected" : ""}`}
              role="listitem"
              aria-current={isTurn ? "true" : "false"}
              title={p.disconnected ? `${p.name} (Disconnected)` : p.name}
            >
              <div className="playerPosition" aria-label="Position">
                {positionDisplay}
              </div>
              <div className="playerName">
                {p.name} {p.disconnected && "(Disconnected)"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
