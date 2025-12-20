import React from 'react';

const NeonText = ({ text, className = "" }) => {
  if (!text) return null;

  return (
    <span className={`flex flex-wrap ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="mx-1">&nbsp;</span>;

        const rand = Math.random();
        let animClass = "anim-steady";
        
        if (rand > 0.92) {
          animClass = "anim-critical";
        } else if (rand > 0.75) {
          animClass = "anim-flicker";
        }

        const randomDuration = (Math.random() * 2 + 3).toFixed(2) + "s";
        const randomDelay = (Math.random() * 4).toFixed(2) + "s";

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
    </span>
  );
};

export default NeonText;
