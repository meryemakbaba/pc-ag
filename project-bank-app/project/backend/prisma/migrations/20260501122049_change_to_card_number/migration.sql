/*
  Warnings:

  - You are about to drop the column `identityNo` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cardNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_identityNo_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `identityNo`,
    ADD COLUMN `cardNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_cardNumber_key` ON `User`(`cardNumber`);
