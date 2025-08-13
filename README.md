# Ink & Keys

A productivity and workflow tool for writers combining document creation with OCR functionality.

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
ink-and-keys/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # NestJS + TypeScript backend
├── docker-compose.yml # Development environment
└── package.json       # Workspace configuration
```

## Prerequisites

- Node.js 18+ 
- npm 8+
- Docker and Docker Compose (for development environment)

## Quick Start

### Development with Docker (Recommended)

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the development environment:
   ```bash
   npm run dev
   ```

This will start:
- PostgreSQL database on port 5433
- Backend API on port 3001
- Frontend application on port 3000

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start frontend and backend separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend  
   npm run dev:frontend
   ```

## Available Scripts

### Root Level Commands

- `npm run dev` - Start full development environment with Docker
- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests for both applications
- `npm run clean` - Clean up Docker containers and volumes

### Frontend Commands

- `npm run dev:frontend` - Start frontend development server
- `npm run build --workspace=frontend` - Build frontend for production
- `npm run test --workspace=frontend` - Run frontend tests

### Backend Commands

- `npm run dev:backend` - Start backend development server
- `npm run build --workspace=backend` - Build backend for production
- `npm run test --workspace=backend` - Run backend tests

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **TipTap** - Rich text editor
- **Vitest** - Testing framework

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Jest** - Testing framework

### Development
- **Docker Compose** - Development environment
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ink_and_keys

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=15m

# Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001
```

## Database

The application uses PostgreSQL with Prisma ORM. Database migrations and schema are managed in `backend/prisma/`.

### Database Commands

```bash
# Generate Prisma client
npm run prisma:generate --workspace=backend

# Run migrations
npm run prisma:migrate --workspace=backend

# Open Prisma Studio
npm run prisma:studio --workspace=backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## License

MIT