import { useGameStore } from "./store/useGameStore";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Reconnecting from "./pages/Reconnecting";
import { useEffect } from "react";

export default function App() {
  const screen = useGameStore(state => state.screen);
  const { attemptReconnect } = useGameStore();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptReconnect();
        alert("yoi")
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptReconnect]);
  
  if (screen === "reconnecting") return <Reconnecting />;
  if (screen === "landing") return <Landing />;
  if (screen === "lobby") return <Lobby />;
  if (screen === "game") return <Game />;

  return null;
}