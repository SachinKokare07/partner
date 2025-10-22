# Partner Backend API

Express.js backend with Firebase Admin SDK for the Partner coding dashboard application.

## Features

- **Authentication**: User registration, login, and token management
- **User Management**: Profile CRUD operations and user search
- **Partner System**: Send/accept/reject partner requests, view partner details
- **Progress Tracking**: DSA, Dev, Streak tracking with leaderboard
- **Firebase Integration**: Firestore database and Firebase Auth

## Tech Stack

- Node.js + Express.js
- Firebase Admin SDK
- Firestore Database
- CORS enabled
- ES Modules

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **partner-b4e79**
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file (keep it secure!)

### 3. Create Environment File

Create a `.env` file in the `Backend` folder:

```env
FIREBASE_PROJECT_ID=partner-b4e79
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@partner-b4e79.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
PORT=5000
FRONTEND_URL=http://localhost:5174
```

**Getting values from the downloaded JSON:**
- `FIREBASE_PROJECT_ID` → `project_id`
- `FIREBASE_CLIENT_EMAIL` → `client_email`
- `FIREBASE_PRIVATE_KEY` → `private_key` (keep the quotes and \n characters)

### 4. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `GET /me` - Get current user profile (protected)
- `POST /refresh` - Refresh authentication token (protected)

### Users (`/api/users`)
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `GET /search?email=xxx` - Search user by email (protected)

### Partner (`/api/partner`)
- `POST /request` - Send partner request (protected)
- `GET /requests` - Get pending requests (protected)
- `POST /accept` - Accept partner request (protected)
- `POST /reject` - Reject partner request (protected)
- `GET /details` - Get partner details (protected)

### Progress (`/api/progress`)
- `POST /update` - Update progress (DSA/Dev/Streak) (protected)
- `GET /` - Get user progress (protected)
- `POST /increment` - Increment specific field (protected)
- `GET /leaderboard?limit=10` - Get top users (protected)

### Health
- `GET /health` - Server health check
- `GET /` - API information

## Protected Routes

Protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Testing with Postman/Thunder Client

### 1. Register a User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User",
  "mobile": "9876543210",
  "course": "B.Tech CSE",
  "college": "Test College",
  "year": "3rd Year"
}
```

### 2. Get User Profile
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-firebase-token>
```

### 3. Update Progress
```http
POST http://localhost:5000/api/progress/update
Authorization: Bearer <your-firebase-token>
Content-Type: application/json

{
  "dsa": 10,
  "dev": 5,
  "streak": 3
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `partner-b4e79` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-xxxxx@...` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5174` |

## Security Notes

- Never commit `.env` file to version control
- Keep service account JSON file secure
- Use environment variables for all secrets
- Frontend must send valid Firebase ID tokens

## Firestore Structure

```
users/{uid}
  - name: string
  - email: string
  - mobile: string (optional)
  - course: string
  - college: string
  - year: string
  - startDate: timestamp
  - dsa: number (default: 0)
  - dev: number (default: 0)
  - streak: number (default: 0)
  - total: number (default: 0)
  - partner: string (uid) | null
  - pendingRequests: array of uids
  - lastActivity: timestamp
```

## Troubleshooting

### Error: "Firebase app not initialized"
- Check if `.env` file exists and has correct values
- Verify FIREBASE_PRIVATE_KEY has proper \n formatting

### Error: "CORS blocked"
- Ensure FRONTEND_URL in `.env` matches your frontend dev server
- Default is `http://localhost:5174`

### Error: "Token verification failed"
- Frontend must send Firebase ID token (not custom token)
- Token format: `Authorization: Bearer <token>`

## Next Steps

1. ✅ Backend API complete
2. 🔄 Frontend integration - Update `src/context/AuthContext.jsx` to call backend APIs
3. 🔄 Test registration and login flow
4. 🔄 Deploy backend (optional)

## License

MIT
