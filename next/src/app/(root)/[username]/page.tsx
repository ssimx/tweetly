import Image from "next/image";
import ProfileDynamicInfo from "@/components/profile/ProfileDynamicInfo";
import { getUserProfile } from "@/data-acess-layer/user-dto";

export default async function Profile(props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    const user = await getUserProfile(params.username);

    return (
        <section className='w-full h-fit'>
            <div className='profile-info'>
                <div className='picture-banner-container'>
                    <Image
                        src={user.profile.profilePicture || 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png'}
                        alt='User profile picture'
                        height={100} width={100}
                        className='h-[100px] w-[100px] absolute bottom-0 left-5 translate-y-[50%] rounded-full border-[#ffffff] border-4' />
                    {user.profile.bannerPicture
                        ? <Image
                            src={user.profile.bannerPicture}
                            alt='User banner picture'
                            height={1500} width={500}
                            className='w-full h-full' />
                        : <div className='w-full h-full bg-slate-200'></div>
                    }
                </div>

                <ProfileDynamicInfo user={user} loggedInUser={user.authorized} />
            </div>
        </section>
    )
}
