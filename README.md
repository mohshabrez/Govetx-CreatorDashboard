# Creator Dashboard

A web application that allows content creators to manage their profile, earn credits, and interact with content through a personalized feed.

## Features

### User Authentication
- Register/Login with JWT authentication
- Role-based access control (User, Admin)

### Credit Points System
- Earn credits for daily logins, profile completion, and feed interactions
- Credit balance tracking on dashboard
- Admin panel for user credit management

### Feed Aggregator
- Multi-platform content aggregation from Reddit and Twitter
- Interactive scrollable feed
- Content actions: save, share, and report

### Dashboard
- User dashboard with credit stats, saved content, and activity history
- Admin dashboard with user analytics and feed activity monitoring

## Technology Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Shadcn UI Components

### Backend
- Node.js
- Express.js
- MongoDB Atlas

### Deployment
- Backend: Google Cloud Run
- Frontend: Netlify
- Database: MongoDB Atlas

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Reddit and Twitter API credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/creator-dashboard.git
cd creator-dashboard
```

2. Run the setup script

**Windows (PowerShell):**
```bash
./setup.ps1
```

**Linux/macOS (Bash):**
```bash
chmod +x setup.sh
./setup.sh
```

These scripts will:
- Install dependencies for both client and server
- Create example `.env` files if they don't exist
- Guide you through next steps

Alternatively, you can install dependencies manually:

```bash
# Install all dependencies
npm run install:all

# Or install them separately
npm install
cd client && npm install
```

3. Environment Setup
Create `.env` files in both server and client directories with the required environment variables. The setup scripts will create example files for you.

### Running the Application

#### Development Mode

Start both server and client using the provided scripts:

**Windows (PowerShell):**
```bash
./start-dev.ps1
```

**Linux/macOS (Bash):**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

Or start them individually:

**Windows (PowerShell):**
```bash
# Server
npm run dev:server:win

# Client
npm run dev:client
```

**Linux/macOS (Bash):**
```bash
# Server
npm run dev:server

# Client
npm run dev:client
```

The application will be available at:
- Frontend: http://localhost:5000
- Backend API: http://localhost:3000

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Deployment Overview

#### Backend (Google Cloud Run)
1. Set up a Google Cloud Platform account
2. Install Google Cloud SDK
3. Build and deploy using the included Dockerfile:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/creator-dashboard-server
gcloud run deploy creator-dashboard-server --image gcr.io/YOUR_PROJECT_ID/creator-dashboard-server
```

#### Frontend (Netlify)
1. Set up a Netlify account
2. Connect your repository or deploy manually:
```bash
cd client
npm run build
netlify deploy --prod
```

## Project Structure

```
creator-dashboard/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   └── src/                # Source files
│       ├── components/     # Reusable UI components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions and APIs
│       ├── pages/          # Page components
│       └── App.tsx         # Main application component
├── server/                 # Backend Node.js/Express application
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── index.ts            # Server entry point
└── README.md               # Project documentation
```

## API Integrations

### Reddit API
The application uses Reddit's official API to fetch posts from specified subreddits and search for content.

Required credentials:
- Client ID
- Client Secret

### Twitter API
The application uses Twitter's v2 API to fetch tweets and search for content.

Required credentials:
- API Key
- API Secret
- Bearer Token

## User Guide

### For Regular Users
1. Register or login to your account
2. Explore the feed containing content from Reddit and Twitter
3. Save interesting content to view later
4. Share content with others via the share button
5. Report inappropriate content to administrators
6. Track your earned credits on the dashboard
7. View your saved content and activity history

### For Administrators
1. Login with administrator credentials
2. View user analytics and management tools
3. Manage user credit balances
4. Monitor reported content
5. Review system activity logs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/) 