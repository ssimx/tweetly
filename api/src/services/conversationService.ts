import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------

export const getAllConversations = async (userId: number, cursor?: string) => {
    return await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: userId,
                    isDeleted: false,
                },
            },
            messages: {
                some: {},
            },
        },
        orderBy: {
            updatedAt: 'desc'
        },
        take: 10,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
            id: true,
            participants: {
                select: {
                    user: {
                        select: {
                            username: true,
                        }
                    }
                }
            },
            updatedAt: true,
            messages: {
                orderBy: {
                    createdAt: 'desc', // Order messages by createdAt in descending order
                },
                take: 1, // Only take the latest message
                select: {
                    id: true,
                    createdAt: true,
                    content: true,
                    images: true,
                    readAt: true,
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
};

// ---------------------------------------------------------------------------------------------------------

export const getOldestConversation = async (userId: number) => {
    return await prisma.conversation.findFirst({
        where: {
            participants: {
                some: {
                    userId,
                    isDeleted: false,
                }
            },
            messages: {
                some: {}
            }
        },
        orderBy: {
            updatedAt: 'asc'
        },
        select: {
            id: true,
        }
    });
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
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    readAt: true,
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

export const getLatestMessages = async (id: string) => {
    return await prisma.conversation.findFirst({
        where: {
            id
        },
        select: {
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 25,
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    readAt: true,
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

export const getLastMessage = async (id: string) => {
    return prisma.conversation.findFirst({
        where: {
            id
        },
        select: {
            messages: {
                orderBy: {
                    createdAt: 'desc'
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

export const getFirstUnreadMessage = async (conversationId: string, loggedInUserId: number) => {
    return await prisma.message.findFirst({
        where: {
            conversationId,
            senderId: {
                not: loggedInUserId,
            },
            readAt: null,
        },
        orderBy: {
            createdAt: 'asc',
        },
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            readAt: true,
            sender: {
                select: {
                    username: true,
                }
            }
        },
    });
};

// ---------------------------------------------------------------------------------------------------------

export const getOlderMessages = async (id: string, cursorId: string) => {
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
                    createdAt: 'desc',
                },
                take: 25,
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    readAt: true,
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

export const getNewerMessages = async (id: string, cursorId: string) => {
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
                    createdAt: 'asc',
                },
                take: 25,
                select: {
                    id: true,
                    content: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    readAt: true,
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

export const createMessage = async (senderId: number, receiverId: number, content: string, images: string[], conversationId: string) => {
    return await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content,
            images,
            conversationId
        },
        select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            senderId: true,
            receiverId: true
        }
    });
};

// ---------------------------------------------------------------------------------------------------------

export const updateMessagesReadStatus = async (conversationId: string, loggedInUserId: number, firstUnreadMessageTimestamp: Date) => {
    return prisma.message.updateMany({
        where: {
            conversationId,
            // update status for messages of the other party
            senderId: {
                not: loggedInUserId,
            },
            createdAt: {
                gte: firstUnreadMessageTimestamp,
            },
            readAt: null,
        },
        data: {
            readAt: new Date(),
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const updateMessageReadStatus = async (conversationId: string, messageId: string) => {
    return prisma.message.update({
        where: {
            id: messageId,
            conversationId,
            readAt: null,
        },
        data: {
            readAt: new Date(),
        },
        select: {
            sender: {
                select: {
                    username: true,
                }
            },
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const updateConversationUpdatedAtTime = async (conversationId: string, time: Date) => {
    return prisma.conversation.update({
        where: {
            id: conversationId
        },
        data: {
            updatedAt: time,
        }
    })
};

// ---------------------------------------------------------------------------------------------------------

export const getMessagesReadStatus = async (userId: number) => {
    return await prisma.message.findFirst({
        where: {
            receiverId: userId,
            readAt: undefined,
        },
        select: {
            id: true,
        }
    })
};