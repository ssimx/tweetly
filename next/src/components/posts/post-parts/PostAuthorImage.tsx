import Image from 'next/image';
import Link from 'next/link';
import { UserDataType } from 'tweetly-shared';

export default function PostAuthorImage({ author }: { author: UserDataType }) {
  return (
      <Link href={`/${author.username}`} className='flex group' onClick={(e) => e.stopPropagation()}>
          <Image
              src={author.profile.profilePicture}
              alt='Post author profile pic'
              width={40} height={40}
              className='w-[40px] h-[40px] rounded-full group-hover:outline group-hover:outline-primary/10' />
      </Link>
  )
}
