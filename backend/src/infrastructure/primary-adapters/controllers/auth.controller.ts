import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../../../application/services/auth.service';
import { Public } from '../decorators/public.decorator';
import { AuthResponseDto } from './dtos/auth/auth-response.dto';
import { ForgotPasswordDto } from './dtos/auth/forgot-password.dto';
import { LoginDto } from './dtos/auth/login.dto';
import { RegisterDto } from './dtos/auth/register.dto';
import { ResetPasswordDto } from './dtos/auth/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private static getRefreshToken(
    req: Request & { cookies?: { refreshToken?: string } },
  ): string | undefined {
    return req.cookies?.refreshToken;
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto.toEntity());
    this.setRefreshCookie(res, result.refreshToken);
    return AuthResponseDto.fromEntity(result.user, result.accessToken);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto.toEntity());
    this.setRefreshCookie(res, result.refreshToken);
    return AuthResponseDto.fromEntity(result.user, result.accessToken);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { cookies?: { refreshToken?: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = AuthController.getRefreshToken(req);
    const result = await this.authService.refreshToken(refreshToken ?? '');
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request & { cookies?: { refreshToken?: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = AuthController.getRefreshToken(req);
    if (refreshToken !== undefined) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.toEntity().email);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const data = dto.toEntity();
    await this.authService.resetPassword(data.token, data.newPassword);
    return { message: 'Password reset successfully' };
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }
}
