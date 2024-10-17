-- CreateEnum
CREATE TYPE "EntityTypes" AS ENUM ('POST', 'REPLY', 'REPOST', 'LIKE', 'FOLLOW');

-- CreateTable
CREATE TABLE "EntityType" (
    "id" SERIAL NOT NULL,
    "name" "EntityTypes" NOT NULL,
    "description" VARCHAR(100) NOT NULL,

    CONSTRAINT "EntityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationObject" (
    "id" SERIAL NOT NULL,
    "entityId" INTEGER NOT NULL,
    "entityTypeId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "NotificationObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "notificationObjectId" INTEGER NOT NULL,
    "notifierId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationObjectId","notifierId")
);

-- AddForeignKey
ALTER TABLE "NotificationObject" ADD CONSTRAINT "NotificationObject_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationObject" ADD CONSTRAINT "NotificationObject_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notificationObjectId_fkey" FOREIGN KEY ("notificationObjectId") REFERENCES "NotificationObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
