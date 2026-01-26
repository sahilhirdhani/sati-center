export function dealCards(deck, players) {
    let index = 0

    while( deck.length ) {
        players[index%players.length].hand.push(deck.pop())
        index++
    }
}