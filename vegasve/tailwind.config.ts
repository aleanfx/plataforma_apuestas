import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: "var(--black)",
          2: "var(--black-2)",
        },
        gray: {
          DEFAULT: "var(--gray)",
          2: "var(--gray-2)",
          3: "var(--gray-3)",
        },
        green: {
          DEFAULT: "var(--green)",
          bright: "var(--green-bright)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          bright: "var(--gold-bright)",
          deep: "var(--gold-deep)",
        },
        purple: {
          DEFAULT: "var(--purple)",
          bright: "var(--purple-bright)",
        },
        cyan: "var(--cyan)",
        pink: "var(--pink)",
        orange: "var(--orange)",
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
        },
        ink: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        danger: "var(--danger)",
      },
      fontFamily: {
        serif: ["var(--font-display)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      maxWidth: {
        wrap: "var(--maxw)",
      },
      boxShadow: {
        casino: "var(--shadow)",
      },
      keyframes: {
        fade: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        pop: {
          from: { opacity: "0", transform: "translateY(20px) scale(.97)" },
          to: { opacity: "1", transform: "none" },
        },
        floatA: {
          "0%, 100%": { transform: "translateY(0) rotateZ(-11deg) rotateY(-12deg) rotateX(4deg)" },
          "50%": { transform: "translateY(-22px) rotateZ(-8deg) rotateY(8deg) rotateX(-3deg)" },
        },
        floatB: {
          "0%, 100%": { transform: "translateZ(-70px) translateY(0) rotateZ(7deg) rotateY(10deg) rotateX(-3deg)" },
          "50%": { transform: "translateZ(-70px) translateY(-26px) rotateZ(4deg) rotateY(-9deg) rotateX(5deg)" },
        },
        floatC: {
          "0%, 100%": { transform: "translateZ(90px) translateY(0) rotateZ(-8deg) rotateY(3deg)" },
          "50%": { transform: "translateZ(90px) translateY(-16px) rotateZ(-11deg) rotateY(-3deg)" },
        },
        sheen: {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
        },
      },
      animation: {
        fade: "fade .45s ease",
        pop: "pop .3s cubic-bezier(.2,.8,.3,1.1)",
        floatA: "floatA 7s ease-in-out infinite",
        floatB: "floatB 8s ease-in-out infinite",
        floatC: "floatC 6.4s ease-in-out infinite",
        sheen: "sheen 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
