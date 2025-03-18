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
import { redirect } from 'next/navigation';

export default async function AuthorizedLayout({ children, modals }: Readonly<{ children: React.ReactNode, modals: React.ReactNode }>) {
    const userPromise = getLoggedInUser();
    const followSuggestionsPromise = getFollowSuggestions();
    const [userResponse, followSuggestionsResponse] = await Promise.all([userPromise, followSuggestionsPromise]);

    if (!userResponse.success || userResponse.data === undefined || userResponse.data.user === undefined) {
        console.error('Something went wrong while fetching user information');
        redirect('/logout');
    }

    const suggestedUsers = followSuggestionsResponse.success && followSuggestionsResponse.data?.suggestedUsers
        ? followSuggestionsResponse.data?.suggestedUsers
        : [];

    return (
        <UserContextProvider userData={userResponse.data.user}>
            <TrendingContextProvider>
                <FollowSuggestionContextProvider followSuggestions={suggestedUsers}>
                    <BlockedUsersContextProvider>
                        <PostInteractionContextProvider>
                            <body suppressHydrationWarning
                                className={`w-[99%] min-w-[0px] max-w-[1300px] min-h-[0px] min-h-100dvh overflow-x-hidden box-border
                                    grid xs:grid-cols-[auto,auto]
                                    lg:grid-cols-[auto,auto]
                                    mx-auto justify-center content-center`}
                            >
                                <header
                                    className="min-w-[0px] min-h-[0px] col-start-1 col-end-2 hidden relative
                                        xs:flex xs:w-[80px]
                                        xl:w-[250px]"
                                    role='banner'
                                >
                                    {/* The actual sidebar - Fixed position */}
                                    <div className='w-full flex justify-center relative'>
                                        <LeftSidebar />
                                    </div>
                                </header>

                                <main className="h-fit min-h-screen w-full col-start-2 col-end-3">
                                    <div className="grid grid-cols-[minmax(400px,600px)] xl:grid xl:grid-cols-[minmax(500px,600px),1fr] mx-auto max-w-[1200px]">
                                        {/* Middle Content */}
                                        <div className="h-fit min-h-screen border-x border-primary-border
                                                        w-full max-w-[600px] mx-auto xl:mx-0">
                                            <TemplateHeader />
                                            {children}
                                            {modals}
                                        </div>

                                        {/* Right Sidebar */}
                                        <aside className="hidden lg:hidden xl:flex justify-center h-fit w-full pt-5 px-4">
                                            <RightSidebar />
                                        </aside>
                                    </div>
                                </main>

                                {/* Mobile Navigation */}
                                <PhoneBottomNav />
                            </body>
                        </PostInteractionContextProvider>
                    </BlockedUsersContextProvider>
                </FollowSuggestionContextProvider>
            </TrendingContextProvider>
        </UserContextProvider>
    )
}
