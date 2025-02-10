import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/creatPost.dto';
import { JwtGuard } from 'src/guard/user.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Response } from 'express';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('post')
@UseGuards(JwtGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('new')
  @UseInterceptors(FilesInterceptor('images', 4, multerConfig))
  async newPost(
    @UploadedFiles() files: Express.Multer.File[], // 👈 Access files here
    @Body() postDto: PostDto,
    @GetUser() user,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least 1 image is required.');
    }
    return this.postService.newPost(postDto, user.user_id, files);
  }

  @Get('user')
  async getUserPost(@GetUser() userId) {
    return this.postService.getUserPost(userId.user_id);
  }

  @Post('add-cart/:item_id')
  async addToCart(@Param('item_id') itemId: string, @GetUser() userId) {
    return this.postService.addToCart(userId.user_id, itemId);
  }

  @Get('cart')
  async getCartItems(@GetUser() userId) {
    return this.postService.getCartItems(userId.user_id);
  }

  @Post('shortUrl')
  async generateShortUrl(@Body('url') url: string, @GetUser() user) {
    return this.postService.generateShortUrl(url, user.user_id);
  }

  @Get('url/user')
  async getUserUrl(@GetUser() userId) {
    return this.postService.getUserUrl(userId.user_id);
  }
}
