# ITC Project Backend

Production-grade backend with user signup feature built with Node.js, TypeScript, Express, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **Framework**: Express
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **Password Hashing**: bcrypt
- **Logging**: Pino
- **Security**: Helmet, CORS

## Project Structure

```
ITC_Project/
├── prisma/
│   └── schema.prisma          # Prisma database schema
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client configuration
│   │   └── env.ts             # Environment variable validation
│   ├── middleware/
│   │   ├── error.ts           # Error handling middleware
│   │   └── validate.ts        # Zod validation middleware
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts  # Auth request handlers
│   │       ├── auth.repository.ts  # Database operations
│   │       ├── auth.routes.ts      # Auth routes
│   │       ├── auth.schemas.ts     # Zod validation schemas
│   │       └── auth.service.ts     # Business logic
│   ├── types/
│   │   └── express.d.ts       # Express type extensions
│   ├── utils/
│   │   ├── errors.ts          # Custom error classes
│   │   └── password.ts        # Password utilities
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore
├── docker-compose.yml         # PostgreSQL container
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/prakashsilwal/ITC_Project.git
cd ITC_Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/itc_db?schema=public
BCRYPT_ROUNDS=12
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
```

### 4. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

Verify the container is running:

```bash
docker ps
```

### 5. Generate Prisma Client

```bash
npm run db:generate
```

### 6. Run Database Migration

```bash
npm run db:push
```

### 7. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

**GET** `/health`

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-27T12:00:00.000Z"
  },
  "error": null
}
```

### Get Country Codes

**GET** `/api/v1/auth/country-codes`

Success Response (200):
```json
{
  "success": true,
  "data": [
    { "country": "United States", "code": "+1" },
    { "country": "Canada", "code": "+1" },
    { "country": "United Kingdom", "code": "+44" }
  ],
  "error": null
}
```

### Sign Up

**POST** `/api/v1/auth/signup`

Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "SecurePass123!@#",
  "country": "United States",
  "countryCode": "+1",
  "phoneNumber": "2125551234"
}
```

Success Response (201):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "country": "United States",
    "countryCode": "+1",
    "phoneNumber": "2125551234",
    "role": "USER"
  },
  "error": null
}
```

Error Response (400 - Validation):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "password: Password must be at least 12 characters long"
  }
}
```

Error Response (409 - Conflict):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email already registered"
  }
}
```

### Login

**POST** `/api/v1/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}
```

Success Response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "country": "United States",
      "countryCode": "+1",
      "phoneNumber": "2125551234",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

Error Response (401 - Unauthorized):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### Get Current User Profile (Protected)

**GET** `/api/v1/auth/me`

Headers:
```
Authorization: Bearer <jwt-token>
```

Success Response (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "country": "United States",
    "countryCode": "+1",
    "phoneNumber": "2125551234",
    "role": "USER"
  },
  "error": null
}
```

Error Response (401 - Unauthorized):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Authentication failed"
  }
}
```

## Password Policy

The signup endpoint enforces strict password requirements:

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}; ':"\\|,.<>/?)
- Cannot contain common passwords (password123, qwerty123, admin123, etc.)

## Validation Rules

- **Email**: Valid email format, automatically normalized (trimmed and lowercased)
- **First Name**: Letters, spaces, hyphens, and apostrophes only
- **Last Name**: Letters, spaces, hyphens, and apostrophes only
- **Phone Number**: Digits only (no spaces or special characters)
- **Country**: Must be from the list of supported countries
- **Country Code**: Must match the selected country

## Security Features

- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Password Hashing**: bcrypt with 12 rounds (configurable)
- **JWT Authentication**: Stateless authentication with 7-day token expiration
- **Input Validation**: Zod schemas for all requests
- **Error Handling**: Centralized error handling with no sensitive data exposure
- **Logging**: Structured logging with Pino (no passwords or sensitive data logged)
- **Request Size Limits**: 10MB limit for JSON and URL-encoded payloads
- **Generic Error Messages**: Prevents email enumeration attacks on login

## Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes without migration
npm run db:studio    # Open Prisma Studio (database GUI)
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Database Management

### View Database with Prisma Studio

```bash
npm run db:studio
```

Opens a GUI at `http://localhost:5555`

### Stop PostgreSQL Container

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
npm run db:migrate
```

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Sign up
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!@#"
  }'
```

### Using HTTPie

```bash
# Health check
http GET :3000/health

# Sign up
http POST :3000/api/v1/auth/signup \
  email=test@example.com \
  password=SecurePass123!@#
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection URL | - | Yes |
| `BCRYPT_ROUNDS` | bcrypt hashing rounds | `12` | No |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_PASSWORD` | 400 | Password doesn't meet requirements |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `AUTH_FAILED` | 401 | Authentication failed (missing/invalid token) |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `USER_NOT_FOUND` | 404 | User not found |
| `EMAIL_ALREADY_EXISTS` | 409 | Email is already registered |
| `NOT_FOUND` | 404 | Route not found |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Development Tips

1. **Check logs**: Development logs are pretty-printed for readability
2. **Use Prisma Studio**: Visual database browser at `localhost:5555`
3. **Hot reload**: The dev server auto-restarts on file changes
4. **Type safety**: TypeScript strict mode catches errors early

## Troubleshooting

### PostgreSQL connection failed

1. Ensure Docker is running: `docker ps`
2. Check container health: `docker-compose ps`
3. Verify DATABASE_URL in `.env`

### Prisma client not found

Run: `npm run db:generate`

### Port already in use

Change `PORT` in `.env` or kill the process:

```bash
lsof -ti:3000 | xargs kill
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database URL
3. Run migrations: `npm run db:migrate`
4. Build: `npm run build`
5. Start: `npm start`

## License

ISC
