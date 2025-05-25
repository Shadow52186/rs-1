import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        background: {
          color: "transparent",
        },
        particles: {
          number: {
            value: 60,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: "#ffffff", // ✅ สีขาวคงที่
          },
          shape: {
            type: ["circle", "square"],
          },
          opacity: {
            value: 1,
            random: true,
          },
          size: {
            value: { min: 4, max: 8 },
            random: true,
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            outModes: {
              default: "out",
            },
          },
        },

        interactivity: {
          events: {
            onHover: {
              enable: false,
            },
          },
        },
        detectRetina: true,
      }}
      style={{
        pointerEvents: "none",
      }}
    />
  );
};

export default ParticlesBackground;
