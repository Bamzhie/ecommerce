import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostDto } from './dto/creatPost.dto';
import referenceTable from './reference';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async newPost(
    postDto: PostDto,
    user_id: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    let item;
    try {
      // 1. Create the item
      item = await this.prismaService.item.create({
        data: {
          title: postDto.title,
          description: postDto.description,
          user_id,
          phone_no_1: postDto.phone_number,
        },
      });

      // Validate item creation
      if (!item) {
        return {
          statusCode: '01',
          status: 'Failed',
          message: 'Failed to create item.',
        };
      }

      // 2. Create image records in a batch operation
      const imageUrls = files.map((file) => ({
        image_url: `/uploads/${file.filename}`,
        item_id: item.item_id,
      }));

      const imageRecords = await this.prismaService.image.createMany({
        data: imageUrls,
      });

      // Validate image creation
      if (!imageRecords || imageRecords.count === 0) {
        // Rollback: Delete the item if images were not created successfully
        await this.prismaService.item.delete({
          where: { item_id: item.item_id },
        });
        return {
          statusCode: '01',
          status: 'Failed',
          message: 'Failed to create images for item.',
        };
      }

      // Set the primary image URL to the first image in the list
      if (files.length > 0) {
        const primaryImageUrl = `/uploads/${files[0].filename}`;

        // Update the primary_image_url
        await this.prismaService.item.update({
          where: { item_id: item.item_id },
          data: {
            primary_image_url: primaryImageUrl,
          },
        });

        // Refresh the item object from the database
        item = await this.prismaService.item.findFirst({
          where: { item_id: item.item_id },
        });
      }

      // Return item with image data
      const images = files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));

      return {
        message: 'Post created successfully',
        post: item,
        images,
      };
    } catch (error) {
      // Cleanup uploaded files on error
      files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (deleteError) {}
      });

      // Rollback: Delete the item if it was created
      if (item) {
        try {
          await this.prismaService.item.delete({
            where: { item_id: item.item_id },
          });
        } catch (deleteError) {}
      }

      return {
        statusCode: '01',
        status: 'Failed',
        message: 'Failed to create post',
      };
    }
  }

  async getUserPost(userId: string) {
    try {
      const posts = await this.prismaService.item.findMany({
        where: {
          user_id: userId,
        },
      });

      return {
        statusCode: '01',
        status: 'Success',
        message: 'Post found for user ' + userId,
        data: posts,
      };
    } catch (error) {
      return {
        statusCode: '01',
        status: 'Failed',
        message: 'Post not found for user ' + userId,
      };
    }
  }

  async deletePost(userId: string, postId: string) {
    try {
      const post = await this.prismaService.item.findFirst({
        where: {
          user_id: userId,
          item_id: postId,
        },
      });

      if (!post) {
        return {
          statusCode: '01',
          status: 'Failed',
          message: 'Post not found',
        };
      }

      await this.prismaService.item.delete({
        where: {
          item_id: postId,
          user_id: userId,
        },
      });

      return {
        statusCode: '01',
        status: 'Success',
        message: 'Post deleted successfully',
      };
    } catch (error) {
      return {
        statusCode: '01',
        status: 'Failed',
        message: 'Failed to delete post',
        error: `${error.message}`,
      };
    }
  }

  async addToCart(userId: string, itemId: string) {
    try {
      const item = await this.prismaService.item.findFirst({
        where: { item_id: itemId },
        select: { images: true },
      });

      if (!item) {
        return 'item not found';
      }

      const cart = await this.prismaService.cart.create({
        data: {
          user_id: userId,
          item_id: itemId,
        },
      });

      await this.prismaService.item.update({
        where: { item_id: itemId },
        data: {
          cart: 1,
        },
      });

      return {
        statusCode: '01',
        status: 'Success',
        message: 'Item added to cart',
        data: {
          cart: cart,
          item: item,
        },
      };
    } catch (error) {
      return {
        statusCode: '01',
        status: 'Failed',
        message: 'Failed to add item to cart',
      };
    }
  }

  async getCartItems(userId: string): Promise<any> {
    try {
      const cartItems = await this.prismaService.item.findMany({
        where: {
          user_id: userId, // Filter by user_id
          cart: 1, // Filter by cart field
        },
        include: {
          images: {
            select: {
              image_url: true,
            },
          },
        },
      });

      return cartItems;
    } catch (error) {
      return {
        statusCode: '01',
        status: 'Failed',
        message: 'Failed to get cart items',
      };
    }
  }
  async findOriginalUrl(hashValue: string): Promise<string | null> {
    const shortUrl = `http://localhost:3000/bamz/${hashValue}`;
    const result = await this.prismaService.url.findFirst({
      where: { shortUrl },
      // select: { longUrl: true },
    });
    return result?.longUrl || null;
  }

  async generateShortUrl(
    ogUrl: string,
    user: string,
  ): Promise<{ shortUrl: string; longUrl: string }> {
    // Check if the URL already exists
    const existingUrl = await this.prismaService.url.findFirst({
      where: { longUrl: ogUrl },
    });

    if (existingUrl) {
      // If it exists, return the existing short URL
      return { shortUrl: existingUrl.shortUrl, longUrl: ogUrl };
    }

    // Generate a unique ID and calculate numericID
    const uuid = uuidv4();
    let numericID = 1;

    for (const ch of uuid) {
      const val = ch.charCodeAt(0);
      if (val >= 48 && val <= 57) numericID += val - 48;
      else if (val >= 65 && val <= 90) numericID += val - 65 + 11;
      else if (val >= 97 && val <= 122) numericID += val - 97 + 73;
    }

    // Add a salt to the numeric ID
    const salt = Math.ceil(Math.random() * 100) * 23 * 7;
    numericID *= salt;
    console.log(salt);

    // Convert numeric ID to a Base62 hash
    let genHashVal = '';
    let dummyId = numericID;

    while (dummyId > 0) {
      const rem = dummyId % 62;
      genHashVal += referenceTable[rem];
      dummyId = Math.floor(dummyId / 62);
    }

    // Create the short URL
    const shortUrl = `http://localhost:3000/bamz/${genHashVal}`;

    // Save the new URL to the database
    await this.prismaService.url.create({
      data: {
        longUrl: ogUrl,
        shortUrl,
        user_id: user,
      },
    });
    return { shortUrl, longUrl: ogUrl };
  }

  async getUserUrl(userId: string) {
    try {
      const posts = await this.prismaService.url.findMany({
        where: {
          user_id: userId,
        },
      });

      return {
        statusCode: '01',
        status: 'Success',
        message: 'Post found for user ' + userId,
        data: posts,
      };
    } catch (error) {
      return {
        statusCode: '01',
        status: 'Failed',
        message: 'Post not found for user ' + userId,
      };
    }
  }
}
