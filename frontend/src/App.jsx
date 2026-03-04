import { useGameStore } from "./store/useGameStore";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

export default function App() {
  const screen = useGameStore(state => state.screen);

  if (screen === "landing") return <Landing />;
  if (screen === "lobby") return <Lobby />;
  if (screen === "game") return <Game />;

  return null;
}