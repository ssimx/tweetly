import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { getColor, getTheme } from "@/lib/server-utils";
import DisplayContextProvider from "@/context/DisplayContextProvider";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibm = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-ibm' });

export const metadata: Metadata = {
    title: "Tweetly",
    description: "Tweetly is a modern social media platform for everyone.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Read theme and color from cookies
    const savedTheme = Number(await cookies().get("theme")?.value) || 0;
    const savedColor = Number(await cookies().get("color")?.value) || 0;

    return (
        <html lang="en">
            <body className={`${inter.variable} ${ibm.variable} antialiased selection:bg-primary selection:text-[#ffffff]`} data-color={getColor(savedColor)} data-theme={getTheme(savedTheme)}>
                <DisplayContextProvider savedTheme={savedTheme} savedColor={savedColor}>
                    {children}
                </DisplayContextProvider>
            </body>
        </html>
    );
}
