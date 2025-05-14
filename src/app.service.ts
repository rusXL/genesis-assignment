import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.Weather_API_KEY;
if (!apiKey) {
  throw new Error('API key is missing in the environment variables');
}

type Response = {
  temperature: number;
  humidity: number;
  description: string;
};

type Error = {
  statusCode: number;
  message: string;
};

export type GetWeatherResponse = Response | Error;

type WeatherApiResponse = {
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
    };
  };
};

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async subscribe(
    email: string,
    city: string,
    frequency: string,
  ): Promise<string> {
    const subscription = this.subscriptionRepository.create({
      email,
      city,
      frequency,
      confirmed: false,
    });

    // TODO: 409, Email already subscribed

    await this.subscriptionRepository.save(subscription);

    return 'Subscription successful. Confirmation email sent.';
  }

  async getWeather(city: string): Promise<GetWeatherResponse> {
    try {
      const response = await axios.get<WeatherApiResponse>(
        `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`,
      );

      const {
        temp_c: temperature,
        humidity,
        condition: { text: description },
      } = response.data.current;

      return {
        temperature,
        humidity,
        description,
      };
    } catch (err: any) {
      const error = err as {
        response: { status: number; data: { error: { code: number } } };
      };

      const status = error.response.status;
      const code = error.response.data.error.code;

      if (status === 400 && code === 1006) {
        throw new HttpException('City not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }
  }
}
