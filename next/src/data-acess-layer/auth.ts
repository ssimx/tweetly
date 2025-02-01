import { cache } from "react";
import { getSettingsToken, getToken, verifySession, verifySettingsToken } from "@/lib/session";
import { redirect } from "next/navigation";

export const getCurrentUserToken = cache(async (): Promise<string | undefined> => {
    const token = await getToken();
    const verifyToken = await verifySession(token);
    if (!verifyToken.isAuth) return redirect('/logout');
    return token;
});

export const verifyCurrentUserSettingsToken = async () => {
    const token = await getSettingsToken();
    const verifyToken = await verifySettingsToken(token);
    return verifyToken.isAuth;
};