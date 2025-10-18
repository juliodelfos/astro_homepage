/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F1A",
          900: "#0F1524",
          850: "#11182A",
          800: "#141C30",
          750: "#1A2440",
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
