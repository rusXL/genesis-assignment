import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
        throw new NotFoundException('City not found');
      }

      // should not happen
      throw new BadRequestException();
    }
  }

  async subscribe(
    email: string,
    city: string,
    frequency: string,
  ): Promise<any> {
    try {
      await axios.get<WeatherApiResponse>(
        `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`,
      );
    } catch (err: any) {
      const error = err as {
        response: { status: number; data: { error: { code: number } } };
      };

      const status = error.response.status;
      const code = error.response.data.error.code;

      // city not found
      if (status === 400 && code === 1006) {
        throw new BadRequestException('Invalid input');
      }

      // should not happen
      throw new BadRequestException();
    }

    let existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        email,
        city,
        // confirmed: true,
      },
    });

    if (existingSubscription) {
      if (existingSubscription.frequency == frequency) {
        throw new ConflictException('Email already subscribed');
      } else {
        existingSubscription = {
          ...existingSubscription,
          frequency,
          confirmed: false, // it is important to get confirmation for the frequency update
        };
        await this.subscriptionRepository.save(existingSubscription);
      }
    }

    const newSubscription = this.subscriptionRepository.create({
      email,
      city,
      frequency,
      confirmed: false,
    });

    const savedSubscription =
      await this.subscriptionRepository.save(newSubscription);

    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription successful. Confirmation email sent',
      token: savedSubscription.id,
    };
  }

  async confirm(token: string): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: token },
    });

    if (!subscription) {
      throw new NotFoundException('Token not found');
    }

    if (subscription.confirmed) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Subscription already confirmed',
      };
    }

    subscription.confirmed = true;
    await this.subscriptionRepository.save(subscription);

    return {
      statusCode: HttpStatus.OK,
      message: 'Subscription confirmed successfully',
    };
  }

  async unsubscribe(token: string): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: token },
    });

    if (!subscription) {
      throw new NotFoundException('Token not found');
    }

    await this.subscriptionRepository.remove(subscription);

    return {
      statusCode: HttpStatus.OK,
      message: 'Unsubscribed successfully',
    };
  }
}
