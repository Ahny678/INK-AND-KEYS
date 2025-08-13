# Ink & Keys Backend

NestJS backend API for the Ink & Keys application with PostgreSQL database and Prisma ORM.

## Features

- **NestJS Framework**: Modern Node.js framework with TypeScript support
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Environment Validation**: Strict validation of environment variables
- **Global Validation**: Request/response validation with class-validator
- **Health Check**: Database connectivity monitoring
- **CORS Support**: Configured for frontend communication
- **Docker Support**: Containerized development environment

## Database Schema

### Models
- **User**: User accounts with email/password authentication
- **Document**: Text documents (created or OCR-processed)
- **UploadedFile**: File uploads with processing status tracking

## Environment Variables

Required environment variables (see `.env.example`):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ink_and_keys
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=15m
PORT=3001
NODE_ENV=development
```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run build` - Build the application
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### Health Check
- `GET /` - API status message
- `GET /health` - Database connectivity check

## Testing

The application includes comprehensive unit tests for:
- Environment validation
- Prisma service integration
- Application service functionality

Run tests with:
```bash
npm test
```

## Docker Development

Use Docker Compose for full development environment:
```bash
# From project root
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5433
- Backend API on port 3001
- Frontend on port 3000