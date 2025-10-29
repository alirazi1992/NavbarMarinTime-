const { fontFamily } = require("tailwindcss/defaultTheme");

const withOpacityValue = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `oklch(var(${variable}) / ${opacityValue})`;
    }
    return `oklch(var(${variable}) / 1)`;
  };
};

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: withOpacityValue("--border"),
        input: withOpacityValue("--input"),
        ring: withOpacityValue("--ring"),
        background: withOpacityValue("--background"),
        foreground: withOpacityValue("--foreground"),
        card: {
          DEFAULT: withOpacityValue("--card"),
          foreground: withOpacityValue("--card-foreground"),
        },
        popover: {
          DEFAULT: withOpacityValue("--popover"),
          foreground: withOpacityValue("--popover-foreground"),
        },
        primary: {
          DEFAULT: withOpacityValue("--primary"),
          foreground: withOpacityValue("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withOpacityValue("--secondary"),
          foreground: withOpacityValue("--secondary-foreground"),
        },
        muted: {
          DEFAULT: withOpacityValue("--muted"),
          foreground: withOpacityValue("--muted-foreground"),
        },
        accent: {
          DEFAULT: withOpacityValue("--accent"),
          foreground: withOpacityValue("--accent-foreground"),
        },
        destructive: {
          DEFAULT: withOpacityValue("--destructive"),
          foreground: withOpacityValue("--destructive-foreground"),
        },
        sidebar: {
          DEFAULT: withOpacityValue("--sidebar"),
          foreground: withOpacityValue("--sidebar-foreground"),
          primary: withOpacityValue("--sidebar-primary"),
          "primary-foreground": withOpacityValue(
            "--sidebar-primary-foreground"
          ),
          accent: withOpacityValue("--sidebar-accent"),
          "accent-foreground": withOpacityValue(
            "--sidebar-accent-foreground"
          ),
          border: withOpacityValue("--sidebar-border"),
          ring: withOpacityValue("--sidebar-ring"),
        },
        chart: {
          1: withOpacityValue("--chart-1"),
          2: withOpacityValue("--chart-2"),
          3: withOpacityValue("--chart-3"),
          4: withOpacityValue("--chart-4"),
          5: withOpacityValue("--chart-5"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
