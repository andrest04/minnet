"use client";

import { useState, useEffect } from "react";

export function useOTPTimer(initialTime = 300) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const reset = (newTime = initialTime) => {
    setTimeLeft(newTime);
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    reset,
    isExpired: timeLeft <= 0,
  };
}
