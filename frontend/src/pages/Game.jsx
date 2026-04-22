import { useEffect, useState } from "react";
import PlayerList from "../components/PlayerList";
import Chatbox from "../components/Chatbox";
import Table from "../components/Table";
import Hand from "../components/Hand";
import Leaderboard from "../components/Leaderboard";
import { useGameStore } from "../store/useGameStore";
import { dealCards } from "../utils/dealCard";
import "../styles/Game.css";

export default function Game() {
  const { state, onBackToLobby, leaveGame, sendAction, playerId } = useGameStore();
  const chatMessages = useGameStore((gameState) => gameState.chatMessages);
  const [globalChatPopup, setGlobalChatPopup] = useState(null);

  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0) {
      return;
    }

    const latestMessage = chatMessages[chatMessages.length - 1];

    if (latestMessage.playerId === playerId) {
      return;
    }

    setGlobalChatPopup({
      id: latestMessage.id,
      text: `${latestMessage.playerName}: ${latestMessage.text}`,
    });

    const timerId = window.setTimeout(() => {
      setGlobalChatPopup(null);
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [chatMessages, playerId]);

  useEffect(() => {
    if (state?.you?.hand?.length) {
      dealCards(state.you.hand);
    }
  }, [state?.you?.hand]);

  if (!state) {
    return (
      <div className="gameRoot">
        <div className="gameBackdrop" aria-hidden="true">
          <span className="backdropOrb backdropOrbA" />
          <span className="backdropOrb backdropOrbB" />
          <span className="backdropGrid" />
        </div>
        <div className="gameLoadingScreen">
          <div className="gameLoadingCard">
            <span className="loadingPip" />
            <span className="loadingPip" />
            <span className="loadingPip" />
            <p>Loading the table...</p>
          </div>
        </div>
      </div>
    );
  }

  const finishedPlayers = state.finishedPlayers || [];
  const finishOrder = finishedPlayers.map((player) => player.id);

  if (finishOrder.length === state.players.length) {
    return (
      <Leaderboard
        players={state.players}
        finishOrder={finishOrder}
        onBackToLobby={onBackToLobby}
        onLeave={leaveGame}
      />
    );
  }

  const isPlayerTurn = state.currentTurnPlayerId === state.you.id;
  const currentTurnPlayer = state.players.find((player) => player.id === state.currentTurnPlayerId);
  const legalPlayCount = state.legalMoves.filter(
    (move) => move.card !== "Skip" && move.card !== "Rollback" && (!move.card || !move.card.isSkipCard)
  ).length;
  const canSkip = state.legalMoves.some((move) => move.card === "Skip");
  const showPassButton = isPlayerTurn && legalPlayCount === 0 && canSkip;

  return (
    <div className="gameRoot">
      <div className="gameBackdrop" aria-hidden="true">
        <span className="backdropOrb backdropOrbA" />
        <span className="backdropOrb backdropOrbB" />
        <span className="backdropGrid" />
      </div>

      {globalChatPopup && (
        <div key={globalChatPopup.id} className="globalChatPopup">
          {globalChatPopup.text}
        </div>
      )}

      <header className="gameHeader">
        <div className="gameBrand">
          <p className="gameEyebrow">Premium table</p>
          <h1 className="gameTitle">Satti Center</h1>
          <p className="gameSubtitle">Read the lanes, keep your timing sharp, and close the hand.</p>
        </div>

        <div className="gameMeta">
          <div className="metaChip">
            <span className="metaLabel">Turn</span>
            <strong className="metaValue">{currentTurnPlayer?.name || "Waiting"}</strong>
          </div>
          <div className={`metaChip ${isPlayerTurn ? "metaChipAccent" : ""}`}>
            <span className="metaLabel">Status</span>
            <strong className="metaValue">{isPlayerTurn ? "Your move" : "Watching"}</strong>
          </div>
          <div className="metaChip">
            <span className="metaLabel">Hand</span>
            <strong className="metaValue">{state.you.hand.length} cards</strong>
          </div>
        </div>
      </header>

      <main className="gameLayout">
        <aside className="gameSidebar">
          <section className="panelCard">
            <div className="panelHeader">
              <div>
                <p className="panelKicker">Table intel</p>
                <h2 className="panelTitle">Players</h2>
              </div>
              <span className="panelBadge">{state.players.length} seats</span>
            </div>

            <PlayerList
              players={state.players}
              currentTurn={state.currentTurnPlayerId}
              finishOrder={finishOrder}
            />
          </section>

          <section className="panelCard chatPanel">
            <div className="panelHeader">
              <div>
                <p className="panelKicker">Live chat</p>
                <h2 className="panelTitle">Channel</h2>
              </div>
              <span className="panelBadge">Popups on</span>
            </div>

            <Chatbox />
          </section>
        </aside>

        <section className="gameMain">
          <section className="stageCard">
            <div className="stageHeader">
              <div>
                <p className="panelKicker">Battlefield</p>
                <h2 className="stageTitle">Table</h2>
                <p className="stageCopy">Match the lane, stack pressure, and make every card count.</p>
              </div>

              <div className="stageStats" aria-label="Table status">
                <div className="stageStat">
                  <span>Legal moves</span>
                  <strong>{state.legalMoves.length}</strong>
                </div>
                <div className="stageStat">
                  <span>Turn</span>
                  <strong>{currentTurnPlayer?.name || "Waiting"}</strong>
                </div>
              </div>
            </div>

            <div className="tableBlock">
              <div className="tableArea">
                <Table table={state.table} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
              </div>

              {showPassButton && (
                <div className="tableActions">
                  <button
                    className="primaryBtn skipTurnBtn"
                    onClick={() => sendAction({ type: "SKIP_TURN" })}
                  >
                    Pass (No Cards)
                  </button>
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="stageCard handCardFrame">
          <div className="stageHeader">
            <div>
              <p className="panelKicker">Your hand</p>
              <h2 className="stageTitle">Playable cards</h2>
              <p className="stageCopy">Select a card, then drop it into the correct lane or tap it again.</p>
            </div>

            <span className={`panelBadge ${isPlayerTurn ? "panelBadgeAccent" : ""}`}>
              {isPlayerTurn ? "Active" : "Locked"}
            </span>
          </div>

          <div className="handArea">
            <Hand hand={state.you.hand} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
          </div>
        </section>
      </main>

      <footer className="gameFooter">
        <button className="secondaryBtn leaveBtn" onClick={leaveGame}>
          Leave Game
        </button>
      </footer>
    </div>
  );
}