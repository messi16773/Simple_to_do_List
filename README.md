# Simple To-Do App

A modern full-stack todo application built with React, Tailwind CSS, tRPC, Drizzle ORM, and Vite.

This repository contains a starter todo app with:

- Todo creation, editing, and deletion
- Full-stack TypeScript and tRPC for type-safe data flow
- A React frontend with reusable UI components
- A backend API layer and database schema support

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run the app locally:
   ```bash
   pnpm dev
   ```
3. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## Project Structure

- `client/` — Frontend React application
- `server/` — Backend tRPC routers and database helpers
- `drizzle/` — Database schema and migrations
- `shared/` — Shared constants and TypeScript types

## Environment

Create a `.env` file with:

```env
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-secret-key
```

## Development Workflow

- Update the database schema in `drizzle/schema.ts`
- Add query helpers in `server/db.ts`
- Add tRPC procedures in `server/routers.ts`
- Build UI in `client/src/pages` and `client/src/components`

## Testing

Run unit tests with:

```bash
pnpm test
```

## Notes

This README has been simplified to focus on the todo app and remove platform-specific references.
