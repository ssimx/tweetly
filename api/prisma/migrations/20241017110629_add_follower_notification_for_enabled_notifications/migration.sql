-- CreateTable
CREATE TABLE "FollowerNotification" (
    "receiverId" INTEGER NOT NULL,
    "notifierId" INTEGER NOT NULL,

    CONSTRAINT "FollowerNotification_pkey" PRIMARY KEY ("receiverId","notifierId")
);

-- AddForeignKey
ALTER TABLE "FollowerNotification" ADD CONSTRAINT "FollowerNotification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowerNotification" ADD CONSTRAINT "FollowerNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
