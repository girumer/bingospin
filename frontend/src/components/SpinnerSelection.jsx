import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


import socket from "../socket";

const SpinnerSelection = () => {
  const [searchParams] = useSearchParams();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
 // State to control wheel rotation
const segmentThemes = [
  // Value 0 is the lowest prize/loss
  { value: 0, theme: 'Cabbage', color: '#6AA84F', icon: '🥬' }, // Cabbage (Green)
  { value: 5, theme: 'Lemon', color: '#FFD966', icon: '🍋' }, // Lemon (Yellow)
  { value: 7, theme: 'Orange', color: '#FFA500', icon: '🍊' }, // Orange (Orange)
  { value: 10, theme: 'Apple', color: '#CC0000', icon: '🍎' }, // Apple (Red)
  { value: 12, theme: 'Papaya', color: '#FF6347', icon: '🍈' }, // Papaya (Tomato Red)
  { value: 15, theme: 'Cinnamon', color: '#D2691E', icon: '🌰' }, // Cinnamon (Brown)
  { value: 20, theme: 'Banana', color: '#FFE599', icon: '🍌' }, // Banana (Light Yellow)
  { value: 25, theme: 'Pineapple', color: '#FFD700', icon: '🍍' }, // Pineapple (Gold)
  { value: 30, theme: 'Mango', color: '#F6B26B', icon: '🥭' }, // Mango (Orange)
  { value: 50, theme: 'Bonus', color: '#4A86E8', icon: '✨' }, // Bonus (Blue)
];

const numbers = segmentThemes.map(t => t.value);
const segmentCount = numbers.length;
const segmentAngle = 360 / segmentCount; // 60 degrees

// These probabilities make the 50 point segment much rarer (5%)
const probabilities = {
  50: 1, // 5% chance
  30: 1, // 10% chance
  25:1,
  20: 1, // 20% chance
  15:4,
  12:5,
  10: 8, // 20% chance
  7:9,
  5: 40, // 25% chance
  0: 30, // 20% chance
};

  const username = searchParams.get("username");
  const telegramId = searchParams.get("telegramId");
  const stake = searchParams.get("stake");
  const navigate = useNavigate();

  // Spinner values from your ORIGINAL code: 200, 150, 100, 50, 5, "Sad"
  
 const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);
  const conicGradient = useMemo(() => {
    const stops = segmentThemes.map((theme, index) => {
      const start = index * segmentAngle;
      const end = (index + 1) * segmentAngle;
      return `${theme.color} ${start}deg ${end}deg`;
    }).join(', ');
    return `conic-gradient(${stops})`;
  }, []);
  const getWeightedRandomNumber = () => {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const number of numbers) {
      cumulative += probabilities[number];
      if (random <= cumulative) return number;
    }
    // Fallback in case of rounding errors, should return the highest probability item (e.g., 5)
    return numbers.sort((a, b) => probabilities[b] - probabilities[a])[0];
  };

  // Function to get result message based on the result value
  const getResultMessage = (resultValue) => {
    if (resultValue === 0) {
      return "💔 You lost! Better luck next time! 💔";
    } else if (resultValue === 5) {
      return "😐 No win, try again! 😐";
    } else {
      return `🎉 You won: ${resultValue}! 🎉`;
    }
  };

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const winningNumber = getWeightedRandomNumber();
    const segmentIndex = numbers.indexOf(winningNumber);

    // Calculate the angle to the CENTER of the winning segment
    const centerAngleOfWinningSegment = segmentIndex * segmentAngle + (segmentAngle / 2);
  console.log("center",centerAngleOfWinningSegment);
    // The wheel rotates CLOCKWISE. We want the center of the winning segment 
    // to stop at the pointer (which is at the top, or 0 degrees).
    // Rotation required: 360 - center angle
    const segmentTargetRotation = 360 - (centerAngleOfWinningSegment+36);
   console.log("segment is ",segmentTargetRotation);
    // Add full spins (5-9 spins) for a smooth, exciting animation
    const spins = 5 + Math.floor(Math.random() * 5);
    const targetRotation = (spins * 360) + segmentTargetRotation;

    if (wheelRef.current) {
      // Apply transition for the spin duration
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
      wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
    }

    // Set result after the spin animation completes
    setTimeout(() => {
      setSpinning(false);
      setResult(winningNumber);
    }, 4000);
  };

  const resetWheel = () => {
    if (wheelRef.current) {
      // Reset transform immediately without transition
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
    setResult(null);
    setSpinning(false);
  };
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

  

 

  

 
  return (
    
   <div className="spinner-container">
      {/* -------------------- Custom Styles Block (Merged from your CSS) -------------------- */}
      <style>
        {`
        /* Load Inter font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

        /* SpinnerWheel.css - ADAPTED FOR SINGLE FILE */
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #dacfe6 0%, #03173aff 100%);
          font-family: 'Inter', sans-serif; /* Changed to Inter */
          color: white;
          padding: 20px;
          box-sizing: border-box;
        }

        h1 {
          margin-bottom: 40px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          font-size: 2.5rem;
          font-weight: 900;
        }

        .wheel-container {
          position: relative;
          width: 400px;
          height: 400px;
          margin-bottom: 40px;
        }

        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
          border: 10px solid #fff;
          
          /* IMPORTANT: Transition is applied dynamically in JS */
          transition: transform 4s cubic-bezier(0.2, 0.8, 0.3, 1);
          transform: rotate(0deg);
          transform-origin: center center;
          overflow: hidden; /* To keep labels inside */
        }
        
        /* Segment labels are now handled by this class */
        .segment-label {
          /* Positioning the label */
          position: absolute;
          width: 50%;
          height: 50%;
          top: 0;
          left: 50%;
          transform-origin: 0% 100%; /* Anchor at the center of the wheel */
          
          /* Content container to move the number/icon outward */
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 10px; /* Push content away from the center */
        }
        
        /* Inner container to hold text/icon and counter-rotate it */
        .segment-content {
          /* Counter-rotate the text to make it level on the screen */
          transform: rotate(-${segmentAngle / 2}deg); 
          display: flex;
          align-items: center;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        }

        .number {
          font-size: 30px;
          font-weight: bold;
          margin-left: 5px;
        }
        .segment-icon {
          font-size: 24px;
        }

        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          border: 5px solid #ff4757;
          z-index: 5;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        }

        .pointer {
          position: absolute;
          /* Position above the wheel */
          top: -30px; 
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          /* Triangle shape */
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-top: 30px solid #ff4757; 
          z-index: 10;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
        }

        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
        }

        .spin-button {
          padding: 18px 50px;
          font-size: 20px;
          font-weight: bold;
          background: linear-gradient(to right, #ff8a00, #da1b60);
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .spin-button:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          background: linear-gradient(to right, #ff9500, #e84168);
        }

        .spin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .result {
          text-align: center;
          animation: fadeIn 0.5s ease;
          background: rgba(255, 255, 255, 0.1);
          padding: 20px 30px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          margin-top: 20px;
        }

        .result h2 {
          margin-bottom: 20px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          font-size: 1.8rem;
          color: #ffeb3b;
        }

        .reset-button {
          padding: 12px 30px;
          font-size: 16px;
          font-weight: bold;
          background: linear-gradient(to right, #00b09b, #96c93d);
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          background: linear-gradient(to right, #00c9a7, #a8e063);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .wheel-container {
            width: 300px;
            height: 300px;
          }
          
          .number {
            font-size: 20px;
          }
          
          .segment-label {
            padding-left: 5px;
          }

          .segment-content {
             /* Adjust counter rotation for smaller screen if needed */
          }
          
          .center-circle {
            width: 60px;
            height: 60px;
          }
          
          .spin-button {
            padding: 15px 40px;
            font-size: 18px;
          }
          
          h1 {
            font-size: 2rem;
          }
        }
        `}
      </style>
      {/* -------------------- END Custom Styles Block -------------------- */}

      <h1 className="text-4xl font-black tracking-wide">Prize Wheel of Fortune</h1>
      <h2>Welcome, {username} 👋</h2>
      <p>Stake: {stake} ETB</p>
      <div className="wheel-container">
        
        {/* The wheel now uses the conicGradient for seamless colors */}
        <div
          className="wheel"
          ref={wheelRef}
          style={{ 
            background: conicGradient,
          }}
        >
          {/* Map through segments to position the text and icons */}
          {segmentThemes.map((theme, index) => {
            const rotation = index * segmentAngle;
            
            return (
              <div
                key={index}
                className="segment-label"
                // Rotate the label container to its position on the wheel
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {/* Content is counter-rotated to stay upright */}
                <div className="segment-content">
                  <span className="segment-icon">
                    {theme.icon}
                  </span>
                  <span className="number">
                    {theme.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="pointer"></div>
        <div className="center-circle"></div>
      </div>

      <div className="controls">
      {result === null && (
  <button onClick={spinWheel} disabled={spinning} className="spin-button">
    {spinning ? 'Spinning...' : 'SPIN'}
  </button>
)}
        {result !== null && (
          <div className="result">
            <h2>{getResultMessage(result)}</h2>
            <button onClick={resetWheel} className="reset-button">Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinnerSelection;