import React, { useState, useEffect } from "react";

export default function CountdownTimer({ targetDate }) {
  const calculateTimeRemaining = () => {
    const now = new Date();
    const difference = targetDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
      };
    } else {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <ul className="box-time">
        <li style={{ color: "rgb(215, 0, 24)" }}>
          <p className="time" style={{ color: "rgb(215, 0, 24)" }}>
            {timeRemaining.hours}
          </p>{" "}
          <p className="separate">:</p>
        </li>{" "}
        <li style={{ color: "rgb(215, 0, 24)" }}>
          <p className="time" style={{ color: "rgb(215, 0, 24)" }}>
            {timeRemaining.minutes}
          </p>{" "}
          <p className="separate">:</p>
        </li>{" "}
        <li style={{ color: "rgb(215, 0, 24)" }}>
          <p className="time" style={{ color: "rgb(215, 0, 24)" }}>
            {timeRemaining.seconds}
          </p>{" "}
          <p className="separate" style={{ margin: "unset" }} />
        </li>
      </ul>
    </div>
  );
}
