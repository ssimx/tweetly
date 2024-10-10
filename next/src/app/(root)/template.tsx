import TemplateHeader from "@/components/root-template/Header";
import LeftSidebar from "@/components/root-template/left-sidebar/LeftSidebar";
import PhoneBottomNav from "@/components/root-template/PhoneBottomNav";
import UserContextProvider from "@/context/UserContextProvider";
import { fetchUserData } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const userData = await fetchUserData();
    if (!userData) return redirect('/login');

    return (
        <UserContextProvider userData={userData}>
            <main className="w-screen h-auto">
                <div className="root-phone xs:root-desktop">
                    <div className='left-sidebar-wrapper'>
                        <LeftSidebar />
                    </div>
                    <div className='main-content'>
                        <div className='border-x h-full'>
                            <TemplateHeader />
                            {children}
                        </div>
                        <div className="right-sidebar">right sidebar</div>
                    </div>
                    <PhoneBottomNav />
                </div>
            </main>
        </UserContextProvider>
    )
}
