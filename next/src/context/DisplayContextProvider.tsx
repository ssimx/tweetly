'use client';
import { createContext, useContext } from "react";

type DisplayContextPropTypes = {
    savedTheme: number,
    savedColor: number,
};

const DisplayContext = createContext<DisplayContextPropTypes | undefined>(undefined);

export const useDisplayContext = () => {
    const context = useContext(DisplayContext);
    if (!context) throw new Error("useDisplayContext must be used within a DisplayContext");
    return context;
};

export default function DisplayContextProvider({ savedTheme, savedColor, children }: { savedTheme: number, savedColor: number, children: React.ReactNode }) {
    return (
        <DisplayContext.Provider value={{ savedTheme, savedColor }}>
            {children}
        </DisplayContext.Provider>
    )
}

export { DisplayContext };