import { useGameStore } from "./store/useGameStore";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import GamePrep from "./pages/GamePrep";
import Reconnecting from "./pages/Reconnecting";
import { useEffect } from "react";
import Swal from 'sweetalert2';


export default function App() {
  const screen = useGameStore(state => state.screen);
  if (screen === "reconnecting") return <Reconnecting />;
  if (screen === "landing") return <Landing />;
  if (screen === "lobby") return <Lobby />;
  if (screen === "gameprep") return <GamePrep />;
  if (screen === "game") return <Game />;

  return null;
}