import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../domain/entities/user.entity';
import { UserProfileResponseDto } from '../user/user-profile-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: () => UserProfileResponseDto })
  user!: UserProfileResponseDto;

  @ApiProperty()
  accessToken!: string;

  static fromEntity(user: UserEntity, accessToken: string): AuthResponseDto {
    return {
      user: UserProfileResponseDto.fromEntity(user),
      accessToken,
    };
  }
}
