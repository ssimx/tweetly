import { Prisma, PrismaClient, Profile, User } from '@prisma/client';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

interface userDataProps {
    username: string,
    birthDate: Date,
    email: string,
    hashedPassword: string,
};

type UserProfileResponse =
    | { user: User }
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

export const getUser = async (username: string) => {
    return await prisma.user.findUnique({
        where: { username },
    });
};