import UserContextProvider from "@/context/UserContextProvider";
import FollowSuggestionContextProvider from "@/context/FollowSuggestionContextProvider";
import TrendingContextProvider from "@/context/TrendingContextProvider";
import { getLoggedInUser } from "@/data-acess-layer/user-dto";
import BlockedUsersContextProvider from "@/context/BlockedUsersContextProvider";
import PostInteractionContextProvider from "@/context/PostInteractionContextProvider";
import { redirect } from 'next/navigation';
import MainContent from '@/components/root-template/MainContent';
import AlertMessageContextProvider from '@/context/AlertMessageContextProvider';

export default async function AuthorizedLayout({ children, modals }: { children: React.ReactNode, modals: React.ReactNode }) {
    const userResponse = await getLoggedInUser();

    if (!userResponse.success || userResponse.data === undefined || userResponse.data.user === undefined) {
        console.error('Something went wrong while fetching user information');
        redirect('/logout');
    }

    return (
        <UserContextProvider userData={userResponse.data.user}>
            <TrendingContextProvider>
                <FollowSuggestionContextProvider>
                    <BlockedUsersContextProvider>
                        <PostInteractionContextProvider>
                            <AlertMessageContextProvider>

                                <body
                                    className={`h-dvh w-screen
                                    xs:mx-auto xs:justify-center xs:content-center
                                    xs:min-h-screen xs:w-[99%]
                                    xs:grid xs:grid-cols-[auto,1fr]
                                    sm:max-w-[680px]
                                    xl:max-w-[1300px]`
                                    }
                                >

                                    <MainContent modals={modals}>
                                        {children}
                                    </MainContent>

                                </body>

                            </AlertMessageContextProvider>
                        </PostInteractionContextProvider>
                    </BlockedUsersContextProvider>
                </FollowSuggestionContextProvider>
            </TrendingContextProvider>
        </UserContextProvider>
    )
}
