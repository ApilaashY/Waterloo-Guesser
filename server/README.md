# Server Architecture

The server has been refactored from a single monolithic `server.mts` file into a modular structure for better maintainability and organization.

## Directory Structure

```
server/
├── types/           # TypeScript interface definitions
│   ├── player.ts    # Player-related interfaces (QueueItem, PlayerSession, GameState)
│   ├── match.ts     # Match-related interfaces
│   └── round.ts     # Round-related interfaces (RoundData, RoundLock)
├── utils/           # Utility functions
│   ├── debug.ts     # Debug logging functionality
│   └── helpers.ts   # Helper functions (session ID generation, calculations)
├── services/        # Business logic services
│   ├── gameService.ts       # Game round management and restart functionality
│   ├── matchService.ts      # Match creation and session restoration
│   └── validationService.ts # Coordinate validation and scoring
├── handlers/        # Socket.IO event handlers
│   ├── connectionHandler.ts # Connection, identification, and reconnection events
│   ├── queueHandler.ts      # Queue and session restoration events
│   ├── gameHandler.ts       # Game-related events (rounds, coordinates, points)
│   └── validationHandler.ts # Coordinate validation events
├── storage/         # Data management
│   └── gameState.ts # Centralized game state management
└── index.ts         # Main server entry point
```

## Key Improvements

### 1. **Separation of Concerns**
- **Types**: All TypeScript interfaces are centralized in the `types/` directory
- **Services**: Business logic is separated into focused service classes
- **Handlers**: Socket event handling is modularized by functionality
- **Storage**: Centralized state management with a clean API

### 2. **Better Code Organization**
- Related functionality is grouped together
- Reduced file size for easier navigation
- Clear dependencies between modules

### 3. **Improved Maintainability**
- Each module has a single responsibility
- Easier to test individual components
- Better code reusability

### 4. **Enhanced Developer Experience**
- Clear import/export structure
- Better TypeScript support with explicit types
- Easier debugging with focused modules

## Usage

The main `server.mts` file now simply imports the modular server:

```typescript
// This file now imports the modular server structure
// All server logic has been moved to the server/ directory for better organization

import './server/index.js';
```

The server functionality remains exactly the same from a client perspective - all existing Socket.IO events and APIs work unchanged.

## Services Overview

### GameService
- Manages round creation and progression
- Handles session restart functionality
- Coordinates with MongoDB for image fetching

### MatchService
- Handles player matchmaking
- Manages session restoration for reconnects
- Creates and maintains match states

### ValidationService
- Validates coordinate submissions
- Calculates scores and distances
- Manages round completion and progression

### GameStorage
- Centralized storage for all game state
- Provides clean APIs for data access
- Maintains consistency across different components

## Running the Server

The server can still be run using the same npm script:

```bash
npm run dev:socket
```

All existing functionality is preserved while providing a much cleaner and more maintainable codebase.
