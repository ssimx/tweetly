import Image from "next/image";
import TweetlyLogoWhite from '@/assets/white.png';
import TweetlyLogoBlack from '@/assets/black.png';
import { cookies } from 'next/headers';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const savedTheme = Number((await cookies()).get("theme")?.value) || 0;

    return (
        <body className='h-svh max-h-svh w-[90%] max-w-[90%] sm:h-screen sm:max-h-screen'>
            <main className='w-full h-full flex flex-col items-center justify-center gap-y-[5%] py-[5%] md:flex-row md:gap-x-[10%]'>
                <section className='h-auto md:h-auto'>
                    <Image
                        src={savedTheme === 0 ? TweetlyLogoBlack : TweetlyLogoWhite}
                        alt='Tweetly Logo'
                        width='350'
                        height='350'
                        className='w-[15vw] md:w-[30vw] md:max-w-[250px]'
                    />
                </section>

                <section className='w-full h-fit flex-center md:w-fit md:min-w-[400px]'>
                    {children}
                </section>
            </main>
        </body>
    )
}
