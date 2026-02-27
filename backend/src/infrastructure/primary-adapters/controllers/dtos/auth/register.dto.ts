import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'luis@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
  password!: string;

  @ApiProperty({ example: 'luisfit' })
  @IsString()
  @IsAlphanumeric()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  toEntity(): { email: string; password: string; username: string } {
    return {
      email: this.email.trim().toLowerCase(),
      password: this.password,
      username: this.username.trim(),
    };
  }
}
