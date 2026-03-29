import { useGameStore } from "./store/useGameStore";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Reconnecting from "./pages/Reconnecting";
import { useEffect } from "react";
import Swal from 'sweetalert2';


export default function App() {
  const screen = useGameStore(state => state.screen);
  const { attemptReconnect } = useGameStore();

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       attemptReconnect();
  //     }
  //   };

  //   const handleFocus = () => {
  //     attemptReconnect();
  //   };

  //   const handlePageShow = (event) => {
  //     if (event.persisted) {
  //       attemptReconnect();
  //     }
  //   };
    
  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   window.addEventListener("focus", handleFocus);
  //   window.addEventListener("pageshow", handlePageShow);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //     window.removeEventListener("focus", handleFocus);
  //     window.removeEventListener("pageshow", handlePageShow);
  //   };
  // }, [attemptReconnect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptReconnect();
        alert("Welcome Back")
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