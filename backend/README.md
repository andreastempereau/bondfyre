# 2UO API Backend

This is the backend API for the 2UO group dating app.

## Features

- User authentication and profile management
- Group creation and management
- Friend requests and friend relationships
- Swipe-based matching system
- Group chat functionality
- Direct and group messaging

## Getting Started

### Prerequisites

- Node.js 16+ or Bun
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/bondfyre
   JWT_SECRET=your_jwt_secret
   ```

### Running the Server

Development mode:

```
bun run dev
```

Production build:

```
bun run build
bun run start
```

## Database Seeding

To populate your database with dummy data for development and testing:

```
bun run seed
```

This will create:

- 30 users with random profiles
- Friend relationships between users
- User groups
- Swipe history
- Matches between users and groups
- Group chats and direct message history

All seeded users have the password: `password123`

## API Endpoints

Documentation for API endpoints coming soon.

## Technologies

- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- WebSockets for real-time chat
