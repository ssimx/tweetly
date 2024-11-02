import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{ts,tsx}",
    ],
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

                'profile-info': '135px auto auto',

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
                'root-desktop-layout-xl': '18% 1fr',

                // main content 2 col grid
                'main-content-layout': '70% 30%',
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
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                    hover: 'rgba(0, 0, 0, 0.03)'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
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
                border: 'hsl(var(--border))',
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
