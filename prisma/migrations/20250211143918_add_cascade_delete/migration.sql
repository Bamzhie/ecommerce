-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_item_id_fkey`;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;
