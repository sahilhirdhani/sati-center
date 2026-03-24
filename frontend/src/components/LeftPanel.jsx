import "../styles/LeftPanel.css";

export default function LeftPanel() {
  return (
    <div className="sidePanel">

      <div className="goldPanel">

        <h3>Game Rules</h3>

        <ul>
          <li>Match suit or rank</li>
          <li>Players take turns clockwise</li>
          <li>Block opponents strategically</li>
          <li>First player to empty hand wins</li>
          <li>2 – 4 players per table</li>
        </ul>

      </div>

    </div>
  );
}