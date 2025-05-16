/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let validToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('/weather (GET)', () => {
    const badRequest = {
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Invalid request',
    };

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
    const badRequest = {
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Invalid input',
    };

    const ok = expect.objectContaining({
      statusCode: HttpStatus.OK,
      message: 'Subscription successful. Confirmation email sent',
      token: expect.any(String),
    });

    const validInput = {
      email: 'clear@example.com',
      city: 'London',
      frequency: 'daily',
    };

    it('should work with valid email, city, frequency', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscribe')
        .send(validInput);

      expect(response.body).toEqual(ok);

      validToken = response.body.token;
    });

    it('should throw with invalid input', async () => {
      const validInput = {
        email: 'test@example.com',
        city: 'London',
        frequency: 'daily',
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
      await request(app.getHttpServer())
        .post('/subscribe')
        .send(validInput)
        .expect({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'Email already subscribed',
        });
    });

    it('should change frequency for subscription', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscribe')
        .send({ ...validInput, frequency: 'hourly' });

      expect(response.body).toEqual(ok);
    });
  });

  const invalidToken = {
    statusCode: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    message: 'Invalid token',
  };

  const notFoundToken = {
    statusCode: HttpStatus.NOT_FOUND,
    error: 'Not Found',
    message: 'Token not found',
  };

  describe('/confirm/:token (GET)', () => {
    const ok = {
      statusCode: HttpStatus.OK,
      message: 'Subscription confirmed successfully',
    };

    it('should work with valid token ', async () => {
      await request(app.getHttpServer())
        .get(`/confirm/${validToken}`)
        .expect(ok);
    });

    it('should revert for invalid token ', async () => {
      await request(app.getHttpServer())
        .get(`/confirm/invalid-token}`)
        .expect(invalidToken);
    });

    it('should revert if token not found', async () => {
      await request(app.getHttpServer())
        .get(`/confirm/00000000-0000-0000-0000-000000000000`)
        .expect(notFoundToken);
    });

    // ! change to docs
    it('should revert if subscription already confirmed', async () => {
      await request(app.getHttpServer()).get(`/confirm/${validToken}`).expect({
        statusCode: HttpStatus.OK,
        message: 'Subscription already confirmed',
      });
    });
  });

  describe('/unsubscribe/:token (GET)', () => {
    const ok = {
      statusCode: HttpStatus.OK,
      message: 'Unsubscribed successfully',
    };

    it('should work with valid token', async () => {
      await request(app.getHttpServer())
        .get(`/unsubscribe/${validToken}`)
        .expect(ok);
    });

    it('should revert for invalid token', async () => {
      await request(app.getHttpServer())
        .get(`/unsubscribe/invalid-token`)
        .expect(invalidToken);
    });

    it('should revert if token not found', async () => {
      await request(app.getHttpServer())
        .get(`/unsubscribe/00000000-0000-0000-0000-000000000000`)
        .expect(notFoundToken);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
