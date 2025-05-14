import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('weather')
  async getWeather(@Query('city') city: string): Promise<any> {
    if (!city) {
      return { statusCode: 400, message: 'Invalid request' };
    }
    return await this.appService.getWeather(city);
  }
}
