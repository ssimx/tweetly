import TemplateHeader from "@/components/root-template/Header";
import LeftSidebar from "@/components/root-template/left-sidebar/LeftSidebar";
import PhoneBottomNav from "@/components/root-template/PhoneBottomNav";
import RightSidebar from "@/components/root-template/right-sidebar/RightSidebar";
import UserContextProvider from "@/context/UserContextProvider";
import FollowSuggestionContextProvider from "@/context/FollowSuggestionContextProvider";
import TrendingContextProvider from "@/context/TrendingContextProvider";
import { getLoggedInUser } from "@/data-acess-layer/user-dto";
import { getFollowSuggestions } from "@/data-acess-layer/misc-dto";
import BlockedUsersContextProvider from "@/context/BlockedUsersContextProvider";

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const userPromise = getLoggedInUser();
    const followSuggestionsPromise = getFollowSuggestions();
    const [user, followSuggestions] = await Promise.all([userPromise, followSuggestionsPromise]);

    return (
        <UserContextProvider userData={user}>
            <main className="w-screen h-auto">
                <div className="root-phone xs:root-desktop">
                    <div className='left-sidebar-wrapper'>
                        <LeftSidebar />
                    </div>

                    <TrendingContextProvider>
                    <FollowSuggestionContextProvider followSuggestions={followSuggestions}>
                    <BlockedUsersContextProvider>
                            <div className='main-content'>
                                <div className='border-x grid grid-cols-1 grid-rows-main-content border-b border-primary-border'>
                                    <TemplateHeader />
                                    {children}
                                </div>
                                <div className='right-sidebar-wrapper'>
                                    <RightSidebar />
                                </div>
                            </div>
                        </BlockedUsersContextProvider>
                    </FollowSuggestionContextProvider>
                    </TrendingContextProvider>

                    <PhoneBottomNav />
                </div>
            </main>
        </UserContextProvider>
    )
}
