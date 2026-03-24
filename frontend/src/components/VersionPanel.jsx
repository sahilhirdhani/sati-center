import { useEffect, useRef, useState } from "react";
import "../styles/VersionPanel.css";

const versionHistory = [
  { version: "v0.001", text: "Initial project setup and socket connection." },
  { version: "v0.002", text: "Landing page UI and room creation system added." },
  { version: "v0.003", text: "Join room flow implemented with game code input." },
  { version: "v0.004", text: "Panels added: How to Play and Game Info." }
];

export default function VersionPanel() {

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const autoScroll = useRef(true);

  const [index, setIndex] = useState(0);
  const [stepSize, setStepSize] = useState(0);

  useEffect(() => {

    if (itemRefs.current[0]) {

      const item = itemRefs.current[0];

      const style = window.getComputedStyle(item);

      const margin =
        parseFloat(style.marginTop) +
        parseFloat(style.marginBottom);

      const height = item.offsetHeight + margin -1;

      setStepSize(height);

    }

  }, []);

  useEffect(() => {

    if (!stepSize) return;

    const el = containerRef.current;

    const interval = setInterval(() => {

      if (!autoScroll.current) return;

      const nextIndex = (index + 1) % versionHistory.length;

      el.scrollTo({
        top: nextIndex * stepSize,
        behavior: "smooth"
      });

      setIndex(nextIndex);

    }, 3500);

    return () => clearInterval(interval);

  }, [index, stepSize]);

  return (
    <div className="versionPanel">

      <h3 className="panelTitle">Version History</h3>

      <div
        ref={containerRef}
        className="versionList"
        onMouseEnter={() => (autoScroll.current = false)}
        onMouseLeave={() => (autoScroll.current = true)}
      >

        {versionHistory.map((v, i) => (
          <div
            key={i}
            className={`versionItem ${i === index ? "active" : ""}`}
            ref={(el) => (itemRefs.current[i] = el)}
          >
            <span className="versionTag">{v.version}</span>
            <p>{v.text}</p>
          </div>
        ))}

      </div>

    </div>
  );
}