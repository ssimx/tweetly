import { Prisma, PrismaClient } from '@prisma/client';
import { UserProps } from '../lib/types';
import { getErrorMessage } from '../utils/errorMessageHandler';
const prisma = new PrismaClient();

export const checkUserExsistence = async (username: string, email: string) => {
    const duplicate = await prisma.user.findFirst({
        where: {OR: [{username}, {email}] },
    });

    if (duplicate) return duplicate;
    return;
};

// ---------------------------------------------------------------------------------------------------------

export const createUserAndProfile = async (username: string, email: string, dateOfBirth: Date, hashedPassword: string) => {
    try {
        return await prisma.$transaction(async (prisma) => {
            // Create user first
            const user = await prisma.user.create({
                data: {
                    username: username.toLocaleLowerCase(),
                    email: email.toLocaleLowerCase(),
                    dateOfBirth: dateOfBirth,
                    password: hashedPassword,
                },
            });

            // Create profile for that user
            const profile = await prisma.profile.create({
                data: {
                    name: username,
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

        return { error: getErrorMessage(error), fields: [] };
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserLogin = async (username: string) => {
    return await prisma.user.findUnique({
        where: { username },
    });
};