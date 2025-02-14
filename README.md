# Cryptocurrency Price Tracker API

A robust cryptocurrency price tracking application built with Node.js, Fastify, and PostgreSQL.

## Features

- Tracks 250 cryptocurrencies using CoinGecko's API
- Secure user authentication with JWT tokens and OTP verification
- Bookmark favorite cryptocurrencies
- Automatic updates every 5 minutes with randomized delays
- Phone number verification via Twilio
- Comprehensive test coverage
- Swagger Documentation

## Tech Stack

- **FastifyJS** – High-performance API server
- **PostgreSQL** – Database with Prisma ORM
- **JWT Authentication** – Secure user authentication
- **Rate Limiting** – Prevent API abuse
- **Swagger Documentation** – API docs
- **Docker Support** – Containerized environment
- **TypeScript** – Ensuring code safety and maintainability

## Prerequisites

Ensure you have the following installed:

- **Node.js v22+**
- **PostgreSQL**
- **pnpm** (preferred package manager)
- **Docker** (optional, for containerized development)
- **Twilio Account** (for SMS verification)
- **CoinGecko API Key** (for fetching cryptocurrency data)

## Setup Instructions

### 1. Clone the Repository and Install Dependencies

```bash
git clone <repository-url>
cd <project-directory>
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add:

```ini
NODE_ENV=dev
PORT=3333
DATABASE_URL=postgresql://user:password@localhost:5435/dev_db
TEST_DATABASE_URL=postgresql://user:password@localhost:5436/test_db
COINGECKO_API_KEY=your_coingecko_api_key
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 3. Start the Database

```bash
docker-compose up db
```

### 4. Run Database Migrations

```bash
pnpm db:migrate
```

### 5. Start the Development Server

```bash
pnpm dev
```

## Testing

Run the test suite with:

```bash
pnpm test  # Run all tests
pnpm test:watch  # Run tests in watch mode
pnpm test:coverage  # Run tests with coverage report
```

## API Documentation

Access the Swagger documentation once the server is running:

```plaintext
http://localhost:3333/documentation
```

## Key Features

### 🔒 Rate Limiting

Prevents API abuse with configurable rate limits:

```typescript
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

### 🔐 Secure Authentication

- JWT tokens with refresh token rotation
- OTP verification for enhanced security

### 🔄 Automated Tasks

- Cryptocurrency data synchronization every 5 minutes
- Daily cleanup of expired tokens
- Randomized delays to avoid API throttling

### 📊 Database Schema

- User management with roles
- Refresh token handling
- OTP verification
- Cryptocurrency tracking
- Bookmark system for users

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the application |
| `pnpm dev` | Start the development server |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Launch Prisma Studio |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests |

## Contributing

Want to contribute? Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature-name`)
3. **Commit** your changes (`git commit -m "Added new feature"`)
4. **Push** to the branch (`git push origin feature-name`)
5. **Create a Pull Request**

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

🚀 Happy coding!
