# Skill-Link Frontend

The frontend for Skill-Link, a decentralized service marketplace.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure

- `src/features`: Modular feature-based architecture (auth, jobs, organisation, products, workers).
- `src/shared`: Shared components, hooks, and utilities.
- `src/shared/components/ui`: Custom path for **shadcn/ui** components.
- `src/pages`: Application pages.
- `src/services`: API services.

## Currently Implemented

### 1. Authentication System
- **Login**: Secure login form with validation.
- **Registration**: Multi-step registration process for different user roles.
- **Layouts**: Dedicated layout for auth-related pages.

### 2. UI Foundation
- **shadcn/ui Integration**: Fully configured with Tailwind v4 and custom directory structure (`src/shared/components/ui`).
- **Path Aliases**: Support for `@` (src) and `@/shared` aliases.
- **Theme System**: Custom theme with CSS variables in `src/index.css`.

### 3. Features (In Progress)
- **Jobs**: Infrastructure for job listings.
- **Organisation**: Module for organization management.
- **Products**: Product management layer.
- **Workers**: Worker profile and listing components.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Add shadcn Components**:
    ```bash
    npx shadcn@latest add [component-name]
    ```

## Documentation

- [SHADCN.md](./SHADCN.md): Full guide for using shadcn/ui components in this project.
