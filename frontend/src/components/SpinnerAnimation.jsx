import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "../socket";
import "./spinneranimation.css";

const SpinnerAnimation = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(true);

  const username = searchParams.get("username");
  const telegramId = searchParams.get("telegramId");
  const stake = searchParams.get("stake");

  useEffect(() => {
    const clientId = `${telegramId}-spinner`;

    // Listen for result
    socket.on("spinnerResult", (data) => {
      setResult(data);
      setSpinning(false);
    });

    // Trigger spin after short delay (simulate countdown)
    const timer = setTimeout(() => {
      socket.emit("startSpinnerGame", { roomId: stake });
    }, 3000); // 3s delay before spin starts

    return () => {
      clearTimeout(timer);
      socket.off("spinnerResult");
    };
  }, [telegramId, stake]);

  return (
    <div className="spinner-animation">
      <h2>🎰 Spinning for {stake} ETB...</h2>
      {spinning ? (
        <div className="spinner-wheel">🌀</div>
      ) : (
        <div className="result">
          <h3>{result.message}</h3>
          <p>Winning Number: {result.winningNumber}</p>
          <p>New Wallet Balance: {result.wallet} ETB</p>
        </div>
      )}
    </div>
  );
};

export default SpinnerAnimation;
