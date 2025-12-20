import React from 'react';

const NeonHeader = ({ text }) => {
  if (!text) return null;

  return (
    <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-wider uppercase flex flex-wrap justify-center">
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="mx-2">&nbsp;</span>;

        const rand = Math.random();
        let animClass = "anim-steady";
        
        if (rand > 0.85) {
          animClass = "anim-critical";
        } else if (rand > 0.6) {
          animClass = "anim-flicker";
        }

        const randomDuration = (Math.random() * 3 + 2).toFixed(2) + "s";
        const randomDelay = (Math.random() * 5).toFixed(2) + "s";

        return (
          <span
            key={index}
            className={animClass}
            style={{
              animationDuration: randomDuration,
              animationDelay: randomDelay,
              display: "inline-block"
            }}
          >
            {char}
          </span>
        );
      })}
    </h1>
  );
};

export default NeonHeader;
