import TemplateHeader from "@/components/root-template/Header";
import LeftSidebar from "@/components/root-template/left-sidebar/LeftSidebar";
import PhoneBottomNav from "@/components/root-template/PhoneBottomNav";
import RightSidebar from "@/components/root-template/right-sidebar/RightSidebar";
import UserContextProvider from "@/context/UserContextProvider";
import FollowSuggestionContextProvider from "@/context/FollowSuggestionContextProvider";
import TrendingContextProvider from "@/context/TrendingContextProvider";
import { getLoggedInUser } from "@/data-acess-layer/user-dto";
import BlockedUsersContextProvider from "@/context/BlockedUsersContextProvider";
import PostInteractionContextProvider from "@/context/PostInteractionContextProvider";
import { getFollowSuggestions } from '@/actions/get-actions';

export default async function AuthorizedLayout({ children, modals }: Readonly<{ children: React.ReactNode, modals: React.ReactNode }>) {
    const userPromise = getLoggedInUser();
    const followSuggestionsPromise = getFollowSuggestions();
    const [user, followSuggestions] = await Promise.all([userPromise, followSuggestionsPromise]);

    return (
        <UserContextProvider userData={user}>
            <TrendingContextProvider>
                <FollowSuggestionContextProvider followSuggestions={followSuggestions}>
                    <BlockedUsersContextProvider>
                        <PostInteractionContextProvider>
                            <main className="w-screen h-auto">
                                <div className="root-phone xs:root-desktop">
                                    <div className='left-sidebar-wrapper'>
                                        <LeftSidebar />
                                    </div>

                                    <div className='main-content'>
                                        <div className='border-x grid grid-cols-1 grid-rows-main-content border-b border-primary-border'>
                                            <TemplateHeader />
                                            {children}
                                            {modals}
                                        </div>
                                        <div className='right-sidebar-wrapper'>
                                            <RightSidebar />
                                        </div>
                                    </div>

                                    <PhoneBottomNav />
                                </div>
                            </main>
                        </PostInteractionContextProvider>
                    </BlockedUsersContextProvider>
                </FollowSuggestionContextProvider>
            </TrendingContextProvider>
        </UserContextProvider>
    )
}
