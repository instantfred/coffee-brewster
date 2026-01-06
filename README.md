# Coffee Brewster ☕

A minimal, modern Progressive Web App (PWA) that guides people through barista-style brewing and logs every session.

## 🌟 Features

### Core Brewing Features
- **Step-by-step guided brewing timer** with contextual prompts and audio cues
- **Personal brewing logbook** with session tracking, notes, and 5-star ratings
- **5 brewing methods supported**: V60, Chemex, AeroPress, French Press, Moka Pot
- **Smart recommendations** for grind size, water temperature, and filter types

### User Experience
- **Progressive Web App (PWA)** - install on mobile/desktop for app-like experience
- **Offline functionality** with cached brewing methods and presets
- **Mobile vibration feedback** for brewing step notifications
- **Sound effects toggle** for audio cues during brewing
- **Units conversion system** (metric ↔ imperial) with user preferences
- **Dark/light mode** with system preference detection
- **Responsive design** optimized for mobile brewing sessions

### Technical Features
- **Secure authentication** with JWT and HTTP-only cookies
- **Real-time brewing guidance** with precise timing and pour schedules
- **Session analytics** with filtering, search, and detailed brewing history
- **Multi-tenant data separation** for user privacy
- **Comprehensive testing** with unit and integration test coverage

## 🛠️ Tech Stack

**Backend**: Node.js 20, Express, TypeScript, Prisma ORM, Supabase (PostgreSQL)
**Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Zustand
**PWA**: Service Worker, Web App Manifest, Offline Caching
**Testing**: Vitest, Jest, Supertest, React Testing Library
**Deployment**: Docker ready, Vercel/Netlify compatible

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** 
- **npm** (comes with Node.js)

### 1. Clone and Install
```bash
git clone https://github.com/instantfred/coffee-brewster.git
cd coffee-brewster
npm install
```

### 2. Environment Setup
Create environment file for the API:
```bash
# In apps/api/ directory
cat > apps/api/.env << EOF
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://your-supabase-connection-string"
JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long"
CORS_ORIGIN="http://localhost:5173"
EOF
```

> **Note**: Get your `DATABASE_URL` from your Supabase project settings under Database → Connection String (use the "Connection Pooling" string for better performance).

### 3. Database Setup
```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

# Seed with brewing methods
npm run db:seed
```

### 4. Start Development Servers
From the project root:
```bash
npm run dev
```

This starts:
- **API server**: http://localhost:4000
- **Web app**: http://localhost:5173

### 5. Open and Use
1. Open **http://localhost:5173** in your browser
2. **Register an account** to get started
3. **Choose a brewing method** and start your first guided brew!
4. **Check your logbook** to track brewing sessions

## 📱 PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Tap the "Add to Home Screen" option
3. Install for full-screen app experience with offline support

### On Desktop (Chrome/Edge/Safari)
1. Look for the install icon in the address bar
2. Click "Install Coffee Brewster"
3. Use as a native desktop app

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:api          # Start API server only  
npm run dev:web          # Start web app only

# Building
npm run build            # Build both applications
npm run typecheck        # Type check all code

# Testing  
npm test                 # Run all tests
npm run test:api         # Run backend tests only
npm run test:web         # Run frontend tests only

# Code Quality
npm run lint             # Lint all code
npm run format           # Format with Prettier

# Database
cd apps/api
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
```

## 📁 Project Structure

```
coffee-brewster/
├── apps/
│   ├── api/                    # Express.js Backend
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules (auth, methods, sessions)
│   │   │   ├── lib/            # Utilities (brew calculator, prisma)
│   │   │   ├── middleware/     # Auth, error handling
│   │   │   └── schemas/        # Zod validation schemas
│   │   ├── prisma/             # Database schema and seeds
│   │   └── __tests__/          # API integration tests
│   │
│   └── web/                    # React Frontend  
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── routes/         # Page components
│       │   ├── lib/            # API client, utilities
│       │   ├── state/          # Zustand stores
│       │   └── styles/         # Global CSS and Tailwind
│       ├── public/             # PWA manifest, icons
│       └── __tests__/          # Component tests
│
├── package.json                # Workspace configuration
└── README.md                   # This file
```

## 🔧 Configuration

### Database
- **Supabase PostgreSQL**: Hosted PostgreSQL database with connection pooling
- Get your connection string from Supabase project settings
- Use the "Connection Pooling" string for better performance

### Environment Variables
```bash
# apps/api/.env
NODE_ENV=development|production
PORT=4000
DATABASE_URL="postgresql://postgres:[password]@[host]/postgres"
JWT_SECRET="your-32-char-secret"
CORS_ORIGIN="http://localhost:5173"
```

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Backend tests (9 unit + integration tests)
cd apps/api && npm test

# Frontend tests (24 unit tests) 
cd apps/web && npm test
```

**Test Coverage:**
- ✅ Brew calculator algorithm (all 5 methods)
- ✅ Units conversion system (metric ↔ imperial)
- ✅ API endpoints (auth, settings, methods, sessions)
- ✅ Authentication flows and security
- ✅ Error handling and validation

## 🚢 Deployment

### Free Tier Deployment (Recommended)

Deploy to **100% free** hosting platforms with this stack:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

**📖 [Complete Deployment Guide](./DEPLOYMENT.md)** - Step-by-step instructions

**✅ [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)** - Verify everything works

### Quick Deploy Summary

1. **Database**: Create Supabase project → Get connection string
2. **Backend**: Deploy to Render → Add environment variables → Deploy
3. **Frontend**: Deploy to Vercel → Add API URL → Deploy
4. **Configure**: Update CORS settings → Seed database → Test

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions with screenshots.

### Alternative: Docker
```bash
# Build containers
docker build -t coffee-brewster-api ./apps/api
docker build -t coffee-brewster-web ./apps/web

# Run with docker-compose
docker-compose up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ☕ and passion for great coffee
- Inspired by the specialty coffee community
- Brewing methods based on industry best practices

---

**Happy Brewing! ☕✨**

Made with [Claude Code](https://claude.ai/code)