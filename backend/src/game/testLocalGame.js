import readlineSync from "readline-sync";
import Player from "./player.js";
import { runGame } from "./game.js";


const humanPlayers = [new Player("P_id_1","Player 1"),
    new Player("P_id_2","Player 2"),
    new Player("P_id_3","Player 3"),
    // new Player("P_id_4","Player 4"),
    // new Player("P_id_5","Player 5"),
    // new Player("P_id_6","Player 6"),
];

// Ask for number of human players (1-9)
// const numHumans = Math.min(
//   Math.max(parseInt(readlineSync.question("Number of human players (1-9)? ")), 1),
//   9
// );

// for (let i = 1; i <= numHumans; i++) {
//   const name = readlineSync.question(`Enter name for Player ${i}: `);
//   humanPlayers.push(new Player(`p${i}`, name));
// }

runGame(humanPlayers, "single", true)