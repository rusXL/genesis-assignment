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
import { MailerService } from '@nestjs-modules/mailer';
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
    private readonly mailerService: MailerService,
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

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        email,
        city,
        // confirmed: true,
      },
    });

    let newSubscription: Subscription;

    if (existingSubscription) {
      if (existingSubscription.frequency == frequency) {
        throw new ConflictException('Email already subscribed');
      } else {
        newSubscription = {
          ...existingSubscription,
          frequency,
          confirmed: false, // it is important to get confirmation for the frequency update
        };
        await this.subscriptionRepository.save(existingSubscription);
      }
    } else {
      newSubscription = this.subscriptionRepository.create({
        email,
        city,
        frequency,
        confirmed: false,
      });
    }

    const savedSubscription =
      await this.subscriptionRepository.save(newSubscription);

    // uses the deployed api for convenience

    // check your spam folder
    await this.mailerService.sendMail({
      to: email,
      from: 'ruslan.melnyk.x@gmail.com',
      subject: '🌤️ Confirm Your Weather Updates Subscription',
      text: `Hello!

You've subscribed to receive weather updates for ${city}.

Frequency: ${frequency}

To confirm your subscription, please click the link below:
https://genesis-assignment.onrender.com/confirm/${savedSubscription.id}

Thank you for using our weather service!`,

      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2>🌤️ Weather Updates Subscription</h2>
      <p>Hello,</p>
      <p>Thanks for subscribing to weather updates for <strong>${city}</strong>!</p>
      <p><strong>Update frequency:</strong> ${frequency}</p>
      <p>To confirm your subscription, please click the button below:</p>
      <p style="margin: 20px 0;">
        <a href="https://genesis-assignment.onrender.com/confirm/${savedSubscription.id}" 
           style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Confirm Subscription
        </a>
      </p>
      <p>If you didn’t subscribe, you can safely ignore this email.</p>
      <p>— The Weather Updates Team</p>
    </div>
  `,
    });

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
