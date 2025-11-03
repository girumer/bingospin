import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './spinnerselection.css';

import socket from "../socket";

const SpinnerSelection = () => {
  const [searchParams] = useSearchParams();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0); // State to control wheel rotation

  const username = searchParams.get("username");
  const telegramId = searchParams.get("telegramId");
  const stake = searchParams.get("stake");
  const navigate = useNavigate();

  // Spinner values from your ORIGINAL code: 200, 150, 100, 50, 5, "Sad"
  const spinnerSegmentsData = [
    { value: 200, unit: "ETB", color: "#f7b538" }, // Orange
    { value: 150, unit: "ETB", color: "#f05a28" }, // Red-orange
    { value: 100, unit: "ETB", color: "#22a7f0" }, // Blue
    { value: 50, unit: "ETB", color: "#f7b538" },  // Orange
    { value: 5, unit: "ETB", color: "#f05a28" },   // Red-orange
    { value: "Sad", unit: "", color: "#4a4e69" }  // Muted color for Sad slot
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

  const handleSpinClick = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    // Simulate a spin: rotate by a random amount for 3-5 full turns + extra to land
    const minRotations = 3;
    const maxRotations = 5;
    const extraDegrees = Math.floor(Math.random() * 360) + 720; // 720 for at least 2 full turns
    const newRotation = wheelRotation + (minRotations + Math.random() * (maxRotations - minRotations)) * 360 + extraDegrees;

    setWheelRotation(newRotation);

    // After animation finishes (e.g., 5 seconds), reset spinning state
    setTimeout(() => {
      setIsSpinning(false);
      alert("Spinner stopped!"); // Or call your actual result logic here
    }, 5000); // Match this duration with your CSS animation duration
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
  const segmentAngle = 360 / numSegments;

  return (
    <div className="spinner-selection-page">
      <h2>Welcome, {username} 👋</h2>
      <p>Stake: {stake} ETB</p>

      <div className="spinner-container">
        <div className="spinner-pointer-top"></div>

        <div className="spinner-wheel-frame">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="stud"
              style={{
                transform: `rotate(${i * (360 / 24)}deg) translate(calc(100% - 15px))`,
              }}
            ></div>
          ))}

          <div
            className={`spinner-wheel ${isSpinning ? 'spinning' : ''}`}
            style={{ transform: `rotate(${wheelRotation}deg)` }}
          >
            {spinnerSegmentsData.map((segment, index) => {
              const rotateDeg = index * segmentAngle;
              const isEmoji = segment.value === "Sad";

              return (
                <div
                  key={index}
                  className="spinner-segment-new"
                  style={{
                    backgroundColor: segment.color,
                    transform: `rotate(${rotateDeg}deg) skewY(${90 - segmentAngle / 2}deg)`,
                  }}
                >
                  <div
                    className="segment-text-content"
                    style={{
                      transform: `skewY(${-(90 - segmentAngle / 2)}deg) rotate(${segmentAngle / 2}deg) translateX(calc(50% - 30px))`,
                      // The translateX needs to push it from the center of rotation to the middle of the segment
                      // rotate(${segmentAngle / 2}deg) helps align text within its segment's center
                    }}
                  >
                    {isEmoji ? (
                      <img src="/images/sad.png" alt="Sad Emoji" className="segment-emoji-img" />
                    ) : (
                      <>
                        <span className="segment-value">{segment.value}</span>
                        {segment.unit && <span className="segment-unit">{segment.unit}</span>}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="spinner-center-btn"
            onClick={handleSpinClick}
            disabled={isSpinning}
          >
            <span className="spin-text">Spin</span>
          </button>
        </div>

        <div className="spinner-base"></div>
      </div>

      {/* Number selection board (keeping for context, hidden by default if not needed) */}
      <div className="number-selection-board" style={{display: 'none'}}> 
        {/* ... (your existing number selection board code) ... */}
      </div>
    </div>
  );
};

export default SpinnerSelection;