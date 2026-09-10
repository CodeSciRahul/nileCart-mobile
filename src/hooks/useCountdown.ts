import { useEffect, useRef, useState } from "react";

export function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = (value: number) => {
    clear();
    setSeconds(value);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => clear, []);

  return {
    seconds,
    isActive: seconds > 0,
    start,
  };
}
