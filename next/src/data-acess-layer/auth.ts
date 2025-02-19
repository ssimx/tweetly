import { cache } from "react";
import { getSettingsToken, getTemporaryToken, getToken, removeSession, removeTemporarySession, verifySession, verifySettingsToken } from "@/lib/session";
import { redirect } from "next/navigation";

export const getCurrentTemporaryUserToken = cache(async (): Promise<string | null> => {
    const token = await getTemporaryToken();
    if (!token) return null;

    const verifyToken = await verifySession(token);
    if (!verifyToken.isAuth) {
        await removeTemporarySession();
        return null;
    };

    return token;
});

export const getCurrentUserToken = cache(async (): Promise<string | undefined> => {
    const token = await getToken();

    if (!token) {
        redirect('/logout');
    };

    const verifyToken = await verifySession(token);
    if (!verifyToken.isAuth) {
        await removeSession();
        redirect('/logout');
    };

    return token;
});

export const verifyCurrentUserSettingsToken = async () => {
    const token = await getSettingsToken();
    if (!token) return null;

    const verifyToken = await verifySettingsToken(token);
    if (!verifyToken.isAuth) return null;
    
    return token;
};