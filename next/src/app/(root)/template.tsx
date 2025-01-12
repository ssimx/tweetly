import TemplateHeader from "@/components/root-template/Header";
import LeftSidebar from "@/components/root-template/left-sidebar/LeftSidebar";
import PhoneBottomNav from "@/components/root-template/PhoneBottomNav";
import RightSidebar from "@/components/root-template/right-sidebar/RightSidebar";
import UserContextProvider from "@/context/UserContextProvider";
import FollowSuggestionContextProvider, { FollowSuggestionType } from "@/context/FollowSuggestionContextProvider";
import { decryptSession, getToken } from "@/lib/session";
import { UserInfo } from "@/lib/types";
import { redirect } from "next/navigation";
import TrendingContextProvider, { TrendingHashtagType } from "@/context/TrendingContextProvider";
import { getErrorMessage } from "@/lib/utils";

const fetchLoggedInUserData = async (token: string): Promise<UserInfo> => {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'force-cache',
            next: { tags: ['user'] },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        return await response.json() as UserInfo;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return redirect('/logout');
    }
};

const fetchFollowSuggestions = async (token: string): Promise<FollowSuggestionType[]> => {
    try {
        const response = await fetch('http://localhost:3000/api/users/followSuggestions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            next: { 
                tags: ['followSuggestions'] 
            }, // refetch every 5 minutes
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const followSuggestions = await response.json() as FollowSuggestionType[];
        const mappedUsers: FollowSuggestionType[] = followSuggestions.map((user: Omit<FollowSuggestionType, 'isFollowing'>) => {
            return { ...user, isFollowing: false };
        });

        return mappedUsers;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error fetching trending hashtags:', errorMessage);
        return [];
    }
};

const fetchTrendingHashtags = async (token: string): Promise<TrendingHashtagType[]> => {
    try {
        const response = await fetch('http://localhost:3000/api/posts/trending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            next: { revalidate: 300 }, // refetch every 5 minutes
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const hashtags = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'hashtags' in res) {
                return res.hashtags as TrendingHashtagType[];
            }
            return [];
        });
        return hashtags;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error fetching follow suggestions:', errorMessage);
        return [];
    }
};

export default async function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
    const token = await getToken();
    if (!token) return redirect('/login');
    const payload = await decryptSession(token);
    if (!payload) return redirect('/login');

    console.log('remount')

    const userPromise = fetchLoggedInUserData(token);
    const followSuggestionsPromise = fetchFollowSuggestions(token);
    const trendingHashtagsPromise = fetchTrendingHashtags(token);

    const [user, followSuggestions, trendingHashtags] = await Promise.all([userPromise, followSuggestionsPromise, trendingHashtagsPromise]);

    return (
        <UserContextProvider userData={user}>
            <TrendingContextProvider trendingHashtags={trendingHashtags}>
                <FollowSuggestionContextProvider followSuggestions={followSuggestions}>
                    <main className="w-screen h-auto">
                        <div className="root-phone xs:root-desktop">
                            <div className='left-sidebar-wrapper'>
                                <LeftSidebar />
                            </div>
                            <div className='main-content'>
                                <div className='border-x grid grid-cols-1 grid-rows-main-content border-b border-primary-border'>
                                    <TemplateHeader />
                                    {children}
                                </div>
                                <div className='right-sidebar-wrapper'>
                                    <RightSidebar />
                                </div>
                            </div>
                            <PhoneBottomNav />
                        </div>
                    </main>
                </FollowSuggestionContextProvider>
            </TrendingContextProvider>
        </UserContextProvider>
    )
}
