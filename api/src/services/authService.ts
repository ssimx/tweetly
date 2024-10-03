import { Prisma, PrismaClient } from '@prisma/client';
import { UserProps } from '../lib/types';
const prisma = new PrismaClient();

export const checkUserExsistence = async (username: string, email: string) => {
    const duplicate = await prisma.user.findFirst({
        where: {OR: [{username}, {email}] },
    });

    if (duplicate) return duplicate;
    return;
};

// ---------------------------------------------------------------------------------------------------------

interface userDataProps {
    username: string,
    birthDate: Date,
    email: string,
    hashedPassword: string,
};

type UserProfileResponse =
    | { user: UserProps }
    | { error: string; fields?: string[] };

export const createUserAndProfile = async (userData: userDataProps): Promise<UserProfileResponse> => {
    try {
        return await prisma.$transaction(async (prisma) => {
            // Create user first
            const user = await prisma.user.create({
                data: {
                    username: userData.username.toLocaleLowerCase(),
                    email: userData.email.toLocaleLowerCase(),
                    dateOfBirth: userData.birthDate,
                    password: userData.hashedPassword
                },
            });

            // Create profile for that user
            const profile = await prisma.profile.create({
                data: {
                    name: userData.username,
                    bio: '',
                    location: '',
                    websiteUrl: '',
                    profilePicture: '',
                    bannerPicture: '',
                    userId: user.id,
                },
            });

            return { user };
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Unique constraint violation (e.g. username or email already exists)
                return { error: 'Unique constraint violation', fields: (error.meta?.target as string[]) ?? [] };
            }
        }

        // Throw the error so it can be handled in the registerUser function
        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserLogin = async (username: string) => {
    return await prisma.user.findUnique({
        where: { username },
    });
};