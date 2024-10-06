import { Prisma, PrismaClient } from '@prisma/client';
import { UserProps } from '../lib/types';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const getUser = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            dateOfBirth: true,
            profile: { // include profile information
                select: {
                    name: true,
                    bio: true,
                    location: true,
                    websiteUrl: true,
                    profilePicture: true,
                    bannerPicture: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getProfile = async (username: string) => {
    return await prisma.user.findUnique({
        where: {
            username,
        },
        select: {
            username: true,
            profile: {
                select: {
                    name: true,
                    bio: true,
                    location: true,
                    websiteUrl: true,
                    profilePicture: true,
                    bannerPicture: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

