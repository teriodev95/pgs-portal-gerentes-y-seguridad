# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with host access
npm run preview      # Preview production build
```

### Building & Type Checking
```bash
npm run build        # Full build with type checking (recommended)
npm run build-only   # Build without type checking
npm run type-check   # TypeScript type checking only
```

### Code Quality
```bash
npm run lint         # ESLint with auto-fix for Vue/TypeScript files
npm run format       # Prettier formatting for src directory
```

### Mobile Development
```bash
npm run build:android # Build and sync with Android
npm run icons        # Generate Capacitor app icons and splash screens
```

## Architecture Overview

**PWA Gerentes y Seguridad** is a Vue 3 + TypeScript Progressive Web Application for financial management at Xpress agencies. Built with Capacitor for mobile deployment and uses a feature-based architecture.

### Technology Stack
- **Vue 3.4.21** with Composition API and TypeScript
- **Vite 4.5.2** for development and building
- **Capacitor 6.0.0** for Android mobile app
- **Pinia 2.1.7** for state management
- **Tailwind CSS 3.4.1** + Flowbite Vue for UI
- **Vue Leaflet** and **Mapbox GL** for mapping features

### Feature-Based Architecture

The codebase follows a feature-based modular structure with 20 distinct modules:

```
src/
├── features/           # 20 feature modules (assignment, auth, balance, etc.)
├── shared/            # Shared utilities, components, services, stores
├── router/            # Vue Router configuration
└── views/             # Legacy views (being refactored to features)
```

Each feature module contains:
- `components/` - Feature-specific Vue components
- `composables/` - Vue composables for business logic
- `services/` - API service classes (singleton pattern)
- `types/` - TypeScript interfaces and types
- `views/` - Vue pages/routes

### API Integration

The application integrates with **4 different backend services**:

1. **Spring Boot API** (Primary) - `sfast-api.terio.xyz`
2. **FastAPI** - `fast-api-xpress.vercel.app`
3. **Hono API** - `xpress-correcciones-back-hono.clvrt.workers.dev`
4. **Javalin API** - `javalin.xpress1.cc`

API services are organized as singleton classes in `src/shared/services/` and feature-specific `services/` directories.

### State Management Pattern

- **Pinia stores** in `src/shared/stores/` for global state
- **Composables** in feature modules for local reactive state
- **Route guards** for authentication and authorization

### Development Practices

- **TypeScript strict mode** enabled across the project
- **ESLint + Prettier** for code quality and formatting
- **Feature-based organization** with shared utilities
- **Lazy loading** for routes and components
- **PWA capabilities** with service worker and offline support

### Key Business Domains

The application manages financial operations across these areas:
- Agency/Gerency management with assignments
- Balance and payment processing
- Loan operations and settlements
- Expense tracking and corrections
- Weekly closures and reporting
- Security PIN management
- Call center operations

### Mobile Considerations

- Built as PWA with Capacitor for Android deployment
- Responsive design with mobile-first approach
- Geolocation services for field operations
- Offline capabilities for remote work scenarios

## Important Files

- `capacitor.config.ts` - Mobile app configuration
- `endpoints.md` - Comprehensive API documentation
- `tailwind.config.js` - Custom design system configuration
- `vite.config.ts` - Build configuration with aliases and PWA setup