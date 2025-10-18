/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#1a1b26", // bg
          900: "#16161e",
          850: "#24283b",
          800: "#292e42",
        },
        accent: {
          blue: "#7aa2f7",
          cyan: "#7dcfff",
          purple: "#bb9af7",
          green: "#9ece6a",
          yellow: "#e0af68",
          red: "#f7768e",
        },
        text: {
          base: "#c0caf5",
          dim: "#a9b1d6",
          comment: "#565f89",
        },
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      fontSize: {
        xs2: ["0.72rem", { letterSpacing: "0.02em" }],
      },
    },
  },
};
