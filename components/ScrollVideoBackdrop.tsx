import React from "react";

export default function ScrollVideoBackdrop() {
  return (
    <canvas
      id="video-scrub-canvas"
      className="absolute inset-0 -z-10 w-full h-full pointer-events-none"
    />
  );
}
