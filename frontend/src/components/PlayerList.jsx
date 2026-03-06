import "../styles/PlayerList.css";

export default function PlayerList({ players, currentTurn }) {
  return (
    <div className="playersSection playersBox">

      <h3 className="sectionTitle">Players</h3>

      {players.map(p => {
        const isTurn = p.id === currentTurn;

        return (
          <div
            key={p.id}
            className={`playerItem 
                        ${isTurn ? "currentTurn" : ""} 
                        ${p.disconnected ? "disconnected" : ""}`}
          >
            {p.name} {p.disconnected && "(Disconnected)"}
          </div>
        );
      })}

    </div>
  );
}