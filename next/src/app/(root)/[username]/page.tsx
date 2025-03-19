import Image from "next/image";
import ProfileDynamicInfo from "@/components/profile/ProfileDynamicInfo";
import { getUserProfile } from "@/data-acess-layer/user-dto";
import NotFound from './NotFound';

export default async function Profile(props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    const response = await getUserProfile(params.username);

    if (!response.success || !response.data.user) {
        return <NotFound username={params.username} />
    }

    const { user, authorized } = response.data;

    return (
        <section className='w-full min-h-screen h-fit grid grid-rows-[max-content,1fr]'>
            <div className='w-full h-[175px] md:h-[190px] lg:h-[200px]'>
                <div className='h-full relative'>
                    <Image
                        src={user.profile.profilePicture}
                        alt='User profile picture'
                        height={150} width={150}
                        className='profile-picture absolute bottom-0 left-5 translate-y-[50%] rounded-full border-primary-foreground border-4' />
                    {user.profile.bannerPicture
                        ? <Image
                            src={user.profile.bannerPicture}
                            alt='User banner picture'
                            height={1500} width={500}
                            className='w-full h-full' />
                        : <div className='w-full h-full bg-gray-500'></div>
                    }
                </div>
            </div>

            <ProfileDynamicInfo user={user} authorized={authorized} />
        </section>
    )
}
