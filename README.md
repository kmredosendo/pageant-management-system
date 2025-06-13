# Pageant System

This is a Next.js web-based pageant system using shadcn UI, lucide.dev icons, and MySQL. All UI components use shadcn UI. Built with TypeScript and follows best practices for Next.js App Router projects.

## Features
- Landing Page: Judge selector, proceed to scoring
- Admin Login: Custom authentication (no 3rd party)
- Admin Dashboard (SPA):
  - Manage events
  - Manage contestants, judges, criteria for selected event
  - View contest results

## Tech Stack
- Next.js (App Router, TypeScript)
- shadcn UI
- lucide.dev icons
- MySQL (via Prisma ORM)

## Getting Started
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Set up your `.env` file for MySQL connection (see `.env.example`).
3. Run the development server:
   ```powershell
   npm run dev
   ```

## Customization
- All UI components are from shadcn UI.
- Icons are from lucide.dev.

## License
MIT
