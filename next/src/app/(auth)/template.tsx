import Image from "next/image";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className='w-9/12 h-screen flex flex-col items-center justify-center gap-y-[5%] md:flex-row gap-x-[10%]'>
        <section className='w-1/2 flex-center h-[100px] md:h-[500px]'>
            <Image src='/blackLogo.png' alt='Tweetly Logo' width='350' height='350' className='w-[100px] md:w-[350px]' />
        </section>

          <section className='w-full h-fit flex-center ml:w-auto '>
            {children}
        </section>
    </main>
  )
}
