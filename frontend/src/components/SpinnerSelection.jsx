import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import './spinnerselection.css';

import socket from "../socket";
const SpinnerSelection = () => {
  const [searchParams] = useSearchParams();
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  const username = searchParams.get("username");
  const telegramId = searchParams.get("telegramId");
  const stake = searchParams.get("stake");

  // Array from 1 to 100
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
useEffect(() => {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    console.log("Telegram WebApp initialized");
  }

  // Join Spinner Room
  if (username && telegramId && stake) {
    const clientId = `${telegramId}-spinner`; // Unique client ID for Spinner
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


  return (
    <div className="spinner-selection">
      <h2>Welcome, {username} 👋</h2>
      <p>Stake: {stake} ETB</p>
      <div className="number-grid">
        {numbers.map((num) => (
          <div
            key={num}
            className={`number-item ${selectedNumbers.includes(num) ? "selected" : ""}`}
            onClick={() => handleSelect(num)}
          >
            {num}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="submit-btn">
        Confirm Selection
      </button>
    </div>
  );
};

export default SpinnerSelection;
