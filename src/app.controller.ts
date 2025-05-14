import {
  Controller,
  Get,
  Query,
  Body,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService, type GetWeatherResponse } from './app.service';
import { z } from 'zod';

class SubscribeDto {
  email: string;
  city: string;
  frequency: string;
}

const subscribeSchema = z.object({
  email: z.string().email(),
  city: z.string().min(1),
  frequency: z.enum(['hourly', 'daily']),
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('weather')
  getWeather(@Query('city') city: string): Promise<GetWeatherResponse> {
    if (!city) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }
    return this.appService.getWeather(city);
  }

  @Post('subscribe')
  subscribe(@Body() body: SubscribeDto): Promise<string> {
    const { email, city, frequency } = body;

    try {
      subscribeSchema.parse(body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: unknown) {
      throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
    }

    return this.appService.subscribe(email, city, frequency);
  }
}
