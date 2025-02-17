const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
const { generateUsername } = require("unique-username-generator");

const UserRole = {
    USER: 'USER',
    ADMIN: 'ADMIN',
};

const date30daysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

const hashtags = [
    // 50 total hashtags, with the first 20 being "popular"
    'javascript', 'nodejs', 'reactjs', 'webdevelopment', 'coding', 'programming', 'developer', 'tech', 'angular', 'html',
    'css', 'typescript', 'frontend', 'backend', 'webdev', 'devlife', 'opensource', 'computerscience', 'softwareengineering', 'fullstack',
    'ai', 'machinelearning', 'data', 'bigdata', 'iot', 'cloudcomputing', 'security', 'databases', 'blockchain', 'web3',
    'reactnative', 'flutter', 'expressjs', 'vuejs', 'nextjs', 'gatsby', 'tailwindcss', 'bootstrap', 'sass', 'webpack',
    'redux', 'firebase', 'graphql', 'api', 'npm', 'yarn', 'jest', 'testing', 'docker', 'kubernetes', 'terraform',
    'java', 'python', 'ruby', 'php', 'go', 'swift', 'csharp', 'dart', 'elixir', 'rust'
];

// Randomize hashtags
function getRandomHashtags() {
    // Select a random number of hashtags from the list, prioritizing popular hashtags
    const popularHashtags = hashtags.slice(0, 20);
    const allHashtags = hashtags;

    // Ensure that popular hashtags are chosen more often
    const hashtagsCount = faker.number.int({ min: 1, max: 2 });
    let selectedHashtags = [];

    // Add popular hashtags with higher frequency
    for (let i = 0; i < hashtagsCount; i++) {
        const hashtag = faker.helpers.arrayElement(popularHashtags);
        selectedHashtags.push(`#${hashtag}`);
    }

    // Fill with additional random hashtags
    if (selectedHashtags.length < 5) {
        for (let i = selectedHashtags.length; i < Math.random() * (5 - selectedHashtags.length); i++) {
            const hashtag = faker.helpers.arrayElement(allHashtags);
            selectedHashtags.push(`#${hashtag}`);
        }
    }

    return selectedHashtags.join(' '); // Return the hashtags as a string
}

function getRandomUsernameLength() {
    // Define possible lengths and their weights
    const lengthOptions = [
        { length: 3, weight: 10 },  // 10% chance for length 3
        { length: 4, weight: 10 },  // 10% chance for length 4
        { length: 5, weight: 15 },  // 15% chance for length 5
        { length: 6, weight: 10 },   // 10% chance for length 6
        { length: 7, weight: 15 },   // 15% chance for length 7
        { length: 8, weight: 12 },   // 12% chance for length 8
        { length: 9, weight: 8 },    // 8% chance for length 9
        { length: 10, weight: 7 },   // 7% chance for length 10
        { length: 11, weight: 3 },   // 3% chance for length 11
        { length: 12, weight: 2 },   // 2% chance for length 12
        { length: 13, weight: 2 },   // 2% chance for length 13
        { length: 14, weight: 1 },   // 1% chance for length 14
        { length: 15, weight: 1 },   // 1% chance for length 15
    ];

    // Calculate the total weight
    const totalWeight = lengthOptions.reduce((sum, option) => sum + option.weight, 0);

    // Randomly select a length based on weights
    const randomNum = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const option of lengthOptions) {
        cumulativeWeight += option.weight;
        if (randomNum < cumulativeWeight) {
            return option.length;
        }
    }
}

