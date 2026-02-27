import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'luis@example.com' })
  @IsEmail()
  email!: string;

  toEntity(): { email: string } {
    return {
      email: this.email.trim().toLowerCase(),
    };
  }
}
