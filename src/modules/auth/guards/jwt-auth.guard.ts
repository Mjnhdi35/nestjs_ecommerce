import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../core/common/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;

    if (err || !user) {
      this.logger.warn(`Unauthorized access attempt to ${method} ${url}`, {
        error: err?.message,
        info: info?.message,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
      });
      throw err || new Error('Authentication failed');
    }

    this.logger.log(`Authenticated user ${user.id} accessing ${method} ${url}`);
    return user;
  }
}
