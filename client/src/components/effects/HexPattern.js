// ✅ HexPattern.js - วาดพื้นหลัง hexagon แบบ perspective
import React from "react";

const HexPattern = () => {
  return (
    <svg
      viewBox="0 0 600 400"
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%) scale(1.2)",
        width: "50%",
        zIndex: 0,
        opacity: 0.7,
        pointerEvents: "none",
      }}
    >
      <defs>
        <pattern
          id="hexPattern"
          patternUnits="userSpaceOnUse"
          width="30"
          height="26"
          patternTransform="skewX(-20)"
        >
          <polygon
            points="15,0 30,7.5 30,18.5 15,26 0,18.5 0,7.5"
            fill="#00bfff"
            opacity="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexPattern)" />
    </svg>
  );
};

export default HexPattern;
