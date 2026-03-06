import PlayerList from "../components/playerList";
import Table from "../components/Table";
import Hand from "../components/Hand";
import { useGameStore } from "../store/useGameStore";
import { useEffect } from "react";
import { dealCards } from "../utils/dealCard";
import "../styles/Game.css";

export default function Game() {
  const { state, leaveGame } = useGameStore();

  useEffect(() => {
    if (state?.you?.hand?.length) {
      dealCards(state.you.hand);
    }
  }, [state?.you?.hand]);

  if (!state) {
    return <div>Loading...</div>;
  }

  console.log(state.table)

  return (
    <div className="gameRoot">

      <div className="gameHeader">
        <h1 className="gameTitle">Satti Center</h1>
        <div className="gameVersion">v0.001 build</div>
      </div>

      <div className="gameBoard">

        <div className="playersArea">
          <PlayerList
            players={state.players}
            currentTurn={state.currentTurnPlayerId}
          />
        </div>

        <div className="tableArea">
          <Table table={state.table} />
        </div>

        <div className="handArea">
          <Hand hand={state.you.hand} legalMoves={state.legalMoves} />
        </div>

      </div>

      <div className="gameFooter">
        <button className="secondaryBtn" onClick={leaveGame}>
          Leave Game
        </button>
      </div>

    </div>
  );
}