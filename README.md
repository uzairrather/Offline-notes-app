# Offline-First Notes (Web + Mobile)

## Demo Video
Loom: <link>

## Monorepo Structure
- /web (Vite + React + TS)
- /mobile (Expo React Native + TS)
- /server (optional, if you added one)

## Run Locally

### Web
cd web
npm install
npm run dev
# open http://localhost:5173

Build:
npm run build
npm run preview

### Mobile (Expo)
cd mobile
npm install
npx expo start
# press "i" for iOS simulator or "a" for Android (or scan QR)

## Key Features
- Offline-first editing; notes persist locally.
- Sync button **disabled when offline** (web header + mobile edit screen).
- Web editor: live updates via store; (optional) clears inputs after a successful sync.
- Mobile header shows online/offline badge (can be swapped to header sync).

## How to Test Offline
1) Web: open app → turn Wi-Fi OFF → Sync becomes disabled (grey).
2) Type/edit notes → turn Wi-Fi ON → press Sync → changes reconcile.
3) Mobile: open Edit screen → confirm Sync button is disabled offline; enabled online.

## Build Notes
- No .env required.
- Web uses IndexedDB with fallback to localStorage.
- Mobile uses `@react-native-community/netinfo` for connectivity.

## Commands
- Web: `npm run dev`, `npm run build`, `npm run preview`
- Mobile: `npx expo start` (`a` for Android, `i` for iOS)

## Tech
- React, TypeScript, Vite
- React Native (Expo)
- Tailwind (web UI)
- NetInfo (mobile connectivity)
