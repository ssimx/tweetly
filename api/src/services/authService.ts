import { Prisma, PrismaClient } from '@prisma/client';
import { UserProps } from '../lib/types';
import { getErrorMessage } from '../utils/errorMessageHandler';
const prisma = new PrismaClient();

export const checkUsernameAvailability = async (username: string) => {
    return prisma.user.findUnique({
        where: {
            username: username
        },
        select: {
            id: true
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const checkEmailAvailability = async (email: string) => {
    const user = prisma.user.findUnique({
        where: {
            email: email
        },
        select: {
            id: true
        }
    });

    if (user) return user;

    const tempUser = prisma.temporaryUser.findUnique({
        where: {
            email: email
        },
        select: {
            id: true
        }
    });

    return tempUser;
};

// ---------------------------------------------------------------------------------------------------------

export const createTemporaryUser = async (profileName: string, email: string, dateOfBirth: Date, hashedPassword: string) => {
    try {
        return await prisma.temporaryUser.create({
            data: {
                profileName,
                email,
                dateOfBirth,
                password: hashedPassword
            },
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

export const updateTemporaryUserUsername = async (userId: number, username: string) => {
    try {
        return await prisma.temporaryUser.update({
            where: {
                id: userId,
            },
            data: {
                username: username
            }
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

export const updateTemporaryUserProfilePicture = async (userId: number, image: string) => {
    return await prisma.temporaryUser.update({
        where: {
            id: userId,
        },
        data: {
            profilePicture: image
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const removeTemporaryUser = async (userId: number) => {
    return await prisma.temporaryUser.delete({
        where: {
            id: userId,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const createUserAndProfile = async (profileName: string, email: string, dateOfBirth: Date, hashedPassword: string, username: string, profilePicture: string) => {
    try {
        return await prisma.$transaction(async (prisma) => {
            // Create user first
            const user = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    dateOfBirth: dateOfBirth,
                    password: hashedPassword,
                },
            });

            // Create profile for that user
            const profile = await prisma.profile.create({
                data: {
                    name: profileName,
                    bio: '',
                    location: '',
                    websiteUrl: '',
                    profilePicture: profilePicture,
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

export const getUserLogin = async (usernameOrEmail: string) => {
    const isEmail = usernameOrEmail.includes('@');

    if (isEmail) {
        return await prisma.user.findUnique({
            where: {
                email: usernameOrEmail
            },
        });
    } else {
        return await prisma.user.findUnique({
            where: {
                username: usernameOrEmail
            },
        });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getTemporaryUserLogin = async (usernameOrEmail: string) => {
    const isEmail = usernameOrEmail.includes('@');

    if (isEmail) {
        return await prisma.temporaryUser.findUnique({
            where: {
                email: usernameOrEmail
            },
        });
    } else {
        return await prisma.temporaryUser.findUnique({
            where: {
                username: usernameOrEmail
            },
        });
    }
};