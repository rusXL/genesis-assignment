import { Injectable } from '@nestjs/common';
import axios from 'axios';
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
  getHello(): string {
    return 'Hello World!';
  }

  async getWeather(city: string): Promise<Response | Error> {
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
        response: { status: number; data: { code: number } };
      };

      const status = error.response.status;
      const code = error.response.data.code;

      if (status === 400 && code === 1006) {
        return { statusCode: 404, message: 'City not found' };
      }

      return { statusCode: 400, message: 'Invalid request' };
    }
  }
}
