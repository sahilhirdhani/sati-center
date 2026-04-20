import { dispatchAction } from "../actions/dispatchAction.js";
import { buildAction } from "../actions/gameAction.js";
import { pickBotMove } from "../bot/botAction.js";
import { remove } from "../state/gameState.js";
import { getLegalMoves } from "../validation/rules.js";

function canPlayerTakeTurn (state, player) {
    if(!player.isActive) return false;

    const legalMoves = getLegalMoves(
        player.hand,
        state.table,
        state.config.layoutMode,
        state.cheatsEnabled,
        state.config.skipMode
    );
    return legalMoves.length > 0;
}

function canBotPlay (state, player) {
    if(!player.isActive) return false
    const legalMoves = getLegalMoves(
        player.hand,
        state.table,
        state.config.layoutMode,
        state.cheatsEnabled,
        state.config.skipMode
    )
    if(legalMoves.length > 0){
        // Bots don't consume physical Skip Cards or use Rollback.
        // Instead, they only play standard cards. 
        // If they have no standard cards, they just use the free "Skip" string injected by rules.js.
        let botMoves = legalMoves.filter(m => m.card === "Skip" || (!m.card.isSkipCard && m.card !== "Rollback"));
        
        if (state.cheatsEnabled && state.config.skipMode === "infinite") {
            const hasStandardMoves = botMoves.some(m => m.card !== "Skip");
            if (hasStandardMoves) {
                botMoves = botMoves.filter(m => m.card !== "Skip");
            }
        }
        
        // If the bot only has skip tokens left, it should just throw them away.
        if (player.hand.every(c => c.isSkipCard)) {
            let physicalSkips = legalMoves.filter(m => m.card && m.card.isSkipCard);
            if (physicalSkips.length > 0) {
                botMoves = physicalSkips;
            } else {
                botMoves = [{ card: "Skip", pileKey: "Skip" }];
            }
        } else if (botMoves.length === 0) {
            botMoves = [{ card: "Skip", pileKey: "Skip" }];
        }

        const action = buildAction(player, pickBotMove(botMoves))
        dispatchAction(state, action)
        return true;
    }
    return false
}

export function getStartingPlayer (state) {
    for (let i=0; i<state.players.length; i++) {
        const player = state.players[i];
        if(canPlayerTakeTurn(state, player)) {
            if(player.id.startsWith('bot')){
                const legalMoves = getLegalMoves(
                    player.hand,
                    state.table,
                    state.config.layoutMode,
                    state.cheatsEnabled,
                    state.config.skipMode
                )
                
                let botMoves = legalMoves.filter(m => m.card === "Skip" || (!m.card.isSkipCard && m.card !== "Rollback"));
                
                if (state.cheatsEnabled && state.config.skipMode === "infinite") {
                    const hasStandardMoves = botMoves.some(m => m.card !== "Skip");
                    if (hasStandardMoves) {
                        botMoves = botMoves.filter(m => m.card !== "Skip");
                    }
                }
                
                // If a bot has ONLY skip cards left in hand, it should finish immediately or throw them away.
                // Or simply allow them to play the physical skip token if they have no standard moves, 
                // but since skip tokens don't remove standard cards, they'd still be stuck.
                // Actually, if hand ONLY contains skip tokens, they are effectively finished.
                if (player.hand.every(c => c.isSkipCard)) {
                    // Pretend they played their last standard card
                    // They effectively finished! But we must handle it properly without infinite loop.
                    // We can just let them "play" a skip card to discard it.
                    botMoves = legalMoves.filter(m => m.card.isSkipCard);
                }

                if (botMoves.length === 0) {
                    botMoves = [{ card: "Skip", pileKey: "Skip" }];
                }

                state.currentTurnIndex = i;
                const action = buildAction(player, pickBotMove(botMoves))
                dispatchAction(state, action)
                return player;
            }
            state.currentTurnIndex = i;
            return player;
        }
    }

    throw new Error("no valid starting player found");
}

export function advanceTurn(state) {
    const total = state.players.length;
    
    // Prevent infinite call stack looping by detecting consecutive skips
    let skipCount = 0;
    const activeCount = state.players.filter(p => p.isActive).length;
    
    if (activeCount === 0 || state.winner) return;

    if (state.isDeadlocked) {
        // Just advance the index once to the next active player and pause the auto-play loop.
        do {
            state.currentTurnIndex = (state.currentTurnIndex + 1) % total;
        } while (!state.players[state.currentTurnIndex].isActive);
        return;
    }

    while (true) {
        state.currentTurnIndex = (state.currentTurnIndex + 1) % total;

        const player = state.players[state.currentTurnIndex];
        if(player.isBot){
            if(!canBotPlay(state,player)) continue

            // A bot played a move. If it was a SKIP, increment counter.
            // Wait, we can't easily detect if it was a skip here because canBotPlay calls dispatchAction directly.
            // Let's use state.consecutiveSkips instead in dispatchAction!
            break
        }
        else if(canPlayerTakeTurn(state, player)) {
            return player;
        }
    }
}

export function getCurrentPlayer(state) {
    return state.players[state.currentTurnIndex];
}

export function rollback(state, playedMoves){
    const lastMove = playedMoves.pop()
    state.currentTurnIndex = lastMove.lastPlayer.slice(-1)-1

    const player = getCurrentPlayer(state)
    
    player.hand.push(lastMove.card)
    // ************************* using binary find the perfect position for inserting *************************
    
    if(lastMove.card === "skip"){
        return;
    }
    remove(state.table, lastMove.pileKey, lastMove.card)
}