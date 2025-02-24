-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TemporaryUser" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" DATE NOT NULL,
    "password" TEXT,
    "username" VARCHAR(15),
    "profilePicture" VARCHAR(255),
    "registrationComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemporaryUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemporaryUser_email_key" ON "TemporaryUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TemporaryUser_username_key" ON "TemporaryUser"("username");
