'use client';

import { createContext, useState } from "react";

type ThemeContextPropTypes = {
    theme: string,
    setTheme: React.Dispatch<React.SetStateAction<string>>,
};

const ThemeContext = createContext<ThemeContextPropTypes | undefined>(undefined);

export default function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState('light');

    const contextValue = { theme, setTheme };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    )
}

export { ThemeContext };