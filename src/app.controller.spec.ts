import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';

import * as dotenv from 'dotenv';
dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('API key is missing in the environment variables');
}

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: DATABASE_URL,
          ssl: true,
          entities: [Subscription],
          synchronize: true, // Set to false in production
        }),
        TypeOrmModule.forFeature([Subscription]),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     expect(appController.getHello()).toBe('Hello World!');
  //   });
  // });

  describe('subscribe', () => {
    it('should return success for valid input', async () => {
      const validInput = {
        email: 'test@example.com',
        city: 'New York',
        frequency: 'daily',
      };

      const response = await appController.subscribe(validInput);
      expect(response).toEqual(
        'Subscription successful. Confirmation email sent.',
      );
    });

    it('should throw an error for invalid city', async () => {
      const invalidInput = {
        email: 'test@example.com',
        city: '',
        frequency: 'daily',
      };

      try {
        await appController.subscribe(invalidInput);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const err = e as HttpException;
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error for invalid email', async () => {
      const invalidInput = {
        email: 'invalid-email',
        city: 'New York',
        frequency: 'daily',
      };

      try {
        await appController.subscribe(invalidInput);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const err = e as HttpException;
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error for invalid frequency', async () => {
      const invalidInput = {
        email: 'test@example.com',
        city: 'New York',
        frequency: 'weekly', // Invalid frequency
      };

      try {
        await appController.subscribe(invalidInput);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const err = e as HttpException;
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
