'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { z } from "zod";
import { searchSchema } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import SearchUserCard from './root-template/right-sidebar/SearchUserCard';

export interface SearchResponseType {
    users: {
        username: string;
        profile: {
            name: string;
            profilePicture: string;
        };
    }[],
    queryParams: {
        raw: string,
        segments: string[],
        stringSegments: string[],
        usernames: string[],
        hashtags: string[],
    }
}

export default function Search({ searchQuery }: { searchQuery?: string }) {
    const [text, setText] = useState(searchQuery ? searchQuery : '');
    const [searched, setSearched] = useState(false);
    const [outputVisible, setOutputVisible] = useState(false);
    const [searchResponse, setSearchResponse] = useState<SearchResponseType | undefined>(undefined);
    const searchContainer = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!text) {
                setSearched(false);
                return;
            }

            // hide output on the first render on the search page
            if (text === searchQuery && searched === false) return;

            try {
                // Decode query before validation
                const decodedSearch = decodeURIComponent(text);
                searchSchema.parse({ q: decodedSearch });

                // Encode query for API requests
                const encodedSearch = encodeURIComponent(decodedSearch);

                const searchResponse = await fetch(`/api/search/users?q=${encodedSearch}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const searchOutput = await searchResponse.json() as SearchResponseType;

                if (searchOutput.users.length !== 0) {
                    // Prioritize user results by match specificity
                    const prioritizedUsers = searchOutput.users.map((user) => {
                        const { username, profile } = user;
                        const name = profile?.name || "";
                        let priority = 0;

                        searchOutput.queryParams.usernames.forEach((term) => {
                            if (username.toLowerCase() === term.toLowerCase()) {
                                priority += 3; // Exact match to username
                            } else if (username.toLowerCase().startsWith(term.toLowerCase())) {
                                priority += 2; // Starts with username
                            } else if (username.toLowerCase().includes(term.toLowerCase())) {
                                priority += 1; // Partial match to username
                            }

                            if (name.toLowerCase() === term.toLowerCase()) {
                                priority += 3; // Exact match to name
                            } else if (name.toLowerCase().startsWith(term.toLowerCase())) {
                                priority += 2; // Starts with name
                            } else if (name.toLowerCase().includes(term.toLowerCase())) {
                                priority += 1; // Partial match to name
                            }
                        });

                        return { ...user, priority };
                    });

                    // Sort by priority in descending order
                    searchOutput.users = prioritizedUsers.sort((a, b) => b.priority - a.priority);
                }

                console.log(searchOutput.users);

                setSearchResponse(searchOutput);
                setSearched(true);
                setOutputVisible(true);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    router.push('http://localhost:3000/');
                }

                console.error("Fetch error:", error);
            }
        }, 500);

        return (() => {
            clearTimeout(timeout);
        });
    }, [text, router, searchQuery]);

    const handleClickOutside = (event: MouseEvent) => {
        console.log(event.target);

        if (searchContainer.current && !searchContainer.current.contains(event.target as Node)) {
            setOutputVisible(false);
        }
    };

    useEffect(() => {
        if (outputVisible) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [outputVisible]);

    return (
        <div className='relative w-full'>
            <div ref={searchContainer} className='w-full'>
                <form action='search' className='h-fit w-full'>
                    <label className="h-[50px] w-full flex items-center gap-4 text-gray-400 rounded-[25px] border px-4">
                        <SearchIcon size={18} />
                        <input
                            type="search"
                            name="q"
                            className='outline-none text-black-1'
                            placeholder="Search"
                            autoComplete="off"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onClick={() => setOutputVisible(text.length === 0 ? false : text === searchQuery ? false : true)} />
                    </label>
                </form>
            </div>

            {outputVisible && text.length !== 0 && (
                <div className='search-output-container relative z-50'>
                    <Link href={`/search?q=${text}`} className='search-text-output'>
                        <SearchIcon size={26} color='#000000' strokeWidth={3} className='min-w-[26px]' />
                        <p>{text}</p>
                    </Link>

                    {searched
                        ? <div>
                            <div className='feed-hr-line'></div>
                            <div className=''>
                                {searchResponse &&
                                    searchResponse.users.length === 0
                                    ? <div className='p-3'>No users found</div>
                                    : searchResponse && searchResponse.users.map((user, index) => (
                                        <SearchUserCard key={index} user={user} />
                                    ))
                                }
                            </div>
                        </div>
                        : <div>
                            <div className='feed-hr-line'></div>
                            <div className='p-3'>Loading...</div>
                        </div>
                    }
                </div>
            )
            }
        </div>
    )
}
