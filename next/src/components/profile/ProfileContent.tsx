'use client';
import { profileContentTabs } from "@/constants";
import { ProfileInfo } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPostDate } from "@/lib/utils";
import PostBtns from "../posts/PostBtns";

export default function ProfileContent({ username }: { username: string }) {
    const [postsReposts, setPostsReposts] = useState();
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchPostsReposts = async () => {
            const postsPromise = fetch(`/api/posts/posts/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const repostsPromise = fetch(`/api/posts/reposts/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);
            
            const posts = await postsResponse.json();
            const reposts = await repostsResponse.json();

        }   
        
        fetchPostsReposts();
    }, [username]);

    return (
        // <div>
        //     <div className='profile-content-header'>
        //         {
        //             profileContentTabs.map((tab, index) => (
        //                 <div key={index} className='profile-content-header-btn'>
        //                     <button
        //                         className={`w-full h-full z-10 absolute ${activeTab === index ? 'text-black-1 font-bold' : 'text-dark-500 font-medium'}`}
        //                         onClick={() => setActiveTab(index)}>
        //                         {tab.name}
        //                     </button>

        //                     {activeTab === index && (
        //                         <div className='w-full flex-center'>
        //                             <div className='h-[4px] absolute rounded-xl bottom-0 bg-primary z-0'
        //                                 style={{ width: `${tab.name.length}ch` }}></div>
        //                         </div>
        //                     )}
        //                 </div>
        //             ))
        //         }
        //     </div>

        //     <div className='feed-hr-line'></div>

        //     <div className='profile-content-feed'>
        //         {activeTab === 0
        //             ? postsAndReposts.map((post, index) => (
        //                 <div key={index} className='post hover:bg-card-hover hover:cursor-pointer'>
        //                     {post.repost && (
        //                         <div>You reposted</div>
        //                     )}
        //                     <div>
        //                         <div className='post-header'>
        //                             <Link href={`/${post.post.user.username}`} className='group'>
        //                                 <Image
        //                                     src={post.post.user.profile.profilePicture}
        //                                     alt='Post author profile pic' width={35} height={35} className='w-[35px] h-[35px] rounded-full group-hover:outline group-hover:outline-primary/10' />
        //                             </Link>
        //                             <div className='flex gap-2 text-dark-500'>
        //                                 {/* <HoverCard>
        //                                         <HoverCardTrigger href={`/${post.post.user.username}`} className='text-black-1 font-bold hover:underline'>{post.author.profile?.name}</HoverCardTrigger>
        //                                         <HoverCardContent>
        //                                             <UserHoverCard
        //                                                 author={post.post.user}
        //                                                 followers={followers} setFollowers={setFollowers}
        //                                                 isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
        //                                         </HoverCardContent>
        //                                     </HoverCard> */}
        //                                 <p>@{post.post.user.username}</p>
        //                                 <p>·</p>
        //                                 <p>{formatPostDate(String(post.createdAt))}</p>
        //                             </div>
        //                         </div>

        //                         <div className='post-content'>
        //                             <p className='break-all'>{post.post.post.content}</p>
        //                         </div>
        //                         <div className='!border-t-0 post-btns'>
        //                             {/* <PostBtns post={post.post.post} /> */}
        //                         </div>
        //                     </div>
        //                 </div>
        //             ))
        //             : null
        //         }
        //     </div>
        // </div>
        <div></div>
    )
}
