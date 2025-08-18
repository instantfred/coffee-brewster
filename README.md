# Coffee Brewster

A minimal, modern web app that guides people through barista-style brewing, logs every session, and offers a "reverse brew" calculator.

## Features

- Step-by-step guided brew timer with contextual prompts
- Reverse brew calculator (specify cups → get recipe)
- Personal brewing logbook with notes and ratings
- Multi-method support (V60, Chemex, AeroPress, French Press, Moka Pot)
- Units toggle (metric/imperial) and temperature preferences
- Dark mode support
- Responsive design optimized for mobile brewing

## Tech Stack

**Backend**: Node.js 20, Express, TypeScript, Prisma ORM, PostgreSQL
**Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Zustand
**Testing**: Vitest, Jest, Supertest, React Testing Library

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Set up database**:
   ```bash
   npm run db:setup
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

   This starts:
   - API server on http://localhost:4000
   - Web app on http://localhost:5173

## Available Scripts

- `npm run dev` - Start both API and web servers
- `npm run build` - Build both applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier

## Project Structure

```
coffee-brewster/
├── apps/
│   ├── api/           # Express backend
│   └── web/           # React frontend
└── packages/
    ├── ui/            # Shared UI components
    └── config/        # Shared configs (ESLint, TypeScript)
```