# Weather API Application

## Overview

The Weather API Application is built using Node.js, TypeScript, NestJS, PostgreSQL, and TypeORM. It leverages a free cloud PostgreSQL database provided by [Neon](https://neon.tech/) and integrates with a weather API to deliver weather-related data.

## Prerequisites

Before running the application, ensure you have the following:

- A `.env` file configured according to `.env.example`.
- A `DATABASE_URL` from [Neon](https://neon.tech/).
- A `WEATHER_API_KEY` from [Weather API](https://www.weatherapi.com).

## Implementation

The application structure is fully compliant with `swagger.yaml`.

The endpoints are implemented in `src/app.controller.ts` and `src/app.service.ts`.

Notably, the `/confirm` endpoint can return a 200 with "Subscription already confirmed" instead of "Subscription confirmed successfully" if a subscription was already confirmed.

## Installation and Setup

### Local Setup (Port 3000)

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

   `pnpm` package manager is recommended since I used it during the development.

2. **Run Migrations**

   Set up the initial PostgreSQL database structure

   ```bash
   pnpm run migration:run
   ```

3. **Compile and Run**

   Start the application

   ```bash
   pnpm run start
   ```

### Docker Setup (Port 3000)

Build and run the application using Docker:

```bash
docker-compose up --build
```

## Testing

The application is fully covered with functional tests located in `test/app.e2e-spec.ts`. To run the tests, execute:

```bash
pnpm run test:e2e
```

## Deployment

The application is deployed and accessible at [Render App](https://genesis-assignment.onrender.com/weather?city=Warsaw).
