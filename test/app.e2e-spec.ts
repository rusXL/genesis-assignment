/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('/weather (GET)', () => {
    it('should work with valid city', async () => {
      const city = 'London';
      const response = await request(app.getHttpServer())
        .get(`/weather?city=${city}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('humidity');
      expect(response.body).toHaveProperty('description');
    });

    it('should throw with invalid city', async () => {
      const badRequest = {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Invalid request',
      };

      await request(app.getHttpServer()).get(`/weather`).expect(badRequest);

      await request(app.getHttpServer())
        .get(`/weather?city=`)
        .expect(badRequest);

      await request(app.getHttpServer()).get(`/weather?city=${'777'}`).expect({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'City not found',
      });
    });
  });

  describe('/subscribe (POST)', () => {
    const okRequest = {
      statusCode: HttpStatus.OK,
      message: 'Subscription successful. Confirmation email sent',
    };

    it('should work with valid email, city, frequency', async () => {
      const validInput = {
        email: 'clear@example.com',
        city: 'London',
        frequency: 'daily',
      };

      await request(app.getHttpServer())
        .post('/subscribe')
        .send(validInput)
        .expect(okRequest);
    });

    it('should throw with invalid input', async () => {
      const validInput = {
        email: 'test@example.com',
        city: 'London',
        frequency: 'daily',
      };

      const badRequest = {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Invalid input',
      };

      await request(app.getHttpServer())
        .post('/subscribe')
        .send({
          ...validInput,
          email: 'not-email',
        })
        .expect(badRequest);

      await request(app.getHttpServer())
        .post('/subscribe')
        .send({
          ...validInput,
          city: '',
        })
        .expect(badRequest);

      await request(app.getHttpServer())
        .post('/subscribe')
        .send({
          ...validInput,
          frequency: 'monthly',
        })
        .expect(badRequest);

      await request(app.getHttpServer())
        .post('/subscribe')
        .send({
          ...validInput,
          city: '777',
        })
        .expect(badRequest);

      await request(app.getHttpServer())
        .post('/subscribe')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw if email already subscribed', async () => {
      const validInput = {
        email: 'sameemail@example.com',
        city: 'London',
        frequency: 'daily',
      };

      await request(app.getHttpServer())
        .post('/subscribe')
        .send(validInput)
        .expect(okRequest);

      await request(app.getHttpServer())
        .post('/subscribe')
        .send(validInput)
        .expect({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'Email already subscribed',
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
