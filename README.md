# Frontend Development Setup

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

App will run on http://localhost:5173

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

## PWA Features

- Offline support via Service Workers
- App installable on mobile and desktop
- Asset caching for better performance
- Background sync (when implemented)

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query (TanStack Query)
- React Router v6
- Dexie (IndexedDB wrapper)
- Lucide Icons
