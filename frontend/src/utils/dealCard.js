// dealCards.js
export function dealCards(handCards) {
  handCards.forEach((card, index) => {
    const el = document.getElementById(`card-${card.id}`);
    if (!el) return;

    // Set position variables for animation
    const spacing = 90; // horizontal spread
    const offsetX = (index - Math.floor(handCards.length / 2)) * spacing;
    el.style.setProperty('--x', `${offsetX}px`);
    el.style.setProperty('--y', `0px`);

    // Trigger deal animation
    el.classList.add('dealCard');

    // Optional: remove class after animation to allow re-deal
    setTimeout(() => el.classList.remove('dealCard'), 700);
  });
}