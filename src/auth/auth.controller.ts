import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async signUp(@Body() signUp: SignupDto) {
    return this.authService.signUp(signUp);
  }

  @Post('login')
  async login(@Body() loginAuthDto: LoginDto) {
    console.log('Login endpoint hit with payload:', loginAuthDto); // Log request
    return this.authService.login(loginAuthDto);
  }
}
