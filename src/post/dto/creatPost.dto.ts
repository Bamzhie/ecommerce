import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNumber()
  phone_number: string;

  @IsOptional()
  @IsNumber()
  phone_number_2?: number;
}
