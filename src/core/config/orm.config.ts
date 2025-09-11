import 'dotenv/config';
import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const ormConfig = registerAs('database', () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: true,
  logging: true,
}));

export const databaseOptions: DataSourceOptions = {
  ...(ormConfig() as DataSourceOptions),
};

export const AppDataSource = new DataSource(databaseOptions);
