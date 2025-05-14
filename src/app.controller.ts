import {
  Controller,
  Get,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('weather')
  async getWeather(@Query('city') city: string): Promise<any> {
    if (!city) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }
    return await this.appService.getWeather(city);
  }

  // @Post('subscribe')
  // subscribe(
  //   @Body() body: { email: string; city: string; frequency: string },
  // ): Promise<{ statusCode: number; message: string }> {
  //   const { email, city, frequency } = body;

  //   // Validate input
  //   if (!email || !city || !frequency) {
  //     return { statusCode: 400, message: 'Invalid input' };
  //   }

  //   // Placeholder for database interaction
  //   // TODO: Add logic to save subscription to the database

  //   return {
  //     statusCode: 200,
  //     message: 'Subscription successful. Confirmation email sent.',
  //   };
  // }
}
