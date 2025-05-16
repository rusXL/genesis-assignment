import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';

import * as dotenv from 'dotenv';
dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('API key is missing in the environment variables');
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: DATABASE_URL,
      entities: [Subscription],
      ssl: true,
      synchronize: false, // Set to false in production
    }),
    TypeOrmModule.forFeature([Subscription]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
