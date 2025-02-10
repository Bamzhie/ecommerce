-- CreateTable
CREATE TABLE `userdata_tb` (
    `full_name` VARCHAR(60) NULL,
    `username` VARCHAR(72) NULL,
    `password` VARCHAR(100) NOT NULL,
    `role_id` VARCHAR(36) NULL,
    `role_name` VARCHAR(36) NULL,
    `firstname` VARCHAR(60) NULL,
    `lastname` VARCHAR(60) NULL,
    `business_name` VARCHAR(191) NULL,
    `dob` DATETIME(0) NULL,
    `confirm_pin` VARCHAR(8) NULL,
    `email` VARCHAR(100) NOT NULL,
    `mobile_phone` VARCHAR(20) NULL DEFAULT '000 000 0000',
    `address` VARCHAR(191) NULL,
    `passchg_logon` CHAR(1) NULL,
    `pass_expire` VARCHAR(1) NULL DEFAULT '',
    `pass_dateexpire` DATETIME(0) NULL,
    `pass_change` CHAR(1) NULL,
    `user_disabled` CHAR(1) NULL DEFAULT '0',
    `user_locked` CHAR(1) NULL DEFAULT '0',
    `last_seen` VARCHAR(32) NULL,
    `day_1` CHAR(1) NULL DEFAULT '1',
    `ID_Image_url` CHAR(1) NULL DEFAULT '1',
    `id_number` CHAR(1) NULL DEFAULT '1',
    `org_name` VARCHAR(128) NULL,
    `means_of_ID` CHAR(1) NULL DEFAULT '1',
    `city` CHAR(1) NULL DEFAULT '1',
    `state` CHAR(1) NULL DEFAULT '1',
    `nationality` CHAR(1) NULL DEFAULT '1',
    `pin_missed` INTEGER NULL DEFAULT 0,
    `last_used` DATETIME(0) NULL,
    `modified` DATETIME(0) NULL,
    `hint_question` VARCHAR(100) NULL,
    `hint_answer` VARCHAR(100) NULL,
    `override_wh` CHAR(1) NULL,
    `extend_wh` VARCHAR(17) NULL,
    `created` DATETIME(0) NULL,
    `posted_user` VARCHAR(100) NULL,
    `last_used_passwords` VARCHAR(250) NULL,
    `confirm_code` VARCHAR(128) NULL,
    `confirm_account` VARCHAR(1) NULL DEFAULT '0',
    `business_status` VARCHAR(191) NOT NULL DEFAULT 'NotVerified',
    `user_id` VARCHAR(128) NOT NULL,
    `passport` VARCHAR(255) NULL,
    `referral_code` VARCHAR(16) NULL,
    `status` INTEGER NULL DEFAULT 1,
    `merchantId` CHAR(36) NOT NULL,
    `waddress` VARCHAR(128) NULL DEFAULT '',
    `app` VARCHAR(16) NULL,
    `email_auth` INTEGER NULL DEFAULT 0,
    `resetpassword` VARCHAR(128) NULL,
    `resettime` DATETIME(0) NULL,
    `reset_token` VARCHAR(191) NULL,
    `reset_token_expiry` DATETIME(0) NULL,
    `team_id` CHAR(36) NULL,
    `country` VARCHAR(36) NULL DEFAULT '',
    `last_activity` DATETIME(0) NULL,
    `otp_enabled` VARCHAR(1) NULL DEFAULT '0',
    `otp_verified` VARCHAR(12) NULL,
    `otp_expiry` DATETIME(0) NULL,
    `otp_ascii` VARCHAR(128) NULL,
    `otp_hex` VARCHAR(128) NULL,
    `otp_base32` VARCHAR(128) NULL,
    `otp_auth_url` VARCHAR(256) NULL,
    `profilePic` VARCHAR(191) NULL,
    `pk_live` VARCHAR(72) NULL,
    `sk_live` VARCHAR(72) NULL,
    `pk_test` VARCHAR(36) NULL,
    `sk_test` VARCHAR(36) NULL,
    `isExpired` BOOLEAN NOT NULL DEFAULT false,
    `webhook_url` VARCHAR(191) NULL,
    `secret_key` VARCHAR(191) NULL,
    `blacklist` VARCHAR(191) NULL DEFAULT 'False',
    `email_notification` VARCHAR(191) NULL,

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `user_id`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `user_id` VARCHAR(128) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `email` VARCHAR(100) NULL,
    `phone_no_1` VARCHAR(20) NOT NULL,
    `phone_no_2` VARCHAR(20) NULL,
    `primary_image_url` VARCHAR(255) NULL,
    `cart` INTEGER NULL DEFAULT 0,

    INDEX `Item_user_id_idx`(`user_id`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Image` (
    `image_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,

    INDEX `Image_item_id_idx`(`item_id`),
    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `cart_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(128) NOT NULL,
    `item_id` CHAR(36) NOT NULL,

    INDEX `Cart_user_id_item_id_idx`(`user_id`, `item_id`),
    PRIMARY KEY (`cart_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `url` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `longUrl` VARCHAR(191) NOT NULL,
    `shortUrl` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(128) NOT NULL,

    UNIQUE INDEX `url_shortUrl_key`(`shortUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

