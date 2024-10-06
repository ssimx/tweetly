import TemplateHeader from "@/components/Header";
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
            <main className="w-screen h-screen">
                <div className="root-phone xs:root-desktop">
                    <LeftSidebar />
                    <div className='border'>
                        <TemplateHeader />
                        {children}
                    </div>
                    <div className="right-sidebar">right sidebar</div>
                    <PhoneBottomNav/>
                </div>
            </main>
        </UserContextProvider>
    )
}
