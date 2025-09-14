# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **admin panel** for **Huang Shan Global** logistics website - a comprehensive content management system built with **Next.js 15** and **TypeScript**. The admin panel provides full control over content, users, and analytics for the logistics platform.

## Essential Commands

**Development (run from `admin/` directory):**
```bash
npm run dev        # Start development server at http://localhost:3001
npm run build      # Create production build
npm run start      # Start production server (requires build first)
npm run lint       # Check code quality with ESLint
```

**Before committing any changes:**
1. Run `npm run lint` to ensure code quality
2. Run `npm run build` to verify production build works
3. Test admin login functionality with API integration

**Development Server Notes:**
- Admin panel runs on port 3001 (configured in package.json)
- If port 3001 shows "EADDRINUSE" error, the admin server is already running  
- No need to start a new server on a different port - just use the existing one
- Check http://localhost:3001 to verify admin panel is working
- Requires backend API running at the configured API URL

## Architecture & Structure

**Technology Stack:**
- Next.js 15 with App Router and React 19
- TypeScript with strict mode enabled
- Tailwind CSS 4 for modern styling
- Radix UI for accessible component primitives
- Redux Toolkit for state management
- Lucide React for consistent iconography

**Key Directories:**
- `src/app/` - Next.js App Router pages (dashboard, login, content management)
- `src/components/` - Reusable UI components and admin-specific layouts
- `src/lib/` - Utility functions, API client, and helper libraries
- `src/store/` - Redux store configuration and slices
- `src/types/` - TypeScript type definitions
- `public/` - Static assets (icons, images, etc.)

**Import Aliases:**
- Use `@/*` for imports from `src/` directory
- Example: `import { Button } from '@/components/ui/button'`

**Admin Panel Features:**
- **Authentication**: JWT-based login with secure token management
- **Content Management**: CRUD operations for news, knowledge base, contacts
- **Multi-language Support**: Manage Vietnamese, Chinese, and English content
- **Recruitment System**: Job postings and candidate management
- **Analytics Dashboard**: Real-time statistics and system insights
- **File Upload**: Media management with drag-and-drop interface

## Development Guidelines

**Component Patterns:**
- Functional components with TypeScript interfaces
- Radix UI primitives for accessibility compliance
- Responsive design with Tailwind CSS utility classes
- Consistent error handling and loading states
- Form validation with proper error messaging

**Authentication Flow:**
- JWT token stored in localStorage with automatic refresh
- Protected routes with authentication middleware
- Automatic redirect to login for unauthorized access
- Session management with Redux state persistence

**API Integration:**
- Centralized API client with interceptors for auth headers
- Consistent error handling across all API calls
- Multi-language content submission and retrieval
- File upload with progress tracking and error handling

**State Management:**
- Redux Toolkit for authentication state
- Local component state for form management
- Persistent storage for user preferences
- Optimistic updates with error rollback

## Code Quality Standards

**TypeScript Standards:**
- Strict mode enabled with comprehensive type checking
- Interface definitions for all API responses and component props
- Proper error typing for API calls and form validation
- Generic type usage for reusable components

**UI/UX Standards:**
- Consistent design system using Radix UI components
- Accessible forms with proper labeling and error states
- Responsive design for desktop, tablet, and mobile
- Loading states for all async operations
- Toast notifications for user feedback

**Security Standards:**
- Input sanitization for all form submissions
- XSS prevention in dynamic content rendering
- CSRF protection through proper API integration
- Secure file upload with type validation

## API Integration

**Authentication Endpoints:**
- `POST /api/auth/login` - Admin login with credentials
- `GET /api/auth/verify` - Verify JWT token validity
- `POST /api/auth/refresh` - Refresh expired tokens

**Content Management Endpoints:**
- `GET /api/news/admin` - Fetch all news articles (published and drafts)
- `POST /api/news/admin` - Create new news article
- `PUT /api/news/admin/:id` - Update existing article
- `DELETE /api/news/admin/:id` - Delete article
- Similar patterns for knowledge, contacts, and recruitment

**File Upload:**
- `POST /api/upload` - Upload files to cloud storage
- Support for images, documents, and media files
- Automatic file optimization and CDN integration

## Environment Configuration

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_APP_URL` - Admin panel base URL
- Environment-specific configuration in `.env.local`

**API Configuration:**
- Production API: `https://vinfast-viethung-api.xox-labs-server.workers.dev`
- Local development: `http://localhost:8787` (when API runs locally)
- Automatic fallback and error handling for API connectivity

## Deployment

**Build Process:**
1. Run `npm run build` to create optimized production bundle
2. Static export generation for CDN deployment
3. Environment variable validation during build
4. Asset optimization and code splitting

**Production Deployment:**
- Static hosting compatible (Vercel, Netlify, Cloudflare Pages)
- Automatic HTTPS and CDN distribution
- Environment variable configuration through hosting platform
- Database-less architecture relying on backend API

## Security Features

- JWT authentication with automatic token refresh
- Protected routes with authentication middleware
- Input validation and sanitization
- XSS and CSRF protection
- Secure file upload with type restrictions
- Role-based access control through API integration

## Project Status

**Current Status**: Production-ready admin panel with full CRUD functionality

**Features Implemented:**
- ✅ Authentication system with JWT tokens
- ✅ Content management for news and knowledge base
- ✅ Contact form submission management
- ✅ Multi-language content support
- ✅ File upload and media management
- ✅ Responsive design and accessibility
- ✅ Analytics dashboard with real-time data
- ✅ Recruitment and job posting management

**Integration Status:**
- ✅ Backend API integration (Hono.js/Cloudflare Workers)
- ✅ Database operations (Cloudflare D1)
- ✅ File storage (Cloudflare R2)
- ✅ Production deployment ready