import LeftSidebar from "@/components/LeftSidebar";
import PhoneBottomNav from "@/components/PhoneBottomNav";
import UserContextProvider from "@/context/UserContextProvider";

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <UserContextProvider>
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
