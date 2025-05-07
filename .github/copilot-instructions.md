# GitHub Copilot Instructions for BondFyre

## Project Overview

BondFyre is a group dating app built with React Native (frontend) and Node.js/Express (backend). The core concept is:

- Users can add up to 3 friends to their group
- Matching happens between individuals, but when a user matches with someone AND one of their friends matches with one of the other person's friends, a group chat is created
- The app features a swipe-based matching system similar to popular dating apps

## Project Structure

```
/
├── app/                       # React Native frontend
│   ├── (tabs)/                # Tab navigation
│   ├── auth/                  # Authentication screens
│   ├── components/            # Reusable UI components
│   ├── config/                # App configuration
│   ├── constants/             # App constants
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API services
│   ├── theme/                 # UI theme
│   ├── types/                 # TypeScript types
│   ├── _layout.tsx            # Layout components
│   └── +not-found.tsx         # 404 page
│
├── backend/                   # Express backend
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── types/             # TypeScript types
│   │   └── server.ts          # Server entry point
│   └── ...
│
└── scripts/                   # Utility scripts
```

## Frontend Guidelines

### 1. Component Development

When developing new components:

```typescript
// This component is part of the BondFyre group dating app UI
// It should follow the established design system in app/theme
// All components should be responsive and support both iOS and Android
```

### 2. Screen Development

For new screens:

```typescript
// This screen belongs to the BondFyre dating app
// It should use the _layout.tsx wrapper for consistent styling
// Make sure to handle authentication state using the auth context
// All screens should handle loading, error and empty states gracefully
```

### 3. Swipe Functionality

```typescript
// The swipe functionality should:
// - Support smooth left/right swipe gestures
// - Show appropriate animations on swipe actions
// - Include like/dislike buttons as alternative to swiping
// - Handle edge cases (no more profiles, etc.)
// - Implement proper gesture cancellation
// Use react-native-gesture-handler and react-native-reanimated for animations
```

### 4. Group Friend Selection

```typescript
// Friend selection component should:
// - Allow searching/adding friends from contacts
// - Enforce maximum of 3 friends per user
// - Show pending friend requests
// - Allow removing friends
// - Display friend avatars with online/offline status
```

### 5. Group Chat Implementation

```typescript
// Group chat functionality should:
// - Support real-time messaging
// - Show all participants (matched users and their friends)
// - Include typing indicators
// - Support multimedia messages
// - Handle message read/delivered states
// - Maintain chat history when reopening the app
```

### 6. Authentication Flow

```typescript
// Authentication should include:
// - Email/password signup and login
// - Social auth options (Google, Facebook)
// - Password reset functionality
// - Email verification
// - Persistent login sessions
// - Secure token storage
```

## Backend Guidelines

### 1. API Endpoints

When creating new API endpoints:

```javascript
// All endpoints should:
// - Follow RESTful conventions
// - Include proper validation
// - Implement appropriate error handling
// - Use meaningful HTTP status codes
// - Be protected by authentication middleware when needed
// - Return standardized JSON responses
```

### 2. User Model

```javascript
// User model should include:
// - Basic info (name, email, password hash, etc.)
// - Profile information (bio, photos, preferences)
// - Friend relationships (array of User references, max 3)
// - Match history (likes, dislikes, matches)
// - Authentication details (tokens, social auth info)
```

### 3. Match Algorithm

```javascript
// The matching algorithm should:
// - Register individual user likes/dislikes
// - Check for mutual likes between users
// - Identify when a user's friend and a match's friend also match
// - Create group matches when appropriate conditions are met
// - Trigger notifications when group matches occur
```

### 4. Group Chat System

```javascript
// The chat system should:
// - Use WebSockets for real-time communication
// - Store message history in the database
// - Support media attachments
// - Implement message delivery status
// - Handle group chat permissions
// - Support basic moderation features
```

### 5. Database Queries

```javascript
// Database queries should:
// - Be optimized for performance
// - Use proper indexing
// - Implement pagination where appropriate
// - Handle large datasets efficiently
// - Include error handling for DB operations
// - Use transactions where needed
```

## Testing Guidelines

### 1. Frontend Tests

```typescript
// Frontend tests should:
// - Test component rendering
// - Verify user interactions
// - Mock API responses
// - Test navigation flows
// - Verify form validations
// - Test edge cases (empty states, errors)
```

### 2. Backend Tests

```javascript
// Backend tests should:
// - Test API endpoints
// - Verify authentication
// - Test database operations
// - Include edge cases
// - Mock external services
// - Test the matching algorithm thoroughly
```

## Common Features

### 1. Profile Recommendations

```typescript
// The recommendation engine should:
// - Filter by user preferences
// - Consider location proximity
// - Prioritize profiles with friend connection potential
// - Avoid showing previously rejected profiles
// - Implement a scoring system for compatibility
```

### 2. Notifications

```typescript
// Notifications should be sent for:
// - New matches
// - Group match creation
// - Chat messages
// - Friend requests
// - Profile updates from matches
```

### 3. User Profiles

```typescript
// Profile components should:
// - Display user photos with carousel
// - Show basic information (name, age)
// - Display bio and interests
// - Show mutual friends when applicable
// - Include reporting functionality
```

## Security Considerations

```javascript
// All security implementations should:
// - Follow OWASP best practices
// - Implement proper authentication
// - Use secure password storage
// - Validate and sanitize all inputs
// - Implement rate limiting
// - Use HTTPS for all API communications
```

## Performance Guidelines

```typescript
// Performance optimizations should focus on:
// - Minimizing component re-renders
// - Efficient list rendering
// - Image optimization
// - Lazy loading content
// - Caching API responses
// - Using web workers for intensive operations
```

## Development Workflow

When implementing new features:

1. Create or update TypeScript interfaces in the appropriate types folder
2. Implement backend models and controllers if needed
3. Create API services in the frontend services directory
4. Develop UI components in the components folder
5. Implement screens that utilize the components and services
6. Add tests for all new functionality

## File and Directory Naming Conventions

- React Native components: PascalCase (e.g., `SwipeCard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useMatches.ts`)
- Contexts: camelCase with 'Context' suffix (e.g., `authContext.ts`)
- API services: camelCase (e.g., `matchService.ts`)
- Backend files: camelCase (e.g., `userController.js`)
- Test files: Same name as the file being tested with `.test` suffix

## Code Style Guidelines

- Use TypeScript for type safety
- Prefer functional components with hooks over class components
- Use async/await for asynchronous operations
- Follow the established project patterns for state management
- Keep components focused on a single responsibility
- Use comments to explain complex logic
- Follow the DRY principle (Don't Repeat Yourself)

---

**Note**: These instructions are tailored to help GitHub Copilot understand the BondFyre project structure and requirements. Feel free to modify or expand this document as the project evolves.
