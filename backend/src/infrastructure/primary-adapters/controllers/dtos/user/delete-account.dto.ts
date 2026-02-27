import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  toEntity(): { confirmPassword: string } {
    return {
      confirmPassword: this.confirmPassword,
    };
  }
}
