# Project Structure

## Overview
This document outlines the folder structure and organization of the yoga booking app.

## Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # ShadCN UI components
│   ├── teacher/        # Teacher-specific components
│   ├── student/        # Student-specific components
│   ├── shared/         # Shared components used across features
│   └── layout/         # Layout components (headers, footers, navigation)
│
├── pages/              # Page components
│   ├── teacher/        # Teacher dashboard pages
│   └── student/        # Student interface pages
│
├── hooks/              # Custom React hooks
│
├── types/              # TypeScript type definitions
│   └── index.ts        # Core types (User, Class, Booking, etc.)
│
├── services/           # API service layer (mock data for now)
│
├── mock-data/          # Mock data for testing
│
├── utils/              # Utility functions
│
├── lib/                # External library configurations
│   └── utils.ts        # ShadCN utilities
│
├── config/             # Configuration files
│   ├── design-tokens.ts  # Design system tokens
│   └── constants.ts      # App constants
│
├── i18n/               # Internationalization
│   ├── config.ts       # i18n configuration
│   └── locales/        # Translation files
│       └── no.json     # Norwegian translations
│
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Component Organization

### UI Components (`components/ui/`)
ShadCN UI components that can be customized and extended.

### Teacher Components (`components/teacher/`)
Components specific to teacher dashboard features like class management, student lists, payment views.

### Student Components (`components/student/`)
Components for student booking interface, class browsing, booking history.

### Shared Components (`components/shared/`)
Reusable components used by both teachers and students (cards, modals, forms, etc.).

### Layout Components (`components/layout/`)
App structure components like headers, navigation bars, sidebars, footers.

## Design System

### Design Tokens (`config/design-tokens.ts`)
Centralized design values:
- Colors (primary: bright blue, backgrounds, text colors)
- Spacing (generous whitespace for airy feel)
- Typography (Geist font family)
- Border radius, shadows, transitions

### Constants (`config/constants.ts`)
Application constants:
- Routes
- Enum values (statuses, types)
- Date formats
- Pagination defaults

## Internationalization

All user-facing text is in Norwegian. The i18n setup allows for future language additions.

### Translation Structure
- `common`: Common UI elements
- `auth`: Authentication
- `nav`: Navigation
- `teacher`: Teacher-specific translations
- `student`: Student-specific translations
- `errors`: Error messages
- `validation`: Form validation messages
- `dates`: Date-related text

## Coding Standards

- Code, URLs, comments: English
- User-facing text: Norwegian
- TypeScript strict mode enabled
- No `any` types
- Functional components with hooks
- PascalCase for components
- camelCase for utilities
- Feature-based organization
