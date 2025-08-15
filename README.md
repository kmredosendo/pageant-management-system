# Pageant Management System

A modern web application for managing pageant events, contestants, judges, scoring, and results. Built with **Next.js 14+**, **shadcn/ui**, **Prisma ORM**, and **MySQL**.

---

## Features
- Event, contestant, judge, and criteria management
- Secure admin dashboard
- Real-time scoring and results
- Print-friendly reports
- Modern, responsive UI (shadcn/ui + TailwindCSS)

---

## Prerequisites

### 1. Node.js
- Download and install Node.js (v18 or later recommended):
  - [https://nodejs.org/](https://nodejs.org/)
- Verify installation:
  ```powershell
  node -v
  npm -v
  ```

### 2. MySQL
- Download and install MySQL Community Server:
  - [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
- Start MySQL server and create a database:
  1. Open MySQL command line or a GUI (e.g., MySQL Workbench).
  2. Run:
     ```sql
     CREATE DATABASE pageant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     CREATE USER 'pageant_user'@'localhost' IDENTIFIED BY 'your_password';
     GRANT ALL PRIVILEGES ON pageant_db.* TO 'pageant_user'@'localhost';
     FLUSH PRIVILEGES;
     ```

---

## Getting Started (Local Development)

### 1. Clone the Repository
```powershell
git clone https://github.com/kmredosendo/pageant.git
cd pageant
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Configure Environment Variables
- Create a `.env` file in the root directory:
  ```env
  DATABASE_URL="mysql://pageant_user:your_password@localhost:3306/pageant_db"
  NEXTAUTH_SECRET="your_random_secret"
  # Add other environment variables as needed
  ```

### 4. Set Up the Database
- Run Prisma migrations and generate client:
  ```powershell
  npx prisma migrate dev --name init
  npx prisma generate
  ```
- (Optional) Seed the database:
  ```powershell
  npx ts-node prisma/seed.ts
  ```

### 5. Start the Development Server
```powershell
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Production)

1. **Build the app:**
   ```powershell
   npm run build
   ```
2. **Start the server:**
   ```powershell
   npm start
   ```
3. **Set environment variables** as in `.env` (ensure production DB credentials).
4. **Secure your MySQL instance** (use strong passwords, restrict access).
5. **(Optional) Use a process manager** (e.g., PM2) for reliability.

---

## Project Structure
```
prisma/           # Prisma schema & migrations
src/app/          # Next.js app directory (pages, API routes)
components/       # UI components (shadcn/ui)
lib/              # Database/API logic
public/           # Static assets
```

---

## Useful Commands
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npx prisma studio` — Open Prisma Studio (DB GUI)
- `npx prisma migrate dev` — Run migrations
- `npx prisma generate` — Generate Prisma client

---

## Troubleshooting
- **Port in use:** Change the port in `package.json` or set `PORT` env variable.
- **MySQL connection errors:** Check `DATABASE_URL` and MySQL server status.
- **Prisma errors:** Run `npx prisma generate` and ensure migrations are up to date.

---

## License
MIT

---

## Credits
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)

---

## Donations
If you find this project helpful, consider supporting its development:

- [GitHub Sponsors](https://github.com/sponsors/kmredosendo)
- [Buy Me a Coffee](https://www.buymeacoffee.com/kmredosendo)
- [Ko-fi](https://ko-fi.com/kmredosendo)
- [PayPal](https://www.paypal.me/kmredosendo)

Thank you for your support!
