"use client";

import { animate, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
};

// eases toward the target value instead of snapping, for a satisfying counter
const AnimatedNumber = ({ value, decimals = 0 }: AnimatedNumberProps) => {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, motionValue]);

  return <>{display.toFixed(decimals)}</>;
};

export default AnimatedNumber;
