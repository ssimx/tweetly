import TemplateHeader from "@/components/root-template/Header";
import LeftSidebar from "@/components/root-template/left-sidebar/LeftSidebar";
import PhoneBottomNav from "@/components/root-template/PhoneBottomNav";
import RightSidebar from "@/components/root-template/right-sidebar/RightSidebar";
import UserContextProvider from "@/context/UserContextProvider";
import SuggestionContextProvider from "@/context/SuggestionContextProvider";
import { getToken } from "@/lib/session";
import { UserInfo } from "@/lib/types";
import { redirect } from "next/navigation";
import TrendingContextProvider from "@/context/TrendingContextProvider";

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const token = await getToken();
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

    const user = await response.json() as UserInfo;

    return (
        <UserContextProvider userData={user}>
            <main className="w-screen h-auto">
                <div className="root-phone xs:root-desktop">
                    <TrendingContextProvider>
                        <SuggestionContextProvider>
                            <div className='left-sidebar-wrapper'>
                                <LeftSidebar />
                            </div>
                            <div className='main-content'>
                                <div className='border-x h-screen grid grid-cols-1 grid-rows-main-content'>
                                    <TemplateHeader />
                                    {children}
                                </div>
                                <div className='right-sidebar-wrapper'>
                                    <RightSidebar />
                                </div>
                            </div>
                            <PhoneBottomNav />
                        </SuggestionContextProvider>
                    </TrendingContextProvider>
                </div>
            </main>
        </UserContextProvider>
    )
}
