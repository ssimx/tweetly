import Image from "next/image";
import TweetlyLogoWhite from '@public/white.png';
import TweetlyLogoBlack from '@public/black.png';
import { cookies } from 'next/headers';

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const savedTheme = Number((await cookies()).get("theme")?.value) || 0;

    return (
        <body>
            <main className='w-9/12 h-screen flex flex-col items-center justify-center gap-y-[5%] md:flex-row gap-x-[10%]'>
                <section className='w-1/2 flex-center h-[100px] md:h-[500px]'>
                    <Image src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite} alt='Tweetly Logo' width='350' height='350' className='w-[100px] md:w-[350px]' />
                </section>

                <section className='w-full h-fit flex-center ml:w-auto '>
                    {children}
                </section>
            </main>
        </body>
    )
}
