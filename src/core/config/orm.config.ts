import 'dotenv/config'
import { registerAs } from '@nestjs/config'
import { DataSource, DataSourceOptions } from 'typeorm'

export const ormConfig = registerAs('database', () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Ensure all entities across src/** are registered in dev, dist/** in prod
  entities:
    process.env.NODE_ENV === 'production'
      ? ['dist/**/*.entity.js']
      : ['src/**/*.entity.ts'],
  migrations:
    process.env.NODE_ENV === 'production'
      ? ['dist/core/migrations/*.{js}']
      : ['src/core/migrations/*.{ts}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}))

export const databaseOptions: DataSourceOptions = {
  ...(ormConfig() as DataSourceOptions),
}

export const AppDataSource = new DataSource(databaseOptions)
