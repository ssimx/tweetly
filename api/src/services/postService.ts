import { Post, Prisma, PrismaClient, Profile, User } from '@prisma/client';
import { UserProps } from '../lib/types';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

interface NewPostDataProps {
    text: string,
    replyToId?: number,
    user: UserProps,
}

type NewPostResponse =
    | { post: Post }
    | { error: string; fields?: string[] };

export const createPost = async (postData: NewPostDataProps): Promise<NewPostResponse> => {
    try {
        const post = await prisma.post.create({
            data: {
                content: postData.text,
                authorId: postData.user.id,
                replyToId: postData.replyToId,
            }
        })

        return { post };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (error.code === 'P2002') {
                console.log(
                    'There is a content length constraint violation, a new post cannot exceed 280 characters'
                )
            }
        }

        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getPost = async (id: number) => {
    return await prisma.post.findUnique({
        where: { id },
    })
};