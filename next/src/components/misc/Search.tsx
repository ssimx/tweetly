'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { z } from "zod";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTrendingContext } from '@/context/TrendingContextProvider';
import SearchUserCard from '../root-template/right-sidebar/SearchUserCard';
import { AppError, getErrorMessage, isZodError, SearchQuerySegmentsType, searchSchema, SearchType, SuccessResponse, UserDataType } from 'tweetly-shared';
import { debounce } from 'lodash';
import { getUsersBySearch } from '@/actions/get-actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ClipLoader from 'react-spinners/ClipLoader';

interface SearchResponseType {
    users: UserDataType[],
    queryParams: SearchQuerySegmentsType,
};

type SearchedQueriesMap = Map<string, SearchResponseType>;

export default function Search() {
    const { hashtags } = useTrendingContext();
    const router = useRouter();
    const pathname = usePathname();

    const searchParams = useSearchParams();
    const searchQuery = (pathname.startsWith('/search') || pathname.startsWith('/explore')) ? searchParams.get('q') : null;

    const [searchedQueries, setSearchedQueries] = useState<SearchedQueriesMap>(new Map());
    const [searched, setSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isOutputVisible, setIsOutputVisible] = useState(false);
    const [searchResponse, setSearchResponse] = useState<SearchResponseType | undefined>(undefined);
    const [matchedHashtags, setMatchedHashtags] = useState<string[]>([]);
    const searchContainer = useRef<HTMLDivElement | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        watch,
    } = useForm<SearchType>({
        resolver: zodResolver(searchSchema),
        defaultValues: { q: searchQuery || '' }
    });

    const queryWatch = watch('q');

    const executeSearch = useCallback(
        (query: string) => {
            const debouncedSearch = debounce(async (queryToSearch: string) => {
                if (!queryToSearch) {
                    return;
                }

                try {
                    searchSchema.parse({ q: queryToSearch.trim() });
                    const encodedSearch = encodeURIComponent(queryToSearch.trim());

                    // Check if search query is already cached to avoid uneccessary fetching
                    if (searchedQueries.has(queryToSearch.trim())) {
                        setSearchResponse(searchedQueries.get(queryToSearch.trim()));
                        return;
                    }

                    const response = await getUsersBySearch(encodedSearch);

                    if (!response.success) {
                        if (response.error.details) throw new z.ZodError(response.error.details);
                        else throw new Error(response.error.message);
                    }

                    const { data } = response as SuccessResponse<{ users: UserDataType[], queryParams: SearchQuerySegmentsType }>;
                    if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                    else if (data.users === undefined) throw new AppError('Users property is missing in data response', 404, 'MISSING_PROPERTY');
                    else if (data.queryParams === undefined) throw new AppError('Query params property is missing in data response', 404, 'MISSING_PROPERTY');

                    if (searchedQueries.size === 1000) {
                        // if map is full, clear it
                        const newMap = new Map() as SearchedQueriesMap;
                        newMap.set(queryToSearch.trim(), { users: data.users, queryParams: data.queryParams });
                        setSearchedQueries(() => newMap);
                        setSearchResponse(data);
                        return;
                    }

                    setSearchedQueries((current) => current.set(queryToSearch.trim(), { users: data.users, queryParams: data.queryParams }));
                    setSearchResponse(data);
                } catch (error: unknown) {
                    if (isZodError(error)) {
                        error.issues.forEach((detail) => {
                            if (detail.path && detail.message) {
                                setError(detail.path[0] as keyof SearchType, {
                                    type: 'manual',
                                    message: detail.message
                                });
                            }
                        });
                    } else {
                        const errorMessage = getErrorMessage(error);
                        console.error('Error:', errorMessage);
                    }
                } finally {
                    setIsSearching(false);
                    setSearched(true);
                }
            }, 500);

            debouncedSearch(query);
            return debouncedSearch;
        },
        [searchedQueries, setError]
    );

    // Call the debounced function when search query changes
    useEffect(() => {
        // For cancel method
        let debouncedCheckFn: ReturnType<typeof debounce> | null = null;
        setSearched(false);
        setIsSearching(true);

        // Match trending hashtags based on the search text
        const matchedHashtags = hashtags && hashtags.filter((hashtag) => {
            const words = queryWatch.toLowerCase().replaceAll('#', '').split(' ');
            return words.some((word) => hashtag.name.toLowerCase().includes(word));
        }).map((hashtag) => hashtag.name);

        setMatchedHashtags(matchedHashtags ?? []);

        if (queryWatch && !isSubmitting) {
            if (queryWatch === searchQuery) return;
            setIsOutputVisible(true);
            debouncedCheckFn = executeSearch(queryWatch);
        }

        // Cleanup debounced function on unmount or when dependencies change
        return () => {
            if (debouncedCheckFn) {
                debouncedCheckFn.cancel();
            }
        };
    }, [queryWatch, searchQuery, executeSearch, isSubmitting, hashtags]);

    const onSubmit = async (formData: SearchType) => {
        if (isSubmitting) return;
        setIsOutputVisible(false);
        const validatedSearch = searchSchema.parse(formData);
        if (validatedSearch.q === searchQuery) return;

        const encodedSearch = encodeURIComponent(validatedSearch.q);
        router.push(`/search?q=${encodedSearch}`);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainer.current && !searchContainer.current.contains(event.target as Node)) {
            setIsOutputVisible(false);
        }
    };

    useEffect(() => {
        if (isOutputVisible) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [isOutputVisible]);

    return (
        <div className='relative'>
            <div ref={searchContainer} className=''>
                <form onSubmit={handleSubmit(onSubmit)} className='h-fit'>
                    <label className="h-[50px] flex items-center gap-3 text-gray-400 rounded-[25px] border px-4">
                        <SearchIcon size={16} className='min-w-[16px]'/>
                        <input
                            {...register('q')}
                            type="search"
                            className='w-full outline-none text-primary-text'
                            placeholder="Search"
                            autoComplete="off"
                            onClick={() => setIsOutputVisible(queryWatch.length === 0 ? false : true)} />
                        {errors.q?.message && (
                            <p className='error-msg'>{errors.q.message}</p>
                        )}
                    </label>
                </form>
            </div>

            {isOutputVisible && queryWatch.length !== 0 && queryWatch !== searchQuery &&
                (
                    <div className='search-output-container relative z-50'>
                        <div className='flex flex-col'>
                            <Link href={`/search?q=${encodeURIComponent(`${queryWatch}`)}`} className='search-text-output'>
                                <SearchIcon size={26} strokeWidth={3} className='min-w-[26px] text-primary-text' />
                                <p>{queryWatch}</p>
                            </Link>

                            {/* Display matched hashtags */}
                            {matchedHashtags.map((hashtag, index) => (
                                <Link key={index} href={`/search?q=${encodeURIComponent(`#${hashtag}`)}`} className='search-text-output'>
                                    <p>#{hashtag}</p>
                                </Link>
                            ))}
                        </div>

                        {/* If it's searching for a user, display loading state */}
                        {!queryWatch.includes('#') && isSearching && (
                            <div>
                                <div className='feed-hr-line'></div>
                                <div className='w-full flex justify-center p-3'>
                                    <ClipLoader
                                        className='loading-spinner'
                                        loading={true}
                                        size={25}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Otherwise display fetched users if any returned */}
                        {!queryWatch.includes('#') && !isSearching && searched && (
                            <div>
                                <div className='feed-hr-line'></div>
                                <div className=''>
                                    {searchResponse &&
                                        searchResponse.users.length === 0
                                        ? <div className='p-3'>No users found</div>
                                        : searchResponse && searchResponse.users.slice(0, 5).map((user) => (
                                            <SearchUserCard key={user.username} user={user} />
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                )}
        </div>
    )
}
