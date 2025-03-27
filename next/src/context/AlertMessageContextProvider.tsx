'use client';
import { createContext, useContext, useEffect, useState } from "react";

type AlertMessageContextPropTypes = {
    alertMessage: string | null,
    setAlertMessage: React.Dispatch<React.SetStateAction<string | null>>,
};

const AlertMessageContext = createContext<AlertMessageContextPropTypes | undefined>(undefined);

export const useAlertMessageContext = () => {
    const context = useContext(AlertMessageContext);
    if (!context) throw new Error("useAlertMessageContext must be used within a AlertMessageContext");
    return context;
};

export default function AlertMessageContextProvider({ children }: { children: React.ReactNode }) {
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if (alertMessage !== null) {
            timeoutId = setTimeout(() => {
                setAlertMessage(null);
            }, 3000);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [alertMessage]);

    return (
        <AlertMessageContext.Provider value={{ alertMessage, setAlertMessage }}>
            {children}
        </AlertMessageContext.Provider>
    )
}

export { AlertMessageContext };