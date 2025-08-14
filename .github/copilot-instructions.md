# copilot-instructions.md

## Purpose
These instructions guide GitHub Copilot (or any AI-assisted coding tool) when contributing to this project.  
The project is a **Next.js** web application using:
- **shadcn/ui** for UI components.
- **MySQL** as the database.
- **Prisma** ORM for database interaction.

Copilot must:
- Maintain **code consistency**.
- Update **all affected files** when changes are made.
- Follow **security best practices**.
- Avoid introducing redundant code.

---

## General Rules
1. **Framework & Libraries**
   - Use **Next.js 14+** with the `/app` directory structure unless otherwise specified.
   - UI components must use **shadcn/ui**.
   - Database access must use **Prisma ORM** with a MySQL backend.
   - State management: use **React hooks** or **context** unless Redux is explicitly required.

2. **Consistency**
   - Follow existing coding style, naming conventions, and file organization.
   - If modifying a function, **update all related references** across:
     - Components
     - API routes
     - Utility files
     - Tests
   - Always check for related CSS, TS/JS, and Prisma schema updates when making changes.

3. **Security**
   - Never expose secrets or credentials in source code.
   - Always validate user input before processing.
   - Use **server actions** or `/api` routes for sensitive operations.
   - Sanitize data before displaying in the UI.

4. **Database**
   - Use Prisma models for all database interactions.
   - Run `npx prisma generate` after updating the schema.
   - Write migrations with `npx prisma migrate dev` for dev and `npx prisma migrate deploy` for production.

5. **UI & Styling**
   - All UI components must come from **shadcn/ui** unless custom styling is required.
   - Use TailwindCSS for additional styles.
   - Keep components small, reusable, and accessible.

6. **File Structure**
   - Place pages in `/app`.
   - Place reusable UI components in `/components/ui`.
   - Place database and API logic in `/lib` and `/app/api`.
   - Store Prisma schema in `/prisma/schema.prisma`.

7. **Documentation**
   - Document major changes in code comments and update `README.md` if necessary.
   - For database changes, update ER diagrams and migrations documentation.

---

## Example Prompts for Copilot
When making changes, use prompts like:
- “Update the **user registration** flow and ensure all related components, API routes, and Prisma models are updated.”
- “Refactor this API endpoint to use **Prisma transactions** and update the UI to display error states.”
- “Add a new **shadcn/ui dialog** for confirming deletion, and ensure it works with the existing `/api/delete` route.”

---

## Pull Request Checklist
Before finalizing changes:
- [ ] Code compiles with `npm run build`.
- [ ] Database migrations are applied and tested.
- [ ] UI is responsive and accessible.
- [ ] No unused imports or console logs.
- [ ] All related files are updated consistently.

---

## Final Note
If asked to make a change:
- **Do not** only edit the file shown.
- **Always** search for other files that depend on the changed functionality.
- Apply updates consistently across **UI, API, database, and documentation**.
