/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        data: ["var(--font-data)", "monospace"],
        dangrek: ["Dangrek", "sans-serif"],
        casko: ["Casko", "sans-serif"],
        calista: ["Calista", "sans-serif"],
        felgine: ["Felgine", "sans-serif"],
      },
      colors: {
        // Scheme 1 Semantic Names
        root: "var(--bg-root)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        "accent-primary": "var(--accent-primary)",
        "accent-soft": "var(--accent-soft)",

        // Mappings for older component compatibility
        void: "var(--bg-root)",
        abyss: "var(--bg-surface)",
        stark: "var(--text-primary)",
        ethereal: "var(--accent-primary)",
      },
    },
  },
  plugins: [],
};
