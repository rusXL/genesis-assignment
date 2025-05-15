/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
      await request(app.getHttpServer()).get(`/weather`).expect({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid request',
      });

      await request(app.getHttpServer()).get(`/weather?city=`).expect({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid request',
      });

      await request(app.getHttpServer()).get(`/weather?city=${'777'}`).expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'City not found',
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
