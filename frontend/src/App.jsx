import { useGameStore } from "./store/useGameStore";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Reconnecting from "./pages/Reconnecting";

export default function App() {
  const screen = useGameStore(state => state.screen);
  const { attemptReconnect } = useGameStore();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      attemptReconnect;
      console.log("hello")
    }
  });
  
  if (screen === "reconnecting") return <Reconnecting />;
  if (screen === "landing") return <Landing />;
  if (screen === "lobby") return <Lobby />;
  if (screen === "game") return <Game />;

  return null;
}