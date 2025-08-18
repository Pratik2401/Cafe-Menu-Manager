# Snap2Eat Mobile Web App

## What
Snap2Eat is a mobile-first web application designed for cafes and restaurants to manage their menu, daily offers, events, and customer engagement. The app is optimized for mobile devices, with a maximum container width of 480px, ensuring a seamless and intuitive experience for users on smartphones.

## How
- **Frontend:** Built with React and Bootstrap, using a modular component structure. The UI is styled for mobile screens, with responsive layouts and touch-friendly controls.
- **Backend:** Node.js/Express API (in the `backend/` folder) handles data management, authentication, and business logic.
- **Dynamic Theming:** The app supports dynamic theme loading from the backend, allowing real-time color and style updates.
- **Routing:** React Router is used for client-side navigation, supporting both customer and admin flows.
- **State Management:** React Context is used for global state (e.g., API state, breadcrumbs, user info).
- **Deployment:** The app is designed for easy deployment on platforms like Vercel, with static frontend and API backend.

## Why
- **Mobile Usage:** Most customers interact with cafes via their phones. A mobile-first design ensures the best user experience.
- **Easy Management:** Admins can manage menu items, offers, and events from a unified dashboard.
- **Branding:** Dynamic theming allows each cafe to reflect its unique brand.
- **Scalability:** Modular codebase supports easy feature addition and maintenance.

---

# Technical Interview Q&A

**Q1: How did you ensure the app is mobile-first?**
A1: All main containers use `max-width: 480px` and responsive CSS. Components are designed to stack vertically and use touch-friendly controls. Media queries and Bootstrap utilities further enhance mobile responsiveness.

**Q2: How does dynamic theming work?**
A2: The frontend loads a CSS file from the backend with a timestamp query param. This allows the backend to serve updated theme colors/styles without redeploying the frontend. Theme changes are reflected instantly for users.

**Q3: How is state managed across the app?**
A3: React Context is used for global state (API, breadcrumbs, user info). Local state is managed with React hooks. This keeps the app modular and easy to maintain.

**Q4: How do you handle navigation and routing?**
A4: React Router is used for client-side routing. There are separate routes for customer and admin flows, with protected routes for admin pages.

**Q5: How is the backend structured?**
A5: The backend uses Node.js/Express, with modular controllers and routes for different resources (menu, offers, events, etc.). It exposes RESTful APIs consumed by the frontend.

**Q6: How do you deploy the app?**
A6: The frontend is built and deployed as static files (e.g., on Vercel). The backend can be deployed on any Node.js-compatible server. Environment variables and config files are used for environment-specific settings.

**Q7: How do you ensure code quality and maintainability?**
A7: The project uses ESLint, modular folder structure, and clear documentation. Components are reusable and follow best practices for React and Node.js development.
