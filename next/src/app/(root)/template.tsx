import TemplateHeader from "@/components/root-template/Header";
import LeftSidebar from "@/components/root-template/left-sidebar/LeftSidebar";
import PhoneBottomNav from "@/components/root-template/PhoneBottomNav";
import UserContextProvider from "@/context/UserContextProvider";
import { getToken } from "@/lib/session";
import { UserInfo } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const token = getToken();
    if (!token) {
        return redirect('/login');
    }

    const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return redirect('/logout');
    }

    const userData = await response.json() as UserInfo;

    return (
        <UserContextProvider userData={userData}>
                <main className="w-screen h-auto">
                    <div className="root-phone xs:root-desktop">
                        <div className='left-sidebar-wrapper'>
                            <LeftSidebar />
                        </div>
                        <div className='main-content'>
                            <div className='border-x h-screen grid grid-cols-1 grid-rows-main-content'>
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
