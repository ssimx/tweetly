import LeftSidebar from "@/components/LeftSidebar";
import PhoneBottomNav from "@/components/PhoneBottomNav";
import UserContextProvider from "@/context/UserContextProvider";
import { fetchUserData } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const userData = await fetchUserData().then(res => res);
    if (!userData) return redirect('/login');
    
    return (
        <UserContextProvider userData={userData}>
            <main className="w-screen">
                <div className="root-phone xs:root-desktop xs:pt-4">
                    <LeftSidebar />
                    <div className="header">header</div>
                    {children}
                    <div className="right-sidebar">right sidebar</div>
                    <PhoneBottomNav/>
                </div>
            </main>
        </UserContextProvider>
    )
}
