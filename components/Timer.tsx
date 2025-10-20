
import React, { useState, useEffect } from 'react';

interface TimerProps {
  breakEndTime: number;
}

const Timer: React.FC<TimerProps> = ({ breakEndTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = breakEndTime - Date.now();
      if (difference > 0) {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return '00:00';
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [breakEndTime]);

  return (
    <div className="text-center">
      <p className="text-slate-500 dark:text-slate-400 text-sm">Time Remaining</p>
      <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{timeLeft}</p>
    </div>
  );
};

export default Timer;
