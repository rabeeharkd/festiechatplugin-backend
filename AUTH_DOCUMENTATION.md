# Authentication System Documentation

## Overview
Complete JWT-based authentication system for the Festival Chat Plugin Backend with access/refresh token implementation, secure password hashing, and comprehensive user management.

## Features
- ✅ JWT Access & Refresh Tokens
- ✅ Bcrypt Password Hashing (Salt: 12)
- ✅ Email Validation
- ✅ Password Strength Requirements
- ✅ Rate Limiting on Auth Endpoints
- ✅ Account Locking (5 failed attempts)
- ✅ Multi-device Support
- ✅ Role-based Access Control
- ✅ Admin User Management
- ✅ Secure Token Storage in Database

## File Structure
```
├── models/User.js              # User schema with auth methods
├── controllers/authController.js # Authentication logic
├── middleware/authMiddleware.js  # JWT verification & protection
├── routes/authRoutes.js         # Authentication endpoints
└── config/database.js          # MongoDB connection
```

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Register new user | 5/15min |
| POST | `/api/auth/login` | Login user | 5/15min |
| POST | `/api/auth/refresh-token` | Refresh access token | 10/15min |

### Protected Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/logout` | Logout (single device) | ✅ |
| POST | `/api/auth/logout-all` | Logout all devices | ✅ |
| GET | `/api/auth/me` | Get user profile | ✅ |
| PUT | `/api/auth/me` | Update profile | ✅ |
| PUT | `/api/auth/change-password` | Change password | ✅ |

### Admin Endpoints
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/users` | List all users | Admin |
| PUT | `/api/auth/users/:id/status` | Update user status | Admin |
| PUT | `/api/auth/users/:id/role` | Update user role | Admin |

## Environment Variables Required
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_at_least_32_characters_long
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here_different_from_access_token_secret
JWT_REFRESH_EXPIRE=7d

# Database
MONGODB_URI=your_mongodb_connection_string
```

## Usage Examples

### 1. User Registration
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": "15m"
    }
  }
}
```

### 2. User Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 3. Protected Route Usage
```javascript
GET /api/auth/me
Authorization: Bearer <access_token>
```

### 4. Token Refresh
```javascript
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

## Security Features

### Password Requirements
- Minimum 6 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Account Protection
- 5 failed login attempts → 2-hour lock
- Automatic token cleanup
- Secure refresh token storage
- Rate limiting on auth endpoints

### Token Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic rotation on refresh
- Stored securely in database with expiration

## Middleware Usage

### Protect Routes
```javascript
import { protect } from './middleware/authMiddleware.js';

router.get('/protected-route', protect, (req, res) => {
  // req.user contains authenticated user
  res.json({ user: req.user });
});
```

### Role-based Protection
```javascript
import { protect, authorize } from './middleware/authMiddleware.js';

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

### Optional Authentication
```javascript
import { optionalAuth } from './middleware/authMiddleware.js';

router.get('/public-route', optionalAuth, (req, res) => {
  // req.user exists if token was provided and valid
  const message = req.user ? 'Welcome back!' : 'Welcome guest!';
  res.json({ message });
});
```

## Integration with Existing Chat System

The authentication system is now integrated with your existing chat system. To protect chat routes:

```javascript
// In chatRoutes.js
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

// Make chats require authentication
router.get('/', protect, async (req, res) => {
  // Only authenticated users can access chats
});

// Or make it optional
router.get('/', optionalAuth, async (req, res) => {
  // Both authenticated and guest users can access
});
```

## Testing the System

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Register a user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123"}'
   ```

4. **Access protected route:**
   ```bash
   curl -H "Authorization: Bearer <access_token>" \
     http://localhost:5000/api/auth/me
   ```

## Dependencies Added
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT token generation/verification
- `express-validator`: Request validation

## Next Steps
1. Set up proper JWT secrets in your `.env` file
2. Deploy the updated backend to Render
3. Update your frontend to use the authentication endpoints
4. Consider implementing email verification for enhanced security