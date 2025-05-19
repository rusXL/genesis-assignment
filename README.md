# Weather API Application

## Overview

The Weather API Application is a full-stack solution that allows users to:

- Retrieve real-time weather data by city.
- Subscribe to periodic weather updates via email.
- Confirm or cancel their subscription through secure tokenized links.

The backend found in `api-app` is built with Node.js, TypeScript, NestJS, PostgreSQL, and TypeORM according to docs in `swagger.yaml`. The application uses the [WeatherAPI](https://www.weatherapi.com/) for weather data and [Neon](https://neon.tech/) for a free cloud-hosted PostgreSQL database.

A simple frontend app is also included to serve subscriptions.

## Project Structure

- `api-app/`: Backend API
- `web-app/`: Frontend web app
- globally you may find also docs and docker related files

## API Endpoints

The endpoints are found at `api-app/src/app.controller.ts` and `api-app/src/app.service.ts`.

### ```GET /weather?city=CityName```
`Bad Request`
- city is less than 1 char

`Not Found`
- if city is not available at weather api

`Ok`
- temperature
- humidity
- description

### ```POST /subscribe```
Body
- email
- city
- frequency

`Bad Request`
- if body is of incorrect format
- if city is not available at weather api

`Conflict`
- if email, frequency, city pair was already used

`Ok`
- sends confirmation email (check your spam folder)
- allows to change frequency from one to another

- message: 'Subscription successful. Confirmation email sent'
- token

### ```GET /confirm```
Param
- token

`Bad Request`
- invalid token format

`Not found`
- subscription with a given token was not found

`Ok`
- message: 'Subscription already confirmed'

- message: 'Subscription confirmed successfully'


### ```GET /unsubscribe```
Param
- token

`Bad Request`
- invalid token format

`Not found`
- subscription with a given token was not found

`Ok`
- message: 'Unsubscribed successfully'


## Testing

The api app is fully covered with functional tests located in `api-app/test/app.e2e-spec.ts`. To run the tests, execute:

in `api-app/` directory:
```bash
pnpm run test:e2e
```

## Installation and Setup

### Prerequisites

Before running the application locally, ensure you have the following:

In `api-app`
- A `.env` file configured according to `.env.example`.
- A `DATABASE_URL` from [Neon](https://neon.tech).
- A `WEATHER_API_KEY` from [Weather API](https://www.weatherapi.com).
- A `MAILDEV_INCOMING_USER` from your gmail account.
- A `MAILDEV_INCOMING_PASS` from your gmail account.

In `web-app`
- A `.env` file configured according to `.env.example`.
- A `VITE_API_URL` set exactly to http://localhost:3000 (⚠️ no trailing slash).

### Local Setup

### `api-app`

0. ```bash
   cd api-app
   ```

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

   `pnpm` package manager is recommended since it was used during the development.

2. **Run Migrations**

   Set up the initial PostgreSQL database structure

   ```bash
   pnpm run migration:run
   ```

3. **Start the application (port 3000)**

   ```bash
   pnpm run start:dev
   ```

### `web-app`

0. ```bash
   cd web-app
   ```

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

   `pnpm` package manager is recommended since it was used during the development.


2. **Start the application (port 5137)**

   ```bash
   pnpm run dev
   ```


### Local Setup with Docker (ports 3000 and 4137)

Build and run the api-app and web-app using Docker:

```bash
docker-compose up --build
```

## Deployment

> [!NOTE]
> Deployed API app can be slow due to the fact that I use a free render instance. 

> Your free instance will spin down with inactivity, which can delay requests by 50 seconds or more.

The api app is deployed at [Render](https://genesis-assignment.onrender.com/weather?city=Warsaw).

The web app is deployed at [Vercel](https://genesis-assignment.vercel.app/).


## Conclusion

So everything required was implemented.

The only thing missing is a separate scheduler microservice which will send those weather updates with a given frequency.
