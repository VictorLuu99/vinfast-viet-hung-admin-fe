# Huang Shan Global - Admin Panel

A beautiful, modern admin panel built with Next.js 15 for managing the Huang Shan Global logistics platform.

## Features

- **🎨 Modern UI**: Clean, professional design with Radix UI components
- **🔐 Secure Authentication**: JWT-based login with token management
- **🌐 Multi-language Support**: Vietnamese, Chinese, and English content management
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **⚡ Fast Performance**: Optimized with Next.js 15 and modern React patterns

## Admin Features

### Content Management
- **News Management**: Create, edit, and publish news articles in multiple languages
- **Knowledge Base**: Manage tutorials and documentation
- **Contact Submissions**: Review and respond to customer inquiries

### Recruitment System
- **Job Postings**: Create and manage job descriptions
- **Candidate Profiles**: Review applications and manage hiring pipeline
- **CV Management**: Upload and organize candidate documents

### Analytics & Insights
- **Dashboard**: Real-time statistics and system overview
- **Activity Tracking**: Monitor admin actions and system health
- **Data Export**: Export data for analysis and reporting

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI Components
- **Authentication**: JWT tokens with secure session management
- **API Integration**: RESTful API client with error handling
- **State Management**: React hooks with custom auth management

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running Hono.js API server (see ../api/)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open admin panel:**
   ```
   http://localhost:3000
   ```

### Default Login
- Username: `admin`
- Password: `admin123`

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## API Integration

The admin panel connects to the Hono.js API server for all data operations:

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Token verification
- `POST /api/auth/logout` - Admin logout

### Content Management Endpoints
- `GET/POST/PUT/DELETE /api/news/admin` - News management
- `GET/PUT/DELETE /api/contacts/admin` - Contact management
- `GET/POST/PUT/DELETE /api/knowledge/admin` - Knowledge base
- `GET/POST/PUT/DELETE /api/recruitment/admin` - Job management
- `GET/PUT/DELETE /api/cv/admin` - CV applications

### File Upload
- `POST /api/upload` - File upload to Cloudflare R2

## Development Guidelines

### Code Organization
```
src/
├── app/                 # Next.js App Router pages
│   ├── login/          # Authentication pages
│   └── dashboard/      # Admin dashboard pages
├── components/         # React components
│   ├── ui/            # Base UI components
│   └── layout/        # Layout components
├── lib/               # Utilities and API client
└── middleware.ts      # Route protection
```

### Component Patterns
- **Functional Components**: All components use modern React patterns
- **TypeScript**: Strict typing for better development experience
- **Tailwind CSS**: Utility-first styling with consistent design system
- **Radix UI**: Accessible, customizable component primitives

### API Client
The `ApiClient` class provides:
- Automatic JWT token handling
- Request/response type safety
- Error handling and retry logic
- Multi-language parameter support

## Deployment

### Environment Configuration
```bash
# Production API URL
NEXT_PUBLIC_API_URL=https://api.huangshan-logistics.com

# Security settings
NEXT_PUBLIC_ENVIRONMENT=production
```

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm run start

# Or deploy to Vercel/Netlify
npm run build && npm run export
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Middleware-based access control
- **CSRF Protection**: Built-in Next.js security features
- **Input Validation**: Client and server-side validation
- **Secure Headers**: Production security configurations

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Contributing

1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Add proper error handling
4. Test on multiple devices/browsers
5. Update documentation for new features

## License

© 2024 Huang Shan Global. All rights reserved.
