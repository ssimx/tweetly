import Image from "next/image"

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className='w-9/12 h-screen flex-center gap-x-80'>
        <section className='w-1/2 flex-center max-lg:hidden h-[500px]'>
            <Image src='' alt='Tweetly Logo' />
        </section>

        <section className='w-1/2 h-[700px]'>
            {children}
        </section>
    </main>
  )
}
