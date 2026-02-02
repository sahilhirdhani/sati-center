import express from 'express';
import cors from 'cors';
import { registerApi } from './api/index.js';


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Sati center backend running wild n free!!!');
});

registerApi(app);


export default app;





// import { createGameConfig } from './game/config.js';
// import { gameState } from './game/gameState.js';
// import { finishPlayer } from './game/gameAction.js';

// const players = [
//     { id: 'p1', name: 'Alice' },
//     { id: 'p2', name: 'Bob' },
//     { id: 'p3', name: 'Charlie' },
//     { id: 'p4', name: 'Diana' },
//     { id: 'p5', name: 'Eve' }
// ];

// const config = createGameConfig({ playerCount: players.length });
// const state = gameState(players, config);

// finishPlayer(state, 'p2');
// finishPlayer(state, 'p4');
// finishPlayer(state, 'p1');
// finishPlayer(state, 'p3');
// finishPlayer(state, 'p5');

// console.log('Winner:', state.winner);
// console.log('Leaderboard:', state.finishedPlayers);


// console.log(createGameConfig({playerCount: 4}))

// console.log(
//     createGameConfig({
//         playerCount: 7,
//         layoutMode: "double_sets"
//     })
// );