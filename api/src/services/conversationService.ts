import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const getAllConversations = async (userId: number) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: userId,
                    isDeleted: false, // Ensure the conversation is not deleted by the user
                },
            },
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'desc', // Order messages by createdAt in descending order
                },
                take: 1, // Only take the latest message
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    readStatus: true,
                    sender: {
                        select: {
                            username: true,
                            profile: {
                                select: {
                                    name: true,
                                    profilePicture: true,
                                },
                            },
                        },
                    },
                    receiver: {
                        select: {
                            username: true,
                            profile: {
                                select: {
                                    name: true,
                                    profilePicture: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return conversations.map(conversation => ({
        conversationId: conversation.id,
        lastMessage: conversation.messages[0] || null,
    }));
};

// ---------------------------------------------------------------------------------------------------------

export const createConversation = async (senderId: number, receiverId: number) => {
    return await prisma.conversation.create({
        data: {
            participants: {
                createMany: {
                    data: [
                        {
                            userId: senderId
                        },
                        {
                            userId: receiverId
                        }
                    ]
                }
            }
        },
        select: {
            id: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getConversation = async (id: string) => {
    return await prisma.conversation.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            participants: {
                select: {
                    user: {
                        select: {
                            username: true,
                            createdAt: true,
                            profile: {
                                select: {
                                    profilePicture: true,
                                    name: true,
                                    bio: true,
                                }
                            },
                            _count: {
                                select: {
                                    followers: true,
                                }
                            }
                        }
                    }
                }
            },
            messages: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 25,
                select: {
                    id: true,
                    content: true,
                    readStatus: true,
                    createdAt: true,
                    updatedAt: true,
                    sender: {
                        select: {
                            username: true,
                        }
                    }
                },

            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getMessages = async (id: string, cursorId: string) => {
    return await prisma.conversation.findFirst({
        where: {
            id
        },
        select: {
            messages: {
                ...(cursorId && {
                    cursor: {
                        id: cursorId
                    },
                    skip: 1,
                }),
                orderBy: {
                    createdAt: 'desc'
                },
                take: 25,
                select: {
                    id: true,
                    content: true,
                    readStatus: true,
                    createdAt: true,
                    updatedAt: true,
                    sender: {
                        select: {
                            username: true,
                        }
                    }
                },

            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getFirstMessage = async (id: string) => {
    return prisma.conversation.findFirst({
        where: {
            id
        },
        select: {
            messages: {
                orderBy: {
                    createdAt: 'asc'
                },
                take: 1,
                select: {
                    id: true
                }
            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getConversationParticipans = async (conversationId: string) => {
    return await prisma.conversation.findUnique({
        where: {
            id: conversationId
        },
        select: {
            participants: {
                select: {
                    userId: true
                }
            }
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const createMessage = async (senderId: number, receiverId: number, content: string, conversationId: string) => {
    return await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content,
            conversationId
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            receiverId: true,
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getFirstReadMessage = async (conversationId: string, loggedInUserId: number) => {
    return await prisma.message.findFirst({
        where: {
            conversationId,
            senderId: {
                not: loggedInUserId,
            },
            readStatus: true
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            createdAt: true,
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateMessagesReadStatus = async (conversationId: string, loggedInUserId: number, firstReadMessageTimestamp: Date) => {
    return prisma.message.updateMany({
        where: {
            conversationId,
            senderId: {
                not: loggedInUserId,
            },
            createdAt: {
                gt: firstReadMessageTimestamp,
            },
            readStatus: false,
        },
        data: {
            readStatus: true,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const updateMessageReadStatus = async (conversationId: string, messageId: string) => {
    return prisma.message.update({
        where: {
            id: messageId,
            conversationId
        },
        data: {
            readStatus: true
        }
    })
};

