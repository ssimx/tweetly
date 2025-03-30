import UserContextProvider from "@/context/UserContextProvider";
import FollowSuggestionContextProvider from "@/context/FollowSuggestionContextProvider";
import TrendingContextProvider from "@/context/TrendingContextProvider";
import { getLoggedInUser } from "@/data-acess-layer/user-dto";
import BlockedUsersContextProvider from "@/context/BlockedUsersContextProvider";
import PostInteractionContextProvider from "@/context/PostInteractionContextProvider";
import { getFollowSuggestions } from '@/actions/get-actions';
import { redirect } from 'next/navigation';
import MainContent from '@/components/root-template/MainContent';
import AlertMessageContextProvider from '@/context/AlertMessageContextProvider';

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
                                className={`h-dvh w-screen
                                    xs:mx-auto xs:justify-center xs:content-center
                                    xs:min-h-screen xs:w-[99%]
                                    xs:grid xs:grid-cols-[auto,1fr]
                                    sm:max-w-[680px]
                                    xl:max-w-[1300px]`
                                }
                            >

                                <AlertMessageContextProvider>
                                    <MainContent modals={modals}>
                                        {children}
                                    </MainContent>
                                </AlertMessageContextProvider>

                            </body>
                        </PostInteractionContextProvider>
                    </BlockedUsersContextProvider>
                </FollowSuggestionContextProvider>
            </TrendingContextProvider>
        </UserContextProvider>
    )
}
