# Boioot Next.js Application

This is the Next.js version of the Boioot real estate platform, converted from Angular 19.

## Getting Started

### Installation

```bash
cd nextjs-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main layout routes
│   ├── (profile)/         # Profile layout routes
│   ├── (community)/       # Community layout routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── shared/           # Shared components
│   ├── layouts/          # Layout components
│   └── pages/            # Page-specific components
├── lib/                   # Library code
│   ├── config/           # Configuration
│   ├── contexts/         # React contexts
│   ├── core/             # Core utilities
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── public/               # Static assets
│   └── assets/           # Images and files
├── styles/               # Global styles
└── middleware.ts         # Next.js middleware for route protection
```

## Features

- ✅ Next.js 14+ with App Router
- ✅ Server-Side Rendering (SSR) with metadata
- ✅ TypeScript
- ✅ Bootstrap 5 RTL
- ✅ Font Awesome 6
- ✅ Authentication with JWT
- ✅ Route protection with middleware
- ✅ React Context API for state management
- ✅ React Hot Toast for notifications

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_BASE_API_URL=https://boioot.com
```

## Migration Status

### ✅ Completed
- Project setup and configuration
- Core infrastructure (HTTP client, Auth context)
- Environment configuration
- Root layout with Bootstrap RTL
- Middleware for route protection
- Main layout
- Footer component
- Navbar components (TopNav, MainNav, AdTypesNav)
- Search component
- AdCard component
- AdsListings component
- Core services (Advertisement, Unit Types, Currency, Projects, Community, Favorites, Notifications)

### 🔄 In Progress
- Remaining pages and components
- Form components
- SignalR integration

## Notes

- All pages use Server-Side Rendering with Next.js metadata API for SEO
- Components are split into server and client components as needed
- CSS Modules are used for component-specific styles
- The same API endpoints and integrations are preserved
- Design and styling are maintained from the Angular version

## Next Steps

1. Copy assets from Angular project:
   ```bash
   cp -r ../public/assets nextjs-app/public/
   ```

2. Complete remaining components:
   - Auth modals (Login, Register, etc.)
   - Form components
   - Remaining pages

3. Add SignalR hook for real-time notifications

4. Test all functionality
