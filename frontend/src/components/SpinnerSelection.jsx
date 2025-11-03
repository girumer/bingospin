import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Removed useOutletContext as it wasn't used
import './spinnerselection.css';

import socket from "../socket";

const SpinnerSelection = () => {
  const [searchParams] = useSearchParams();
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  const username = searchParams.get("username");
  const telegramId = searchParams.get("telegramId");
  const stake = searchParams.get("stake");
  const navigate = useNavigate();

  // Spinner values - these will be the visible segments based on your image
  // Note: Your image shows 5 segments (20, 30, 40, 50, 50).
  // I'll use values that allow for a similar visual.
  const spinnerSegmentsData = [
    { value: 20, unit: "BIRR", color: "#f7b538" }, // Orange
    { value: 30, unit: "BIRR", color: "#f7b538" }, // Orange
    { value: 40, unit: "BIRR", color: "#f05a28" }, // Red-orange
    { value: 50, unit: "BIRR", color: "#22a7f0" }, // Blue
    { value: 50, unit: "BIRR", color: "#22a7f0" }, // Blue (Assuming two 50-BIRR blue sections from image)
  ];

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log("Telegram WebApp initialized");
    }

    if (username && telegramId && stake) {
      const clientId = `${telegramId}-spinner`;
      socket.emit("joinSpinnerRoom", {
        roomId: stake,
        username,
        telegramId,
        clientId,
      });
    }
  }, [username, telegramId, stake]);

  if (!username || !telegramId || !stake) {
    return <div>❌ Missing required info. Please return to the bot.</div>;
  }

  const handleSelect = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = () => {
    if (selectedNumbers.length === 0) {
      alert("Please select at least one number");
      return;
    }

    const clientId = `${telegramId}-spinner`;

    socket.emit("selectSpinnerNumbers", {
      roomId: stake,
      username,
      telegramId,
      clientId,
      selectedNumbers,
    });

    navigate(`/SpinnerAnimation?username=${username}&telegramId=${telegramId}&stake=${stake}`);
  };

  const numSegments = spinnerSegmentsData.length;
  const segmentAngle = 360 / numSegments; // Calculate angle for each segment

  return (
    <div className="spinner-selection-page"> {/* Changed class to avoid conflict */}
      <h2>Welcome, {username} 👋</h2>
      <p>Stake: {stake} ETB</p>

      <div className="spinner-container"> {/* Overall container for spinner and base */}
        <div className="spinner-pointer-top"></div> {/* Top pointer */}

        <div className="spinner-wheel-frame"> {/* Outer frame with studs */}
          {Array.from({ length: 24 }).map((_, i) => ( // Example for 24 studs
            <div
              key={i}
              className="stud"
              style={{
                transform: `rotate(${i * (360 / 24)}deg) translate(calc(100% - 15px))`, // Position studs along the edge
              }}
            ></div>
          ))}

          <div className="spinner-wheel"> {/* The actual rotating wheel */}
            {spinnerSegmentsData.map((segment, index) => {
              const rotateDeg = index * segmentAngle;
              return (
                <div
                  key={index}
                  className="spinner-segment-new" // New class for the pie slices
                  style={{
                    backgroundColor: segment.color,
                    transform: `rotate(${rotateDeg}deg) skewY(${90 - segmentAngle / 2}deg)`,
                    // We also need to set clip-path if we want perfect lines,
                    // but `transform: skewY` with `overflow: hidden` on parent
                    // and then `transform: skewY` back on content is the pure CSS way.
                    // For perfect radial lines, clip-path with calculated points is better
                    // but harder to make dynamic for N segments. We'll use border for demarcation.
                  }}
                >
                  <div
                    className="segment-text-content"
                    style={{
                      transform: `skewY(${-(90 - segmentAngle / 2)}deg) rotate(${segmentAngle / 2}deg) translateX(calc(50% + 20px))`, // Rotate text and push it out
                      // Adjust translate to position text radially inside the segment
                      left: '50%',
                      top: '50%',
                      transformOrigin: '0% 0%', // Pivot from the center
                    }}
                  >
                    <span className="segment-value">{segment.value}</span>
                    <span className="segment-unit">{segment.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="spinner-center-btn" onClick={() => alert("Spinning...")}>
            {/* You can add an icon or text here */}
          </button>
        </div>

        <div className="spinner-base"></div> {/* The base of the spinner */}
      </div>

      {/* Number selection board (keeping for context, hidden by default if not needed) */}
      <div className="number-selection-board" style={{display: 'none'}}> 
        <h3>Select Your Numbers (1-100)</h3>
        <div className="numbers-grid">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`number-btn ${selectedNumbers.includes(num) ? 'selected' : ''}`}
              onClick={() => handleSelect(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <button className="submit-numbers-btn" onClick={handleSubmit}>
          Confirm Selections
        </button>
      </div>
    </div>
  );
};

export default SpinnerSelection;