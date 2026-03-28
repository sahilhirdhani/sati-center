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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptReconnect();
        console.log("yoi")
        alert("yoi")
        // setTimeout(function() { alert("YOI!"); }, 500);
        // Swal.fire({
        //   title: 'Alert',
        //   // text: 'This will close in 3 seconds.',
        //   timer: 10, // 3000 milliseconds
        //   // timerProgressBar: true,
        //   showConfirmButton: false // Hides the "OK" button
        // });
        // console.log("yoi in console")
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