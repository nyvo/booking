# Yoga Booking App

A web-based yoga booking platform for yoga studios and independent teachers to manage classes, students, and payments.

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + ShadCN UI
- **Font**: Geist (Sans & Mono)
- **Internationalization**: react-i18next (Norwegian)
- **Date Handling**: date-fns (planned)

## Requirements

- Node.js version **20.19+** or **22.12+**
- npm 10+

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information about the folder organization.

## Design System

### Colors
- **Primary**: Bright blue (#3B82F6)
- **Background**: White with generous spacing for an airy feel
- **Typography**: Geist font family

### Spacing
The design emphasizes lots of white space to create a clean, airy aesthetic.

## Language

- **Code, URLs, Comments**: English
- **User Interface**: Norwegian (Bokmål)

## Coding Standards

- TypeScript strict mode enabled
- No `any` types allowed
- Functional components with React hooks
- PascalCase for components
- camelCase for utilities
- Feature-based folder organization
- Absolute imports using `@/` alias

## Features (Planned)

### Teacher Dashboard
- Class management (single classes, courses, events)
- Student management
- Payment tracking
- Revenue reports
- Attendance tracking

### Student Interface
- Browse and search classes/courses/events
- Book classes with availability check
- View booking history
- Manage profile

### Mock Data Phase
Currently using mock data for development. Real database integration planned for later.

## Development Phases

### Phase 1: Foundation ✅
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS + ShadCN UI configuration
- [x] Geist font integration
- [x] i18n setup with Norwegian
- [x] Path aliases configured
- [x] Project folder structure
- [x] Design tokens and constants

### Phase 2: Mock Data Layer (Next)
- [ ] Create comprehensive mock data
- [ ] Build mock API service layer
- [ ] Create custom hooks for data management

### Phase 3: Teacher Dashboard
- [ ] Authentication placeholder
- [ ] Dashboard home with stats
- [ ] Class management
- [ ] Course series management
- [ ] Event management
- [ ] Student management
- [ ] Payment management

### Phase 4: Student Interface
- [ ] Browse classes
- [ ] Booking flow
- [ ] Student profile

### Phase 5: Polish
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Form validation
- [ ] Accessibility

## Contributing

This is a private project. Please follow the coding standards outlined above.

## License

Private project - All rights reserved
