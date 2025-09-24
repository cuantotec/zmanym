# Zmanym Project Agent Documentation

## Project Overview
**Zmanym** is a modern web application for displaying accurate Shabbat candle lighting and Havdalah times for cities worldwide. Built with Next.js 15, React 19, and Tailwind CSS v4.

## Key Features
- **Location Search**: Autocomplete search for cities worldwide with real-time suggestions
- **Shabbat Times**: Accurate candle lighting and Havdalah times from Hebcal API
- **Local Storage**: 24-hour caching of Shabbat times for better performance
- **Responsive Design**: Modern UI with glassmorphism effects and animations
- **Holidays Display**: English-only Jewish holidays with dates
- **Parsha Display**: Weekly Torah portion information
- **Animated Candles**: Custom SVG candle icons with flame animations

## Technical Stack
- **Frontend**: Next.js 15.5.3, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v4 with custom animations
- **API**: Serverless API routes for Hebcal integration
- **Caching**: LocalStorage with 24-hour expiration
- **Icons**: Custom SVG icons with CSS animations

## Project Structure
```
src/
├── app/
│   ├── api/hebcal/          # Serverless API routes
│   │   ├── search/          # Location search endpoint
│   │   ├── coords/          # Coordinate lookup endpoint
│   │   ├── shabbat/         # Shabbat times endpoint
│   │   └── [...slug]/       # Catch-all route
│   ├── globals.css          # Global styles with Tailwind v4
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── components/
│   ├── LocationSearch.tsx   # Search component with autocomplete
│   ├── ZmanimCard.tsx       # Main times display card
│   ├── LoadingSpinner.tsx   # Loading indicator
│   └── ErrorMessage.tsx     # Error display component
└── services/
    ├── hebcal.ts            # Hebcal API service
    ├── location.ts           # Geolocation service
    ├── cache.ts              # LocalStorage caching service
    └── errorHandler.ts       # Error handling utilities
```

## API Endpoints
- `GET /api/hebcal/search?q={query}` - Search for cities worldwide
- `GET /api/hebcal/coords?lat={lat}&lng={lng}` - Get geonameid from coordinates
- `GET /api/hebcal/shabbat?geonameid={id}` - Get Shabbat times and holidays

## Key Components

### LocationSearch
- Real-time autocomplete with debouncing
- Global location support
- Optimized to prevent duplicate API calls
- Smart dropdown visibility management
- Modern glassmorphism styling

### ZmanimCard
- Displays candle lighting and Havdalah times
- Animated candle flame effects
- Holidays section with English-only display
- Responsive grid layout
- Hover animations and transitions

### Caching System
- 24-hour cache duration for Shabbat times
- Location-based cache keys
- Automatic cache validation and expiration
- Fallback handling for invalid cache

## Styling System
- **Tailwind CSS v4**: Using `@import "tailwindcss"` syntax
- **Custom Theme**: Defined in `globals.css` with `@theme` directive
- **Animations**: Custom keyframes for candle flames and UI transitions
- **Responsive**: Mobile-first design with breakpoint utilities
- **Dark Mode**: Full dark mode support with CSS variables

## Development Guidelines

### ⚠️ CRITICAL: Build Restrictions
**NEVER run `npm run build` or any build commands without explicit user consent.**
- Always ask permission before building
- Explain what the build will do
- Wait for user approval before proceeding

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for Next.js
- Consistent error handling with custom AppError type
- Extensive console logging for debugging
- Responsive design principles

### State Management
- React hooks for local state
- LocalStorage for persistence
- No external state management libraries
- Optimistic UI updates

## Recent Changes
- Removed default location fallback (New York)
- Added proper empty state when no location saved
- Implemented local storage caching for Shabbat times
- Updated to Tailwind CSS v4 configuration
- Enhanced LocationSearch with modern styling
- Added comprehensive error handling

## Dependencies
```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0", 
    "next": "15.5.3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.5.3"
  }
}
```

## Environment Setup
1. Node.js 18+ required
2. Install dependencies: `npm install`
3. Development server: `npm run dev`
4. **Build only with user consent**: `npm run build`

## Performance Optimizations
- Serverless API routes to avoid CORS
- LocalStorage caching reduces API calls by 33%
- Debounced search input
- Optimized autocomplete with smart state management
- Lazy loading and code splitting

## Browser Support
- Modern browsers with ES2020+ support
- LocalStorage API required
- Geolocation API (optional)
- CSS Grid and Flexbox support

## Security Considerations
- No sensitive data stored in localStorage
- API routes validate input parameters
- CORS handled by serverless functions
- No external dependencies beyond Hebcal API

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