async function main() {

    const createNotificationTypes = async () => {
        const notificationTypes = [
            { name: 'POST', description: 'posted' },
            { name: 'REPLY', description: 'replied to' },
            { name: 'REPOST', description: 'reposted' },
            { name: 'LIKE', description: 'liked' },
            { name: 'FOLLOW', description: 'followed you' },
        ];

        for (const type of notificationTypes) {
            await prisma.notificationType.create({
                data: {
                    name: type.name,
                    description: type.description,
                },
            });
        }
    };
    await createNotificationTypes();

    console.log("Seeding database...");

    const hashedPassword = await bcrypt.hash('tweetly', 10);

    // Create 100 users with profiles
    const users = await Promise.all(
        Array.from({ length: 100 }).map(async () => {
            const userCreatedAt = faker.date.recent({ days: 90, refDate: date30daysAgo });

            const randomizedUsernameLength = getRandomUsernameLength();
            const usernameAndName = generateUsername("", 3, randomizedUsernameLength).replaceAll('-', '');

            // Upsert user data
            const user = await prisma.user.upsert({
                where: {
                    username: usernameAndName, // Unique constraint
                },
                update: {
                    email: faker.internet.email().slice(0, 254),
                    password: hashedPassword,
                    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
                    role: UserRole.USER,
                    createdAt: userCreatedAt,
                },
                create: {
                    username: usernameAndName,
                    email: faker.internet.email().slice(0, 254),
                    password: hashedPassword,
                    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
                    role: UserRole.USER,
                    createdAt: userCreatedAt,
                },
            });

            // Now upsert the profile using the user ID
            await prisma.profile.upsert({
                where: {
                    userId: user.id, // Now user is initialized and we can access user.id
                },
                create: {
                    name: generateUsername("", Math.random() * 3, 25, usernameAndName),
                    bio: faker.lorem.sentence().slice(0, 160),
                    location: faker.location.city().slice(0, 30),
                    websiteUrl: faker.internet.url().slice(0, 100),
                    profilePicture: 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png',
                    bannerPicture: '',
                    userId: user.id, // Link profile to user
                },
                update: {
                    name: generateUsername("", Math.random() * 3, 25, usernameAndName),
                    bio: faker.lorem.sentence().slice(0, 160),
                    location: faker.location.city().slice(0, 30),
                    websiteUrl: faker.internet.url().slice(0, 100),
                    profilePicture: 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png',
                    bannerPicture: '',
                },
            });

            return user;
        })
    );

    console.log('users done');
    
    // Create random follows
    for (const user of users) {
        const followCount = faker.number.int({ min: 0, max: 100 });
        const followees = faker.helpers.arrayElements(users, followCount);

        for (const followee of followees) {
            if (user.id !== followee.id) {
                const followCreatedAt = faker.date.between({
                    from: followee.createdAt,
                    to: Date.now()
                });

                // Ensure the follow timestamp doesn't precede the follower's own registration
                if (followCreatedAt > user.createdAt && followCreatedAt > followee.createdAt) {
                    await prisma.follow.upsert({
                        where: {
                            followId: { followerId: user.id, followeeId: followee.id },
                        },
                        update: {},
                        create: {
                            followerId: user.id,
                            followeeId: followee.id,
                            createdAt: followCreatedAt,
                        },
                    });

                    // Create FOLLOW notification for the new follower
                    await prisma.notification.create({
                        data: {
                            typeId: 5,
                            notifierId: followee.id, // The user who followed
                            receiverId: user.id, // The user being followed
                            createdAt: followCreatedAt,
                        },
                    });
                }
            }
        }
    }

    console.log('follows done');

    // Create random push notifications only for users that user is following
    for (const user of users) {
        const followees = await prisma.follow.findMany({ where: { followerId: user.id } });

        for (const follow of followees) {
            const notifierId = follow.followeeId; // The user being followed (notifier)
            const isNotificationEnabled = Math.random() < 0.2;
            if (isNotificationEnabled) {
                await prisma.pushNotification.create({
                    data: {
                        receiverId: user.id,
                        notifierId: notifierId,
                        createdAt: faker.date.between({ from: follow.createdAt, to: Date.now() }),
                    },
                });
            }
        }
    }

    console.log('push notifications done');

    // Create posts and store them for replies
    const createdPosts = [];
    for (let i = 0; i < 500; i++) {
        const randomUser = faker.helpers.arrayElement(users);

        const notificationReceiversForRandomUser = await prisma.pushNotification.findMany({
            where: { notifierId: randomUser.id },
            select: { receiverId: true },
        });

        const postCreatedAt = faker.date.between({
            from: randomUser.createdAt,
            to: Date.now(),
        });

        const hashtagRegex = /#(\w+)/g;
        const shouldIncludeHashtags = Math.random() < 0.25;
        let postContent = '';
        if (shouldIncludeHashtags) {
            postContent = `${faker.lorem.sentence()} ${getRandomHashtags()}`;
        } else {
            postContent = faker.lorem.sentence();
        }
        const hashtagsContent = Array.from(new Set(postContent.match(hashtagRegex)?.map((tag) => tag.slice(1)) || []));

        const post = await prisma.post.create({
            data: {
                content: postContent,
                authorId: randomUser.id,
                createdAt: postCreatedAt,
            },
        });

        const upsertedHashtags = await Promise.all(
            hashtagsContent.map((tag) =>
                prisma.hashtag.upsert({
                    where: { name: tag },
                    update: {}, // Ensure the tag exists without modifying it
                    create: { name: tag },
                })
            )
        );

        // Now create the many-to-many relationships between Post and Hashtags
        const hashtagOnPostData = upsertedHashtags.map((hashtag) => ({
            postId: post.id,
            hashtagId: hashtag.id, // Access the ID of the upserted hashtag
        }));

        // Perform the createMany operation
        await prisma.hashtagOnPost.createMany({
            data: hashtagOnPostData,
            skipDuplicates: true, // Prevent duplicates
        });

        createdPosts.push(post); // Save created post
        console.log(createdPosts.length);
        

        // Create POST notifications
        for (const receiver of notificationReceiversForRandomUser) {
            await prisma.notification.create({
                data: {
                    typeId: 1,
                    postId: post.id,
                    notifierId: randomUser.id, // User who posted
                    receiverId: receiver.receiverId, // User who has notification enabled for author
                    createdAt: postCreatedAt,
                },
            });
        }
    }

    console.log('posts done');

    // Create replies for the created posts
    const createdReplies = [];
    for (let i = 0; i < 1000; i++) {
        // Select a random post / reply
        const randomPost = faker.helpers.arrayElement(createdPosts.concat(createdReplies));

        const replyCreatedAt = faker.date.between({
            from: randomPost.createdAt,
            to: Date.now(),
        });

        // Select a random user to reply to the post
        const randomUser = faker.helpers.arrayElement(users);
        const notificationReceiversForRandomUser = await prisma.pushNotification.findMany({
            where: { notifierId: randomUser.id },
            select: { receiverId: true },
        });

        const hashtagRegex = /#(\w+)/g;
        const shouldIncludeHashtags = Math.random() < 0.25;
        let replyContent = '';
        if (shouldIncludeHashtags) {
            replyContent = `${faker.lorem.sentence()} ${getRandomHashtags()}`;
        } else {
            replyContent = faker.lorem.sentence();
        }
        const hashtagsContent = Array.from(new Set(replyContent.match(hashtagRegex)?.map((tag) => tag.slice(1)) || []));

        const reply = await prisma.post.create({
            data: {
                content: replyContent,
                replyToId: randomPost.id,
                authorId: randomUser.id, // The user who created the reply
                createdAt: replyCreatedAt,
            },
        });

        const upsertedHashtags = await Promise.all(
            hashtagsContent.map((tag) =>
                prisma.hashtag.upsert({
                    where: { name: tag },
                    update: {}, // Ensure the tag exists without modifying it
                    create: { name: tag },
                })
            )
        );

        // Now create the many-to-many relationships between Post and Hashtags
        const hashtagOnPostData = upsertedHashtags.map((hashtag) => ({
            postId: reply.id,
            hashtagId: hashtag.id, // Access the ID of the upserted hashtag
        }));

        // Perform the createMany operation
        await prisma.hashtagOnPost.createMany({
            data: hashtagOnPostData,
            skipDuplicates: true, // Prevent duplicates
        });

        createdReplies.push(reply); // Save created reply
        console.log(createdReplies.length);

        // Create REPLY notifications
        for (const receiver of notificationReceiversForRandomUser) {
            await prisma.notification.create({
                data: {
                    typeId: 2,
                    postId: reply.id,
                    notifierId: randomUser.id, // User who posted
                    receiverId: receiver.receiverId, // User who has notification enabled for author
                    createdAt: replyCreatedAt,
                },
            });
        }

        // Check if a notification for the original post author already exists
        const existingNotification = await prisma.notification.findUnique({
            where: {
                    typeId: 2,
                    id: reply.id, // Post being reposted
                    notifierId: randomUser.id, // User who reposted
                    receiverId: randomPost.authorId, // Original post author
            },
        });

        // Notify the original post author only if the notification does not exist
        if (!existingNotification) {
            await prisma.notification.create({
                data: {
                    typeId: 2,
                    postId: reply.id,
                    notifierId: randomUser.id, // User who replied
                    receiverId: randomPost.authorId, // Original post author
                    createdAt: replyCreatedAt,
                },
            });
        }
    }

    console.log('replies done');

    // Create random reposts and likes and bookmarks
    const allPosts = await prisma.post.findMany();
    const randomPosts = faker.helpers.arrayElements(allPosts, { min: 75, max: 150});
    for (const post of randomPosts) {
        // Create random reposts
        const randomUsers = faker.helpers.arrayElements(users, { min: 0, max: 75 });
        for (const user of randomUsers) {
            const shouldRepost = Math.random() < 0.1; // 10% chance to repost
            if (shouldRepost) {
                const notificationReceiversForReposter = await prisma.pushNotification.findMany({
                    where: { notifierId: user.id },
                    select: { receiverId: true },
                });

                const repostCreatedAt = faker.date.between({
                    from: post.createdAt,
                    to: Date.now(),
                });

                await prisma.postRepost.create({
                    data: {
                        postId: post.id,
                        userId: user.id,
                        createdAt: repostCreatedAt,
                    },
                });

                // Create REPOST notifications
                for (const receiver of notificationReceiversForReposter) {
                    await prisma.notification.create({
                        data: {
                            typeId: 3,
                            postId: post.id,
                            notifierId: user.id, // User who who reposted
                            receiverId: receiver.receiverId, // User who has notification enabled for author
                            createdAt: repostCreatedAt,
                        },
                    });
                }

                // Check if a notification for the original post author already exists
                const existingNotification = await prisma.notification.findUnique({
                    where: {
                        typeId: 3,
                        id: post.id, // Post being reposted
                        notifierId: user.id, // User who reposted
                        receiverId: post.authorId, // Original post author
                    },
                });

                // Notify the original post author only if the notification does not exist
                if (!existingNotification) {
                    await prisma.notification.create({
                        data: {
                            typeId: 3,
                            postId: post.id,
                            notifierId: user.id, // User who reposted
                            receiverId: post.authorId, // Original post author
                            createdAt: repostCreatedAt,
                        },
                    });
                }
            }

            // Create random likes
            const shouldLike = Math.random() < 0.50; // 50% chance to like
            if (shouldLike) {
                // Like should only notify the post author

                const likeCreatedAt = faker.date.between({
                    from: post.createdAt,
                    to: Date.now(),
                });

                await prisma.postLike.create({
                    data: {
                        postId: post.id,
                        userId: user.id,
                        createdAt: likeCreatedAt,
                    },
                });

                // Create LIKE notification
                await prisma.notification.create({
                    data: {
                        typeId: 4,
                        postId: post.id,
                        notifierId: user.id, // User who liked
                        receiverId: post.authorId, // Original post author
                        createdAt: likeCreatedAt,
                    },
                });
            }

            // Create random bookmarks without notifications
            const shouldBookmark = Math.random() < 0.4; // 20% chance to bookmark
            if (shouldBookmark) {
                const bookmarkCreatedAt = faker.date.between({
                    from: post.createdAt,
                    to: Date.now(),
                });

                await prisma.postBookmark.create({
                    data: {
                        userId: user.id,
                        postId: post.id,
                        createdAt: bookmarkCreatedAt,
                    },
                });
            }
        }
    }

    console.log('reposts and likes and bookmarks done');

    // Create random conversations and messages
    const allUsers = await prisma.user.findMany();
    for (const [index, user] of allUsers.entries()) {
        const mutualFollows = await prisma.follow.findMany({
            where: {
                followerId: user.id,
                followee: {
                    following: {
                        some: {
                            followeeId: user.id,
                        }
                    }
                },
            },
        });

        if (index === 0) {
            console.log(mutualFollows);
        }
        
        const receivers = mutualFollows.map((follow) => follow.followerId === user.id ? { id: follow.followeeId, createdAt: follow.createdAt } : { id: follow.followerId, createdAt: follow.createdAt });
        const messagePartners = faker.helpers.arrayElements(receivers, faker.number.int({ min: receivers.length / 2, max: receivers.length }));

        for (const receiver of messagePartners) {
            const conversationExists = await prisma.conversation.findFirst({
                where: {
                    participants: {
                        // Ensure both participants exist in the conversation
                        every: {
                            OR: [
                                { userId: user.id },
                                { userId: receiver.id },
                            ],
                        },
                    },
                },
                select: {
                    id: true,
                    createdAt: true,
                }
            })

            // skip this convo if already exists
            if (conversationExists) return;

            let conversationCreatedAt = faker.date.between({
                from: receiver.createdAt, // the time the follow relationship was created
                to: Date.now()
            });

            const conversationId = await prisma.conversation.create({
                data: {
                    participants: {
                        create: [{ userId: user.id }, { userId: receiver.id }],
                    },
                    createdAt: conversationCreatedAt,
                },
                select: {
                    id: true,
                }
            }).then(res => res.id);

            const messageCount = faker.number.int({ min: 0, max: 100 });
            let lastMessageTime = conversationCreatedAt;
            // Randomly choose the initial sender between `user.id` and `receiver.id`
            let currentSenderId = Math.random() < 0.5 ? user.id : receiver.id;

            for (let i = 0; i < messageCount; i++) {
                // Generate a more realistic time closer to `lastMessageTime` (up to 6 hours interval)
                do {
                    newMessageTime = faker.date.between({
                        from: lastMessageTime,
                        to: new Date(lastMessageTime.getTime() + faker.number.int({ min: 60 * 1000, max: 6 * 60 * 60 * 1000 }))
                    });
                } while (newMessageTime > new Date());

                const msg = await prisma.message.create({
                    data: {
                        content: faker.lorem.sentences().slice(0, 100),
                        senderId: currentSenderId,
                        receiverId: currentSenderId === user.id ? receiver.id : user.id,
                        conversationId: conversationId,
                        createdAt: newMessageTime,
                        updatedAt: newMessageTime,
                        readStatus: true,
                    },
                });

                await prisma.conversation.update({
                    where: {
                        id: conversationId
                    },
                    data: {
                        updatedAt: msg.createdAt,
                    }
                });

                lastMessageTime = newMessageTime;

                // Randomly decide if the sender should switch for the next message
                if (Math.random() < 0.3) {
                    currentSenderId = currentSenderId === user.id ? receiver.id : user.id;
                }
            }

            // get conversation last message sender
            const lastMessageSender = await prisma.message.findFirst({
                where: {
                    conversationId: conversationId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1,
                select: {
                    senderId: true,
                }
            });

            // conversation is empty, move on
            if (lastMessageSender === null) return;

            // get last message from receiver
            const lastReceiverMessage = await prisma.message.findFirst({
                where: {
                    conversationId: conversationId,
                    senderId: {
                        not: lastMessageSender.senderId
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1,
                select: {
                    createdAt: true,
                }
            });

            // update messages from sender that were posted after last message from receiver to readstatus false
            if (lastReceiverMessage === null) {
                // one sided conversation, update all messages
                await prisma.message.updateMany({
                    where: {
                        conversationId,
                    },
                    data: {
                        readStatus: false,
                    }
                })
            } else {
                // update only last messages from most recent sender
                await prisma.message.updateMany({
                    where: {
                        conversationId,
                        senderId: lastMessageSender.senderId,
                        createdAt: {
                            gte: lastReceiverMessage.createdAt
                        }
                    },
                    data: {
                        readStatus: false,
                    }
                })
            }
        }
    }

    console.log('conversations done');

    console.log("Seeding completed!");
    return;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
