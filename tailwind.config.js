// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: "#1f4397", // custom blue
        brandYellow: "#feb41d", // custom yellow
        offWhite: "#f9f9f9", // offwhite
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
        // This section teaches Tailwind how to create the "animate-gradient-flow" utility.
      backgroundSize: {
        '200%': '200% 200%',
      },
      animation: {
        'gradient-flow': 'gradient-flow 4s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite', // A 3-second, slow, continuous spin
        'electric-glow': 'electric-glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
                'electric-glow': {
          '0%': { textShadow: '0 0 4px rgba(255, 255, 255, 0.3)' },
          '100%': { textShadow: '0 0 12px rgba(59, 130, 246, 0.7), 0 0 20px rgba(37, 99, 235, 0.5)' },
        },
      },
    },

  },
  plugins: [
    require("@tailwindcss/typography"), // <--- Make sure this line is added
    require("tailwind-scrollbar"),
  ],
};
