import { Prisma, PrismaClient } from '@prisma/client';
import { ProfileInfo, UserProps } from '../lib/types';
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
            createdAt: true,
            profile: {
                select: {
                    name: true,
                    bio: true,
                    location: true,
                    websiteUrl: true,
                    profilePicture: true,
                    bannerPicture: true,
                }
            },
            followers: {
                select: {
                    follower: {
                        select: {
                            username: true,
                            profile: { // include profile information
                                select: {
                                    name: true,
                                    bio: true,
                                    profilePicture: true,
                                }
                            },
                            _count: {
                                select: {
                                    followers: true,
                                    following: true,
                                }
                            }
                        }
                    }
                }
            },
            following: {
                select: {
                    follower: {
                        select: {
                            username: true,
                            profile: { // include profile information
                                select: {
                                    name: true,
                                    bio: true,
                                    profilePicture: true,
                                }
                            },
                            _count: {
                                select: {
                                    followers: true,
                                    following: true,
                                }
                            }
                        }
                    }
                }
            },
            posts: true,
            repostedPosts: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                }
            }
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateProfile = async (id: number, data: ProfileInfo) => {
    return await prisma.profile.update({
        where: {
            id: id,
        },
        data: {
            name: data.name,
            bio: data.bio,
            location: data.location,
            websiteUrl: data.website,
            bannerPicture: data.bannerPicture,
            profilePicture: data.profilePicture
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getUserId = async (username: string) => {
    return await prisma.user.findUnique({
        where: {
            username: username,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const addFollow = async (user: number, username: string) => {
    const followee = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true
        }
    });

    if (!followee) {
        throw new Error('User not found');
    }

    try {
        return await prisma.follow.create({
            data: {
                followerId: user,
                followeeId: followee.id
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw { error: 'Unique constraint violation' };
            }
        }

        throw error;
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeFollow = async (followerId: number, username: string) => {
    const followeeId = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true
        }
    }).then((res) => res?.id);

    if (!followeeId) {
        throw new Error('User not found');
    }

    return await prisma.follow.delete({
        where: {
            followId: { followerId, followeeId }
        }
    });
};