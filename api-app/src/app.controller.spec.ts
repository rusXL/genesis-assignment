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
          // synchronize: true, // Set to false in production
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
        city: 'London',
        frequency: 'daily',
      };
      const response = await appController.subscribe(validInput);
      expect(response).toEqual(
        'Subscription successful. Confirmation email sent.',
      );
    });
    // it('should throw an error for invalid city', async () => {
    //   const invalidInput = {
    //     email: 'test@example.com',
    //     city: '',
    //     frequency: 'daily',
    //   };
    //   try {
    //     await appController.subscribe(invalidInput);
    //   } catch (e) {
    //     expect(e).toBeInstanceOf(HttpException);
    //     const err = e as HttpException;
    //     expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    //   }
  });
  // it('should throw an error for invalid email', async () => {
  //   const invalidInput = {
  //     email: 'invalid-email',
  //     city: 'New York',
  //     frequency: 'daily',
  //   };
  //   try {
  //     await appController.subscribe(invalidInput);
  //   } catch (e) {
  //     expect(e).toBeInstanceOf(HttpException);
  //     const err = e as HttpException;
  //     expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  //   }
  // });
  // it('should throw an error for invalid frequency', async () => {
  //   const invalidInput = {
  //     email: 'test@example.com',
  //     city: 'New York',
  //     frequency: 'weekly', // Invalid frequency
  //   };
  //   try {
  //     await appController.subscribe(invalidInput);
  //   } catch (e) {
  //     expect(e).toBeInstanceOf(HttpException);
  //     const err = e as HttpException;
  //     expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  //   }
  // });
});

describe('confirmSubscription', () => {
  // it('should confirm subscription for a valid token', async () => {
  //   const token = '3f5dbe69-068e-485f-a60b-b38b44cebf11';
  //   const response = await appController.confirmSubscription(token);
  //   expect(response).toBe('Subscription confirmed successfully.');
  // });
  // it('should throw an error for an invalid token', async () => {
  //   const invalidToken = 'invalid-uuid';
  //   try {
  //     await appController.confirmSubscription(invalidToken);
  //   } catch (e) {
  //     expect(e).toBeInstanceOf(HttpException);
  //     expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  //   }
  // });
  // it('should return already confirmed for a confirmed subscription', async () => {
  //   // First, create and confirm a subscription
  //   const email = 'test2@example.com';
  //   const city = 'Los Angeles';
  //   const frequency = 'hourly';
  //   await appController.subscribe(email, city, frequency);
  //   const subscription = await appController.findByEmail(email);
  //   const token = subscription.id;
  //   await appController.confirmSubscription(token); // Confirm it once
  //   const response = await appController.confirmSubscription(token); // Confirm it again
  //   expect(response).toBe('Subscription already confirmed.');
  // });
});

// describe('unsubscribe', () => {
//   it('should unsubscribe successfully for a valid token', async () => {
//     const token = '3f5dbe69-068e-485f-a60b-b38b44cebf11';

//     const response = await appController.unsubscribe(token);
//     expect(response).toBe('Unsubscribed successfully.');
//   });

//   it('should throw an error for an invalid token', async () => {
//     const invalidToken = 'invalid-uuid';

//     try {
//       await appController.unsubscribe(invalidToken);
//     } catch (e) {
//       expect(e).toBeInstanceOf(HttpException);
//       expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
//     }
//   });

//   it('should throw an error if token not found', async () => {
//     const nonExistentToken = '00000000-0000-0000-0000-000000000000';

//     try {
//       await appController.unsubscribe(nonExistentToken);
//     } catch (e) {
//       expect(e).toBeInstanceOf(HttpException);
//       expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
//     }
//   });
// });
