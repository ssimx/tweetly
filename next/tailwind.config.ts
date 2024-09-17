import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                fill: {
                    1: "rgba(255, 255, 255, 0.10)",
                },
                bankGradient: "#0179FE",
                success: {
                    25: "#F6FEF9",
                    50: "#ECFDF3",
                    100: "#D1FADF",
                    600: "#039855",
                    700: "#027A48",
                    900: "#054F31",
                },
                blue: {
                    1: "#1DA1F2",
                },
                white: {
                    1: "#F4F3F2",
                },
                black: {
                    1: "#0F1419",
                },
                dark: {
                    200: "#F7F9FA",
                    300: "#EBEEF0",
                    400: "#8899A6",
                    500: "#5B7083",
                    600: "#3A444C",
                    700: "#283340",
                    800: "#1C2733",
                    900: "#17202A",
                },
            },
            boxShadow: {
                form: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
            },
            fontFamily: {
                inter: "var(--font-inter)",
                ibm: "var(--font-ibm-plex-serif)",
            },
        },
    },
    plugins: [],
} satisfies Config;

export default config;
