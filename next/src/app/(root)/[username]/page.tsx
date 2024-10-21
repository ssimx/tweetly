import { decryptSession, getToken } from "@/lib/session";
import { ProfileInfo } from "@/lib/types";
import { redirect } from "next/navigation";
import Image from "next/image";
import ProfileDynamicInfo from "@/components/profile/ProfileDynamicInfo";

export default async function Profile({ params }: { params: { username: string } }) {
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

    return (
        <section className='w-full h-fit'>
            <div className='profile-info'>
                <div className='picture-banner-container'>
                    <Image
                        src={user.profile.profilePicture}
                        alt='User profile picture'
                        height={100} width={100}
                        className='h-[100px] w-[100px] absolute bottom-0 left-5 translate-y-[50%] rounded-full border-[#ffffff] border-4' />
                    {user.profile.bannerPicture
                        ? <Image
                            src={user.profile.bannerPicture}
                            alt='User banner picture'
                            height={100} width={100}
                            className='w-full h-full' />
                        : <div className='w-full h-full bg-slate-200'></div>
                    }
                </div>

                <ProfileDynamicInfo user={user} loggedInUser={payload.username === params.username} />
            </div>
        </section>
    )
}
