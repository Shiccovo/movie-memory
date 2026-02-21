# Movie Memory

A Next.js web application where users can track their favorite movies and discover fun facts. Built with modern technologies including authentication, database persistence, and comprehensive test coverage.

## Features

- **User Authentication** — Sign up and log in securely with NextAuth
- **Favorite Movie Tracking** — Users can set and edit their favorite movie with optimistic UI updates
- **Fun Facts** — Discover random fun facts about movies with a single click
- **Error Handling** — Graceful error recovery with user-friendly messages and retry options
- **Responsive Design** — Built with Tailwind CSS for all screen sizes

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) with App Router
- **Language** — [TypeScript](https://www.typescriptlang.org)
- **Database** — [PostgreSQL](https://postgresql.org) with [Prisma ORM](https://prisma.io)
- **Authentication** — [NextAuth.js](https://next-auth.js.org)
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com)
- **Testing** — [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
- **API** — AI-powered facts via [Vercel AI SDK](https://sdk.vercel.ai) with OpenAI

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured (see below)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-memory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:
```
DATABASE_URL=postgresql://user:password@localhost:5432/movie_memory
NEXTAUTH_SECRET=<your-secret-key>
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=<your-openai-api-key>
```

4. Set up the database:
```bash
npx prisma migrate dev
```

This will create the database schema and run migrations.

## Running the App

**Development:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build:**
```bash
npm run build
npm start
```

## Running Tests

**Run all tests once:**
```bash
npm test
```

**Watch mode (re-run on file changes):**
```bash
npm run test:watch
```

### Test Coverage

The project includes comprehensive tests for:

- **API Error Handling** (`tests/api.test.ts`) — Tests that the API client correctly throws `ApiError` for various HTTP status codes (401, 500, 422) and gracefully handles responses
- **Movie Edit Flow** (`tests/dashboard-client.test.tsx`) — Tests the complete user flow:
  - Displaying and editing the favorite movie
  - Optimistic UI updates
  - Server-side error recovery
  - Form validation
  - Cancel operation

All tests use Vitest with React Testing Library for accurate user behavior simulation.

## API Structure

### Client API (`lib/api.ts`)

The `api` object provides typed methods for server communication:

- `api.getMe()` — Fetch current user profile
- `api.updateMovie(movieName: string)` — Update user's favorite movie
- `api.getFact()` — Get a random fun fact

All methods throw `ApiError` on failure with:
- `status` — HTTP status code
- `message` — Error message from server or fallback message

### Example Error Handling

```typescript
try {
  await api.updateMovie("Inception");
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`Error (${err.status}): ${err.message}`);
  }
}
```

## Project Structure

```
.
├── app/
│   ├── dashboard/
│   │   ├── dashboard-client.tsx  # Client-side dashboard component
│   │   └── page.tsx              # Dashboard page
│   ├── api/
│   │   └── auth/                 # NextAuth API routes
│   ├── page.tsx                  # Home page
│   └── layout.tsx                # Root layout
├── lib/
│   ├── api.ts                    # API client
│   └── auth.ts                   # Auth configuration
├── prisma/
│   └── schema.prisma             # Database schema
├── tests/
│   ├── api.test.ts               # API client tests
│   ├── dashboard-client.test.tsx # Component tests
│   └── setup.ts                  # Test configuration
├── vitest.config.ts              # Vitest configuration
└── package.json
```

## Development Workflow

1. Make code changes
2. Run tests to ensure nothing breaks: `npm test`
3. View changes in development server: `npm run dev`
4. Build and test production: `npm run build`

## Database Schema

The project uses Prisma to manage the PostgreSQL database. Key models:

- **User** — Stores user profile, email, favorite movie
- **Fact** — Caches generated facts

Run `npx prisma studio` to view and manage data in a GUI.

## Error Handling

The app implements graceful error handling throughout:

- **Validation Errors** — Form validation with user-friendly messages
- **Server Errors** — Optimistic updates revert on failure, error displayed to user
- **Network Errors** — Retry mechanism and fallback error messages
- **Auth Errors** — Invalid sessions redirect to login

## Deployment

The app can be deployed to [Vercel](https://vercel.com) or any Node.js hosting platform.

For Vercel:
```bash
npm run build
vercel deploy
```

Ensure environment variables are configured in your hosting platform.

## Contributing

When adding features:
1. Write tests first (when appropriate)
2. Ensure all tests pass: `npm test`
3. Follow TypeScript strict mode
4. Run linter: `npm run lint`

## License

MIT
