import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface userDataProps {
    username: string,
    birthDate: Date,
    email: string,
    hashedPassword: string,
};

export const createUserAndProfile = async (userData: userDataProps) => {
    return await prisma.$transaction(async (prisma) => {
        // Create user first
        const user = await prisma.user.create({
            data: {
                username: userData.username,
                email: userData.email,
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

        return { user, profile };
    });
};