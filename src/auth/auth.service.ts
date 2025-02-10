import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signupDto: SignupDto): Promise<any> {
    try {
      const { email, full_name, password } = signupDto;

      // Step 1: Check if a user with the same email already exists
      const existingEmail = await this.prismaService.userdata_tb.findFirst({
        where: { email },
      });

      if (existingEmail) {
        return {
          statusCode: '01',
          status: 'Failed ',
          message: 'Email is already taken',
        };
      }

      // Step 2: Hash the password
      const hashPassword = await bcrypt.hash(password, 10);

      // Step 3: Generate a unique user ID
      let uniqueUserId: string;
      let isUniqueUserId = false;

      while (!isUniqueUserId) {
        uniqueUserId = uuidv4();
        const existingUser = await this.prismaService.userdata_tb.findFirst({
          where: { user_id: uniqueUserId },
        });
        isUniqueUserId = !existingUser;
      }

      // Step 4: Generate an OTP
      //   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      //   const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

      // Step 5: Create the user in the database
      const user = await this.prismaService.userdata_tb.create({
        data: {
          full_name,
          user_id: uniqueUserId,
          email,
          password: hashPassword,
          created: new Date(),
          user_disabled: '0',
          user_locked: '0',
          //   confirm_code: otp,
          //   otp_expiry: otpExpiry,
          status: 0, // Initially set to inactive
        },
        select: {
          user_id: true,
          email: true,
          full_name: true,
        },
      });

      return {
        message: 'User registered successfully. Welcome!!!',
        user,
      };
    } catch (error) {
      console.error('Error during sign-up:', error);

      return {
        statusCode: '01',
        status: 'Failed ',
        message: 'An error occurred during sign-up. Please try again.',
      };
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const { email, password } = loginDto;
      console.log(`Attempting to find user by email: ${email}`);

      let user = await this.prismaService.userdata_tb.findFirst({
        where: { email },
      });

      if (!email) {
        return 'email is not an email!!!';
      }

      if (!user) {
        console.log(`User not found in userdata_tb for email: ${email}`);
        return {
          statusCode: '01',
          status: 'Failed',
          message: 'Invalid user details',
        };
      }

      // Check if the user's status is inactive
      //   if (user.status === 0) {
      //     console.log('User account is inactive.');
      //     return {
      //       statusCode: '01',
      //       status: 'Failed',
      //       message: 'Account email is not yet verified.',
      //     };
      //   }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          statusCode: '01',
          status: 'Failed ',
          message: 'Invalid user details',
        };
      }

      const userPayload = {
        email: user.email,
        sub: user.user_id,
      };
      const userAccessToken = this.jwtService.sign(userPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      });

      return { access_token: userAccessToken };
    } catch (error) {
      console.error('Error during login:', error);
      return {
        statusCode: '01',
        status: 'Failed ',
        message: 'Login failed',
      };
    }
  }
}
