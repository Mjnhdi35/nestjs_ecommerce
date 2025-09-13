import 'dotenv/config';
import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN!,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
}));
