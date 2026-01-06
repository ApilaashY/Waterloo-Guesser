# Workspace Rules & Guidelines

These rules describe the architectural standards, coding patterns, and directory structure of the **Waterloo-Guesser** repository. All contributors should follow these guidelines to ensure consistency and maintainability.

## 1. Project Overview & Architecture

*   **Framework**: Next.js 15 with App Router.
*   **Language**: TypeScript (Strict mode recommended).
*   **Runtime**: Custom Node.js server (Integrated Next.js + Socket.io).
*   **Styling**: Tailwind CSS (primary) and CSS Modules (legacy/specific components).
*   **Asset Management**: Images hosted on Cloudinary; static assets in `/public`.

## 2. Directory Structure

The project follows a hybrid structure transitioning towards feature-based modularity.

```
/
├── app/                  # Next.js App Router (Pages & API Routes)
├── components/           # UI Components
│   ├── game/             # [RECOMMENDED] Modular feature directory
│   │   ├── components/   # Sub-components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── services/     # Business logic/API calls
│   │   └── types/        # Feature-specific types
│   └── [Legacy]          # Monolithic components (e.g., GameMap.tsx) in root
├── server/               # Backend Server Logic
│   ├── handlers/         # Socket.io Event Handlers (Business Logic)
│   └── index.ts          # Server Entry Point
├── types/                # Global Type Definitions
└── public/               # Static Assets
```

### ✅ Best Practice: Feature-Based Folders
When adding complex features, do **not** place monolithic files in `components/`. Instead, create a dedicated directory (e.g., `components/tournament/`) with its own `hooks`, `types`, and `utils`.

## 3. Coding Standards

### Naming Conventions
*   **Components**: PascalCase (e.g., `GameMap.tsx`, `TutorialOverlay.tsx`).
*   **Functions/Variables**: camelCase (e.g., `calculatePoints`, `isRoundComplete`).
*   **Files**:
    *   React Components: PascalCase.
    *   Logic/Utilities: camelCase (e.g., `submitGuess.ts`).
    *   Next.js Routes: `page.tsx`, `layout.tsx`, `route.ts`.

### Component Architecture
*   **Functional Components**: Use `export default function ComponentName` or `const ComponentName = ...`.
*   **Props Interface**: Always define a `Props` interface (e.g., `GameMapProps`) above the component.
*   **Hooks**: Extract complex logic (state machines, event listeners) into custom hooks (e.g., `useMapControls`).
*   **Refs**: Use `useRef` for mutable values that don't trigger re-renders (timers, DOM elements).

### Backend (Server/Handlers)
*   **Logic Separation**: Keep socket event handlers pure and functional where possible.
*   **Type Safety**: Avoid `any`. Define interfaces for Socket payloads and Game State.
    *   *Bad*: `socket: any`
    *   *Good*: `socket: Socket<ClientToServerEvents, ServerToClientEvents>`
*   **ModularHandlers**: Group related events into specific directories (e.g., `server/handlers/GameManagement`).

## 4. State Management

*   **Local State**: `useState` for UI interaction.
*   **Global State**: React Context Providers (`SocketProvider`, `SessionProvider`).
*   **Reducers**: Use `useReducer` for complex game state transitions.

## 5. Styling Guidelines

*   **Tailwind CSS**: Use utility classes for layout, spacing, and colors.
*   **Consistency**: Use standard spacing (e.g., `p-4`, `m-2`) rather than arbitrary pixels.
*   **Z-Index**: unique Z-indices are used heavily for overlays (e.g., Map vs Tutorial). Document these if they conflict.

## 6. Recommendations for Improvement

1.  **Refactor Monolithic Components**:
    *   `GameMap.tsx` is over 700 lines. Split it into:
        *   `MapRenderer.tsx` (The actual generic map)
        *   `MapInteractions.tsx` (Event listeners)
        *   `MapOverlays.tsx` (Score, Pins)
2.  **Strict Typing**:
    *   Replace `forwardRef<any, ...>` with specific HTML types (e.g., `HTMLDivElement` or `MapRef`).
    *   Add types to backend `socket` objects to prevent runtime errors.
3.  **Barrel Files**:
    *   Continue using `index.ts` files in feature directories (like `components/game/index.ts`) to simplify imports.
4.  **Testing**:
    *   No tests detected. Introduce Jest/React Testing Library for critical utilities (`calculatePoints`) and components.

---