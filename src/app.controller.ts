import {
  Controller,
  Get,
  Query,
  Body,
  HttpException,
  HttpStatus,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AppService, type GetWeatherResponse } from './app.service';
import { z } from 'zod';

class SubscribeDto {
  email: string;
  city: string;
  frequency: string;
}

const citySchema = z.string().min(1);

const subscribeSchema = z.object({
  email: z.string().email(),
  city: citySchema,
  frequency: z.enum(['hourly', 'daily']),
});

const uuidSchema = z.string().uuid();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('weather')
  getWeather(@Query('city') city: string): Promise<GetWeatherResponse> {
    try {
      citySchema.parse(city);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
      throw new BadRequestException('Invalid request');
    }
    return this.appService.getWeather(city);
  }

  @Post('subscribe')
  subscribe(@Body() body: SubscribeDto): Promise<any> {
    try {
      subscribeSchema.parse(body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
      throw new BadRequestException('Invalid input');
    }

    const { email, city, frequency } = body;

    return this.appService.subscribe(email, city, frequency);
  }

  @Get('confirm/:token')
  async confirmSubscription(@Param('token') token: string): Promise<string> {
    try {
      uuidSchema.parse(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    return this.appService.confirm(token);
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string): Promise<string> {
    try {
      uuidSchema.parse(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    return this.appService.unsubscribe(token);
  }
}
