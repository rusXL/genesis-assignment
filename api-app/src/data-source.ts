import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';
dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('API key is missing in the environment variables');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  ssl: true,
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
});
