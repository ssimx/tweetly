const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const UserRole = {
    USER: 'USER',
    ADMIN: 'ADMIN',
};

async function main() {
    console.log("Seeding database...");

    const hashedPassword = await bcrypt.hash('tweetly', 10);

    // Create 50 users with profiles
    const users = await Promise.all(
        Array.from({ length: 50 }).map(async () => {
            const userCreatedAt = faker.date.recent(365);

            const user = await prisma.user.create({
                data: {
                    username: faker.internet.username().slice(0, 15),
                    email: faker.internet.email().slice(0, 254),
                    password: hashedPassword,
                    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
                    role: UserRole.USER,
                    createdAt: userCreatedAt,
                    profile: {
                        create: {
                            name: faker.name.fullName().slice(0, 50),
                            bio: faker.lorem.sentence().slice(0, 160),
                            location: faker.location.city().slice(0, 30),
                            websiteUrl: faker.internet.url().slice(0, 100),
                            profilePicture: 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png',
                            bannerPicture: '',
                        },
                    },
                },
            });
            return user;
        })
    );

    // Create 1000 posts and random replies (0-15 per post)
    const posts = await Promise.all(
        Array.from({ length: 1000 }).map(async () => {
            const author = faker.helpers.arrayElement(users);
            const postCreatedAt = faker.date.recent(30);

            const post = await prisma.post.create({
                data: {
                    content: faker.lorem.sentences().slice(0, 280),
                    authorId: author.id,
                    createdAt: postCreatedAt,
                },
            });

            const replyCount = faker.number.int({ min: 0, max: 15 });
            for (let i = 0; i < replyCount; i++) {
                const replyAuthor = faker.helpers.arrayElement(users);
                console.log('postCreatedAt:', postCreatedAt);
                const replyCreatedAt = faker.date.between({ from: postCreatedAt, to: Date.now() });
                await prisma.post.create({
                    data: {
                        content: faker.lorem.sentences().slice(0, 280),
                        authorId: replyAuthor.id,
                        replyToId: post.id,
                        createdAt: replyCreatedAt,
                    },
                });
            }

            const likeCount = faker.number.int({ min: 0, max: 20 });
            const repostCount = faker.number.int({ min: 0, max: 10 });
            const bookmarkCount = faker.number.int({ min: 0, max: 10 });

            // Create likes
            for (let i = 0; i < likeCount; i++) {
                const userId = faker.helpers.arrayElement(users).id;

                // Check for existing like
                const existingLike = await prisma.postLike.findUnique({
                    where: {
                        postLikeId: {
                            userId,
                            postId: post.id,
                        },
                    },
                });

                if (!existingLike) {
                    await prisma.postLike.create({
                        data: {
                            userId,
                            postId: post.id,
                            createdAt: faker.date.between({ from: postCreatedAt, to: Date.now() }),
                        },
                    });
                }
            }

            // Create reposts
            for (let i = 0; i < repostCount; i++) {
                const userId = faker.helpers.arrayElement(users).id;

                // Check for existing repost
                const existingRepost = await prisma.postRepost.findUnique({
                    where: {
                        postRepostId: {
                            userId,
                            postId: post.id,
                        },
                    },
                });

                if (!existingRepost) {
                    await prisma.postRepost.create({
                        data: {
                            userId,
                            postId: post.id,
                            createdAt: faker.date.between({ from: postCreatedAt, to: Date.now() }),
                        },
                    });
                }
            }

            // Create bookmarks
            for (let i = 0; i < bookmarkCount; i++) {
                const userId = faker.helpers.arrayElement(users).id;

                // Check for existing bookmark
                const existingBookmark = await prisma.postBookmark.findUnique({
                    where: {
                        postBookmarkId: {
                            userId,
                            postId: post.id,
                        },
                    },
                });

                if (!existingBookmark) {
                    await prisma.postBookmark.create({
                        data: {
                            userId,
                            postId: post.id,
                            createdAt: faker.date.between({ from: postCreatedAt, to: Date.now() }),
                        },
                    });
                }
            }

            return post;
        })
    );

    for (const user of users) {
        const followCount = faker.number.int({ min: 0, max: 50 });
        const followees = faker.helpers.arrayElements(users, followCount);
        for (const followee of followees) {
            if (user.id !== followee.id) {
                await prisma.follow.create({
                    data: {
                        followerId: user.id,
                        followeeId: followee.id,
                        createdAt: faker.date.recent(30),
                    },
                });
            }
        }
    }

    for (const user of users) {
        const followers = await prisma.follow.findMany({ where: { followeeId: user.id } });
        for (const follower of followers) {
            const conversationCreatedAt = faker.date.recent(30);
            const conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        create: [
                            { userId: user.id },
                            { userId: follower.followerId },
                        ],
                    },
                    createdAt: conversationCreatedAt,
                },
            });

            const messageCount = faker.number.int({ min: 0, max: 500 });
            let lastMessageTime = conversationCreatedAt;
            for (let i = 0; i < messageCount; i++) {
                const senderId = i % 2 === 0 ? user.id : follower.followerId;
                const receiverId = i % 2 === 0 ? follower.followerId : user.id;
                lastMessageTime = faker.date.between({ from: lastMessageTime, to: Date.now() });
                await prisma.message.create({
                    data: {
                        content: faker.lorem.sentences().slice(0, 10000),
                        senderId,
                        receiverId,
                        conversationId: conversation.id,
                        createdAt: lastMessageTime,
                        updatedAt: lastMessageTime,
                    },
                });
            }
        }
    }

    for (const user of users) {
        const notifyCount = faker.number.int({ min: 0, max: 10 });
        const notifiers = faker.helpers.arrayElements(users, notifyCount);
        for (const notifier of notifiers) {
            if (user.id !== notifier.id) {
                await prisma.pushNotification.create({
                    data: {
                        receiverId: user.id,
                        notifierId: notifier.id,
                        createdAt: faker.date.recent(30),
                    },
                });
            }
        }
    }

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
