import React from "react";

interface ButtonProps {
  text: string;
  styles?: React.CSSProperties;
}

function Button({ text, styles }: ButtonProps) {
  return (
    <button
      style={styles}
      className="bg-gradient-to-r from-purple-800 via-sky-300 to-purple-950 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center
        hover:shadow-xl
       hover:to-purple-800 hover:from-purple-950  hover:via-sky-300
        "
    >
      {text}
    </button>
  );
}

export default Button;
