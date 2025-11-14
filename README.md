# 🧠 Linkly Server

A TypeScript-based Express server for link management with MongoDB, JWT authentication, and metadata extraction.

## Features

- 🔐 JWT Authentication
- 🗃️ MongoDB with Mongoose
- 📝 TypeScript with strict type checking
- ✅ Zod validation
- 🛡️ Security middleware (Helmet, CORS)
- 📊 Request logging (Morgan)
- 🔍 Metadata extraction from URLs
- 🎯 ESLint & Prettier for code quality
- 🏗️ Scalable folder structure

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js 5.1
- **Database:** MongoDB
- **Language:** TypeScript 5.9
- **Validation:** Zod
- **Authentication:** JWT

## API Endpoints

### Authentication

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout user
- GET /api/auth/profile - Get user profile (protected)

### Bookmarks

All endpoints require authentication.

- GET /api/bookmarks - Get all bookmarks
- GET /api/bookmarks/:id - Get bookmark by ID
- POST /api/bookmarks - Create bookmark
- PUT /api/bookmarks/:id - Update bookmark
- DELETE /api/bookmarks/:id - Delete bookmark
- GET /api/bookmarks/search?q=... - Search bookmarks
- GET /api/bookmarks/tags/:tag - Get bookmarks by tag

## Scripts

- npm run dev # Start dev server
- npm run build # Build for production
- npm start # Run production server
- npm run type-check # Check TypeScript types
- npm run lint # Run ESLint
- npm run lint:fix # Fix ESLint errors
- npm run format # Format code with Prettier

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

## License

This project is licensed under the [MIT License](./LICENSE).
