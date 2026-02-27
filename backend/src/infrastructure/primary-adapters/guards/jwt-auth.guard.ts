import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticationError } from '../../../domain/errors/authentication.error';
import { TOKEN_SERVICE } from '../../../application/interfaces/token-service.interface';
import type { ITokenService } from '../../../application/interfaces/token-service.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string; email: string };
    }>();

    const rawHeader = request.headers.authorization;
    if (rawHeader === undefined || !rawHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing bearer token');
    }

    const token = rawHeader.replace('Bearer ', '').trim();
    const payload = await this.tokenService.verifyAccessToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
    };

    return true;
  }
}
