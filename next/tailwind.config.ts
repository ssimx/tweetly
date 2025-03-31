import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{ts,tsx}",
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        extend: {
            scale: {
                '115': 'var(--tw-scale-x: 1.1)'
            },
            screens: {
                'xs': '500px',
            },
            height: {
                'header': 'var(--header-size)'
            },
            gridTemplateRows: {
                // main content
                'main-content': 'auto 1fr',

                // 3 row grid
                'root-phone-layout': '10% 1fr 6%',

                // 2 row grid for feed
                'feed-desktop-xs': 'auto 1fr',

                // 3 row grid for feed header
                'feed-header-desktop-xs': '40% auto',

                'profile-info': '200px auto auto',

                // conversation messages + input
                'conversation-content': '1fr auto',

                // conversation user + messages
                'conversation-messages': 'auto 1fr'
            },
            gridTemplateColumns: {
                'post': '10% auto',

                'root-desktop-layout-xs': '15% 1fr',
                // 3 col grid
                'root-desktop-layout-lg': '10% 1fr',
                'root-desktop-layout-xl': '20% 1fr',

                // main content 2 col grid
                'main-content-layout': '65% 1fr',
                // Post modal columns
                'post-layout': 'auto 1fr',
            },
            colors: {
                fill: {
                    '1': 'rgba(255, 255, 255, 0.10)'
                },
                success: {
                    '25': '#F6FEF9',
                    '50': '#ECFDF3',
                    '100': '#D1FADF',
                    '600': '#039855',
                    '700': '#027A48',
                    '900': '#054F31'
                },
                blue: {
                    '1': '#1DA1F2'
                },
                white: {
                    '1': '#F4F3F2'
                },
                black: {
                    '1': '#0F1419'
                },
                dark: {
                    '200': '#F7F9FA',
                    '300': '#EBEEF0',
                    '400': '#8899A6',
                    '500': '#5B7083',
                    '600': '#3A444C',
                    '700': '#283340',
                    '800': '#1C2733',
                    '900': '#17202A'
                },
                ['primary-color']: {
                    'blue': 'hsl(var(--primary-color-blue))',
                    'yellow': 'hsl(var(--primary-color-yellow))',
                    'pink': 'hsl(var(--primary-color-pink))',
                    'purple': 'hsl(var(--primary-color-purple))',
                    'orange': 'hsl(var(--primary-color-orange))',
                },
                ['primary-theme']: {
                    'white': 'hsl(var(--primary-theme-white))',
                    'dim': 'hsl(var(--primary-theme-dim))',
                    'dark': 'hsl(var(--primary-theme-dark))',
                },
                ['primary-text-color']: {
                    'white': 'hsl(0, 0%, 100%)',
                    'black': 'hsl(0, 0%, 0%)',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                post: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                    hover: 'hsl(var(--post-hover))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                    hover: 'hsl(var(--card-hover))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    dark: 'hsl(var(--primary-dark))',
                    foreground: 'hsl(var(--primary-foreground))',
                    text: 'hsl(var(--primary-text-color))',
                    border: 'hsl(var(--border))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                    text: 'hsl(var(--secondary-text-color))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            boxShadow: {
                form: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
                menu: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'
            },
            fontFamily: {
                inter: 'var(--font-inter)',
                ibm: 'var(--font-ibm-plex-serif)'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
