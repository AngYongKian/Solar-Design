# PV System Calculator

## Overview

A comprehensive photovoltaic (PV) system design tool that provides three specialized calculators for solar panel installations. The application enables users to calculate optimal panel layouts, inverter sizing configurations, and cable specifications for solar power systems. Built as a full-stack web application with a React frontend and Express.js backend, it offers interactive visualizations and stores calculation results for future reference.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React Single Page Application**: Built with React 18 using TypeScript, featuring a component-based architecture with three main calculator modules - panel layout, inverter sizing, and cable sizing. Uses Wouter for client-side routing instead of React Router for a lightweight solution.

**UI Component System**: Implements shadcn/ui design system with Radix UI primitives and Tailwind CSS for consistent styling. Components follow the "new-york" style variant with CSS variables for theming. The design system provides comprehensive form controls, data visualization components, and responsive layouts.

**State Management**: Uses React Query (TanStack Query) for server state management, form state with React Hook Form and Zod validation, and local component state for UI interactions. This approach separates concerns between server data, form data, and UI state.

**Data Visualization**: Custom canvas-based diagrams for panel layout visualization and string configuration diagrams. The visualization components render interactive representations of solar panel arrangements and electrical configurations.

### Backend Architecture

**Express.js REST API**: Node.js backend with Express middleware for handling calculation requests. Implements three main calculation endpoints (`/api/calculate/panel-layout`, `/api/calculate/inverter-sizing`, `/api/calculate/cable-sizing`) with request validation and error handling.

**Calculation Engine**: Pure TypeScript calculation functions for each calculator type, implementing industry-standard formulas for solar system design. Calculations are performed server-side and results are validated before storage.

**Hybrid Storage System**: Implements a storage interface pattern that supports both in-memory storage (for development) and PostgreSQL database (for production). The interface allows seamless switching between storage backends without changing application logic.

**Request/Response Flow**: All calculation requests are validated using Zod schemas, processed through calculation engines, stored in the database, and return both results and calculation IDs for future reference.

### Data Storage

**Database Schema**: PostgreSQL database with Drizzle ORM for type-safe database operations. Two main tables: `users` for basic user management and `calculations` for storing calculation inputs, results, and metadata. Uses JSONB columns for flexible storage of calculation-specific data.

**Schema Validation**: Drizzle-Zod integration provides runtime validation that matches database schema constraints. Input schemas for each calculator type ensure data integrity from frontend to database.

**Migration Management**: Drizzle Kit handles database migrations with configuration pointing to shared schema file, supporting both development and production deployments.

### Build and Development

**Vite Build System**: Modern build tool with React plugin, TypeScript support, and development-specific features like error overlays and hot module replacement. Separates client and server builds with different output directories.

**TypeScript Configuration**: Monorepo-style TypeScript setup with path aliases for clean imports. Shared types and schemas between frontend and backend ensure type safety across the full stack.

**Development Workflow**: Integrated development server that handles both frontend and backend in development mode, with production build process that creates optimized static assets and bundled server code.

## External Dependencies

**Database Infrastructure**: PostgreSQL database with Neon serverless driver for connection pooling and edge compatibility. Session storage uses connect-pg-simple for PostgreSQL-backed sessions.

**UI Component Libraries**: Radix UI provides unstyled, accessible component primitives. Tailwind CSS handles styling with custom design tokens. Additional UI libraries include Embla Carousel for interactive components and Lucide React for consistent iconography.

**Form and Validation**: React Hook Form for performant form handling with Zod for runtime type validation. Schema validation is shared between frontend forms and backend API validation.

**Development Tools**: Vite plugins for development experience including error modals, development banners, and Replit-specific tooling. ESBuild handles server-side bundling for production deployments.