import { decryptSession, getToken } from "@/lib/session";
import { ProfileInfo } from "@/lib/types";
import { redirect } from "next/navigation";
import Image from "next/image";
import { CalendarDays } from 'lucide-react';
import EditProfileBtn from "@/components/profile/EditProfileBtn";
import ProfileContent from "@/components/profile/ProfileContent";

export default async function page({ params }: { params: { username: string } }) {
    const token = getToken();
    const payload = await decryptSession(token);

    if (!payload) return redirect('/login');

    const response = await fetch(`http://localhost:3000/api/users/${params.username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
    });
    const user = await response.json() as ProfileInfo;
    const createdAt = new Date(user.createdAt);
    const joined = `${createdAt.toLocaleDateString('default', { month: 'long' })} ${createdAt.getFullYear()}`;

    if (payload.username === params.username) {
        return (
            <section className='w-full h-fit'>
                <div className='profile-info'>
                    <div className='picture-banner-container'>
                        <Image 
                            src={user.profile.profilePicture}
                            alt='User profile picture'
                            height={100} width={100}
                            className='absolute bottom-0 left-5 translate-y-[50%] rounded-full' />
                        { user.profile.bannerPicture
                            ? <Image
                                src={user.profile.bannerPicture}
                                alt='User banner picture'
                                height={100} width={100}
                                className='w-full h-full' /> 
                            : <div className='w-full h-full bg-slate-200'></div>
                        }
                    </div>

                    <div className='edit-profile'>
                        <EditProfileBtn user={user} />
                    </div>

                    <div className='px-4 flex flex-col gap-2'>
                        <div>
                            <p className='font-bold text-18'>{user.profile.name}</p>
                            <p className='text-dark-500'>@{user.username}</p>
                        </div>
                        { user.profile.bio && (
                            <p className='profile-bio'>{user.profile.bio}</p>
                        )}

                        <div className='flex gap-2'>
                            <CalendarDays size={20} className='text-dark-500' />
                            <p className='text-dark-500 text-14'>
                                Joined {joined}
                            </p>
                        </div>
                        
                        <div className='flex gap-4'>
                            <p className='font-bold'>{user['_count'].following}
                                <span className='text-dark-500 font-normal'> Following</span>
                            </p>
                           <p className='font-bold'>{user['_count'].followers}
                                <span className='text-dark-500 font-normal'> Followers</span>
                            </p>
                        </div>

                        <div>
                            <ProfileContent username={user.username} />
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className='w-full h-fit'>
            <div className='profile-info'>
                <div>
                </div>
            </div>
        </section>
    )
}
