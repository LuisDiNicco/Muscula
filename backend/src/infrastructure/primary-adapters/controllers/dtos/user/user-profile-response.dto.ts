import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../domain/entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ nullable: true })
  dateOfBirth!: Date | null;

  @ApiProperty({ nullable: true })
  gender!: string | null;

  @ApiProperty({ nullable: true })
  heightCm!: number | null;

  @ApiProperty({ nullable: true })
  currentWeightKg!: number | null;

  @ApiProperty()
  activityLevel!: string;

  @ApiProperty()
  experience!: string;

  static fromEntity(entity: UserEntity): UserProfileResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      username: entity.username,
      emailVerified: entity.emailVerified,
      avatarUrl: entity.avatarUrl,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender,
      heightCm: entity.heightCm,
      currentWeightKg: entity.currentWeightKg,
      activityLevel: entity.activityLevel,
      experience: entity.experience,
    };
  }
}
