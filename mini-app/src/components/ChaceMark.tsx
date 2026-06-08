import React from "react";

interface Props {
  size?: number;
  color?: string;
}

export default function ChaceMark({ size = 24, color = "#0ECFB3" }: Props) {
  return (
    <svg width={size} height={size} viewBox="-2 -2 104 104" fill="none">
      <circle
        cx="50" cy="50" r="38"
        stroke={color} strokeWidth="9"
        strokeLinecap="square" fill="none"
        strokeDasharray="219 20"
        transform="rotate(330,50,50)"
      />
      <polygon points="69,17 61,6 55,16" fill={color} />
      <circle cx="50" cy="50" r="8" fill={color} />
    </svg>
  );
}
