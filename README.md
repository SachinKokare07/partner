# 🤝 Partner Progress Tracking App

A full-stack web application for partner collaboration, progress tracking, and learning together.

## ✨ Features

- 👥 **Partner System**: Send requests, accept partners, chat with friends
- 💬 **Real-time Chat**: Message multiple friends with live updates
- 📝 **Notes**: Create DSA/Dev notes, view partner's notes
- 📊 **Progress Posts**: Track learning progress with DSA scores
- 🔥 **Streak System**: Maintain daily posting streaks
- 👍 **Social Features**: Like and comment on posts
- 🔐 **Secure Auth**: Email/Password with OTP verification

## 🏗️ Tech Stack

### Frontend
- React 19.1.1
- Vite (rolldown-vite 7.1.14)
- Tailwind CSS 4.1.14
- Firebase Client SDK 12.4.0
- Recharts for data visualization

### Backend
- Node.js + Express 4.18.2
- Firebase Admin SDK 12.0.0
- Nodemailer 6.9.8 (OTP emails)
- Firestore (database)

## 🚀 Deployment

Your app is ready to deploy! Follow these guides:

1. **Quick Start**: See [`QUICK_START.md`](./QUICK_START.md) - Deploy in 10 minutes
2. **Pre-Deployment Checklist**: See [`PRE_DEPLOYMENT_CHECKLIST.md`](./PRE_DEPLOYMENT_CHECKLIST.md)
3. **Detailed Guide**: See [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

### Recommended Hosting
- **Frontend**: Vercel (free tier, automatic deployments)
- **Backend**: Render (free tier, persistent server)
- **Database**: Firebase Firestore (generous free tier)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- Firebase project
- Gmail account (for OTP emails)

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

Backend runs on http://localhost:5000

### Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

Frontend runs on http://localhost:5173

## 📁 Project Structure

```
Partner/
├── Backend/           # Express API server
│   ├── server.js     # Main server file
│   ├── .env.example  # Environment variables template
│   └── package.json
├── Frontend/         # React application
│   ├── src/
│   │   ├── pages/   # Main pages (Home, Chat, Notes, etc.)
│   │   ├── context/ # Auth context
│   │   └── components/
│   ├── vercel.json  # Vercel configuration
│   ├── .env.example # Environment variables template
│   └── package.json
├── firestore.rules  # Firebase security rules
├── QUICK_START.md
├── DEPLOYMENT_GUIDE.md
└── PRE_DEPLOYMENT_CHECKLIST.md
```

## 🔐 Environment Variables

### Backend
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase admin private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `EMAIL_USER` - Gmail address for OTP
- `EMAIL_PASS` - Gmail app password
- `FRONTEND_URL` - Your frontend URL (for CORS)

### Frontend
- `VITE_BACKEND_URL` - Your backend API URL

## 🔥 Firebase Setup

1. Create project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Create composite indexes (see console for links)

## 📝 Features Breakdown

### Authentication
- Email/Password registration with OTP verification
- Secure login with Firebase Auth
- Profile management

### Partner System
- Search users by email
- Send/accept/reject partner requests
- Remove current partner
- Multiple friend conversations

### Chat
- Real-time messaging with Firestore
- Multi-friend chat switcher
- Friend list dropdown
- Message timestamps

### Notes
- Create DSA/Dev notes
- View own and partner's notes
- Category filtering
- Delete notes

### Posts
- Progress tracking posts
- DSA score calculation
- Streak system
- Like and comment system
- View partner's posts feed

## 🐛 Troubleshooting

**Notes/Posts not loading?**
- Create composite indexes in Firebase Console
- Check Firestore rules are deployed

**CORS errors?**
- Verify FRONTEND_URL in backend environment variables
- Check frontend is using correct backend URL

**OTP not sending?**
- Verify Gmail app password is correct
- Check EMAIL_USER and EMAIL_PASS

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ by Sachin

---

**Ready to deploy?** See [`QUICK_START.md`](./QUICK_START.md) to get started!
