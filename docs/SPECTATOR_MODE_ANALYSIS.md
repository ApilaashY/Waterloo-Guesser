# Spectator Mode Implementation Analysis

## Executive Summary

This document analyzes the current socket server architecture and `/versus` page structure to determine the implementation path for a spectator mode where any user can view ongoing matches.

---

## 1. Current Architecture Overview

### 1.1 Socket Server Structure

**Location:** Two server implementations exist:
- `server/` - Modular server (main development)
- `websocket-server/` - Standalone deployment server (production)

**Server Modules:**
```
server/
├── index.ts                    # Main entry point, Socket.IO setup
├── handlers/
│   ├── QueueManagement/
│   │   └── addToQueue.ts      # Matchmaking logic
│   └── GameManagement/
│       ├── joinedGame.ts      # Game initialization
│       └── submitGuess.ts     # Guess processing & scoring
└── types/
    └── GameType.ts            # Game state class
```

**Key Data Structures:**
```typescript
// In-memory game state storage
const queue: any[] = [];                          // Players waiting to match
const gameRooms: { [key: string]: GameType } = {}; // Active game sessions
```

### 1.2 Socket Event Flow

#### Connection & Matchmaking
```
Client                      Server
  |                           |
  |------- joinQueue -------->|  (Add to queue array)
  |                           |
  |<---- queueMatched --------|  (Emit to both players)
  |  { sessionId, partnerId } |
  |                           |
  |---- identifySession ----->|  (Identify connection)
  |                           |
  |------ joinedGame -------->|  (Mark player as ACTIVE)
  |  { sessionId, socketId }  |
  |                           |
  |<----- roundStart ---------|  (When both players ACTIVE)
  |  FilteredClientGameType   |
```

#### Gameplay Loop
```
Client                      Server
  |                           |
  |------ submitGuess ------->|  (Player submits coordinates)
  |  { x, y, sessionId }      |
  |                           |
  |<---- playerPoints --------|  (Immediate feedback)
  |<--- partnerPoints --------|
  |                           |
  |                           |  (When both submitted)
  |<----- roundOver ----------|
  |  UnfilteredClientGameType |
  |  (includes answer & both guesses)
  |                           |
  |                           |  (After timeout)
  |<----- roundStart ---------|  (Next round)
  |                           |
  |<----- gameOver -----------|  (After 5 rounds)
  |  { winner, tie }          |
```

### 1.3 Game State Management

**GameType Class:** (`server/types/GameType.ts`)

**Properties:**
- `sessionId`: Unique game identifier (e.g., "socketId1-socketId2")
- `player1Id`, `player2Id`: Socket IDs
- `currentRoundIndex`: 0-4 (5 rounds total)
- `player1Points`, `player2Points`: Cumulative scores
- `imageUrl`: Current photo URL
- `answer`: { x, y } coordinates
- `player1Guess`, `player2Guess`: { x, y } | null
- `player1Status`, `player2Status`: WAITING | ACTIVE | INACTIVE
- `started`: boolean
- `previousImages`: string[] (prevents duplicates)

**Key Methods:**
- `filterForPlayer({ player1: boolean })` → `FilteredClientGameType`
  - Sends player-specific view (hides answer & opponent guess)
- `nonFilterForPlayer({ player1: boolean })` → `UnfilteredClientGameType`
  - Sends round results (shows answer & both guesses)
- `nextRound()` → Fetches new image, resets guesses

**Data Filtering:**
```typescript
// Sent during active gameplay (hides sensitive info)
interface FilteredClientGameType {
  sessionId: string;
  id: string;              // This player's socket ID
  partnerId: string;       // Opponent's socket ID
  currentRoundIndex: number;
  points: number;          // This player's score
  partnerPoints: number;   // Opponent's score
  imageUrl: string;
  guess: { x: number; y: number } | null;  // This player's guess
  status: PlayerStatus;
  partnerStatus: PlayerStatus;
  // ❌ NO answer coordinates
  // ❌ NO opponent's guess
}

// Sent at round end (reveals everything)
interface UnfilteredClientGameType extends FilteredClientGameType {
  answer: { x: number; y: number };           // ✅ Correct answer
  partnerGuess: { x: number; y: number } | null; // ✅ Opponent's guess
}
```

### 1.4 Frontend Structure (`/versus` page)

**Architecture:** Hook-based modular design

**Component:** `app/versus/page.tsx`

**Core Hooks:**
- `useVersusSocket()` - Socket.IO event handling
- `useMapZoom()` - Map interaction state
- `useSocket()` - Connection context (from SocketProvider)

**State Management:**
```typescript
// Connection state
sessionId, partnerId, socket

// Game state
state: { image, correctX, correctY }
round, totalPoints, partnerPoints, currentRoundScore

// UI state
hasSubmitted, opponentHasSubmitted, isRoundComplete
showResult, showPopup, toast

// Coordinate state
xCoor, yCoor          // Player's guess
xRightCoor, yRightCoor // Correct answer (shown after round)
```

**Socket Events (Client-Side):**
```typescript
// Outgoing
socket.emit("identify", sessionId)
socket.emit("submitGuess", { x, y, sessionId })

// Incoming
socket.on("roundStart", (data: FilteredClientGameType))
socket.on("roundOver", (data: UnfilteredClientGameType))
socket.on("playerPoints", ({ points }))
socket.on("partnerPoints", ({ points }))
socket.on("gameOver", ({ winner, tie }))
```

**UI Layout:**
```
┌────────────────────────────────────────┐
│  [Toast Notifications]                 │
│                                        │
│  ┌──────────┬──────────────────────┐  │
│  │ Controls │      Game Map        │  │
│  │  (1/3)   │       (2/3)          │  │
│  │          │                      │  │
│  │ - Score  │  - Zoomable map      │  │
│  │ - Round  │  - Click to guess    │  │
│  │ - Submit │  - Shows markers     │  │
│  │          │                      │  │
│  └──────────┴──────────────────────┘  │
│                                        │
│  [Floating Image Preview]              │
│  [Results Popup]                       │
└────────────────────────────────────────┘
```

---

## 2. Spectator Mode Requirements

### 2.1 Core Features

**Essential:**
1. **Browse Active Matches** - See list of ongoing games
2. **Join as Spectator** - Watch any active match in real-time
3. **View Both Players** - See both guesses, scores, progress
4. **Real-time Updates** - Receive all game events without delay
5. **Read-only Mode** - Cannot interact with game state

**Nice-to-Have:**
6. **Multiple Spectators** - Support many viewers per match
7. **Spectator Count** - Show number of viewers to players
8. **Chat/Comments** - Spectator interaction (future)
9. **Replay Mode** - Watch completed matches (future)

### 2.2 Technical Considerations

**Security:**
- Spectators should receive `UnfilteredClientGameType` always
- No ability to submit guesses or affect game state
- Rate limiting on match browsing

**Performance:**
- Broadcasting to N spectators per match
- Efficient storage of spectator socket IDs
- Cleanup on disconnect

**UX:**
- Clear indication of spectator status
- Smooth transitions between matches
- Handling mid-game joins

---

## 3. Implementation Analysis

### 3.1 Server-Side Changes

#### Option A: Enhanced GameType Class (Recommended)

**Modifications to `GameType`:**

```typescript
export class GameType {
  // ... existing properties ...
  spectatorIds: string[] = [];  // NEW: Array of spectator socket IDs

  // NEW: Method to add spectator
  addSpectator(socketId: string) {
    if (!this.spectatorIds.includes(socketId)) {
      this.spectatorIds.push(socketId);
      return true;
    }
    return false;
  }

  // NEW: Method to remove spectator
  removeSpectator(socketId: string) {
    const index = this.spectatorIds.indexOf(socketId);
    if (index > -1) {
      this.spectatorIds.splice(index, 1);
      return true;
    }
    return false;
  }

  // NEW: Get spectator view (always unfiltered)
  getSpectatorView(): UnfilteredClientGameType & { spectatorCount: number } {
    // Spectators see everything, from player1's perspective by default
    return {
      ...this.nonFilterForPlayer({ player1: true }),
      spectatorCount: this.spectatorIds.length,
      // Add flag to indicate spectator view
      isSpectatorView: true,
    };
  }
}
```

**Benefits:**
- Encapsulates spectator logic within game state
- Easy to track spectators per match
- Can filter by spectator count when listing matches

#### Option B: Separate Spectator Registry

**Alternative structure:**
```typescript
// In server index
const spectatorRegistry: { 
  [matchId: string]: Set<string> // socketIds
} = {};
```

**Benefits:**
- Separation of concerns
- Easier to add spectator-specific features later

**Drawbacks:**
- Need to sync with gameRooms cleanup

---

### 3.2 New Socket Events

#### Server Events (Incoming from Client)

```typescript
// List all active matches
socket.on("listMatches", (callback: (matches: MatchSummary[]) => void) => {
  const activeMatches = Object.keys(gameRooms)
    .filter(sessionId => gameRooms[sessionId].started)
    .map(sessionId => {
      const game = gameRooms[sessionId];
      return {
        sessionId,
        currentRound: game.currentRoundIndex + 1,
        player1Score: game.player1Points,
        player2Score: game.player2Points,
        spectatorCount: game.spectatorIds.length,
        // Optional: anonymize or show player names if stored
      };
    });
  callback(activeMatches);
});

// Join match as spectator
socket.on("spectateMatch", (sessionId: string, callback: (result) => void) => {
  const game = gameRooms[sessionId];
  
  if (!game) {
    callback({ success: false, error: "Match not found" });
    return;
  }

  if (!game.started) {
    callback({ success: false, error: "Match not started yet" });
    return;
  }

  game.addSpectator(socket.id);
  
  // Join a Socket.IO room for easy broadcasting
  socket.join(`spectator:${sessionId}`);
  
  // Send current game state
  const spectatorView = game.getSpectatorView();
  callback({ success: true, gameState: spectatorView });
  
  console.log(`Spectator ${socket.id} joined match ${sessionId}`);
});

// Leave spectating
socket.on("stopSpectating", (sessionId: string) => {
  const game = gameRooms[sessionId];
  if (game) {
    game.removeSpectator(socket.id);
    socket.leave(`spectator:${sessionId}`);
    console.log(`Spectator ${socket.id} left match ${sessionId}`);
  }
});
```

#### Server Events (Outgoing to Spectators)

All existing game events should also broadcast to spectators:

```typescript
// Modified submitGuess handler
export async function handleSubmitGuess(socket, x, y, sessionId, socketId, gameRooms) {
  const game = gameRooms[sessionId];
  // ... existing logic ...

  // After updating game state, notify spectators
  const spectatorView = game.getSpectatorView();
  io.to(`spectator:${sessionId}`).emit("spectatorUpdate", spectatorView);

  // When round is over
  if (game.player1Guess != null && game.player2Guess != null) {
    // ... existing logic ...
    
    // Emit roundOver to spectators as well
    io.to(`spectator:${sessionId}`).emit("roundOver", game.getSpectatorView());
    
    // After timeout for next round
    setTimeout(async () => {
      await game.nextRound();
      // ... existing logic ...
      
      // Notify spectators of new round
      io.to(`spectator:${sessionId}`).emit("roundStart", game.getSpectatorView());
    }, 5000);
  }
}
```

**Key Pattern:** Use Socket.IO rooms for efficient broadcasting
- Players: Direct emission via `socket.id`
- Spectators: Broadcast via `io.to(`spectator:${sessionId}`).emit(...)`

---

### 3.3 Frontend Changes

#### New Route: `/spectate` (Match Lobby)

**Purpose:** Browse and select matches to spectate

**Component:** `app/spectate/page.tsx`

```typescript
"use client";

import { useSocket } from "@/components/SocketProvider";
import { useEffect, useState } from "react";

interface MatchSummary {
  sessionId: string;
  currentRound: number;
  player1Score: number;
  player2Score: number;
  spectatorCount: number;
}

export default function SpectateLobby() {
  const { socket } = useSocket();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    // Request match list on mount
    socket.emit("listMatches", (activeMatches: MatchSummary[]) => {
      setMatches(activeMatches);
      setLoading(false);
    });

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      socket.emit("listMatches", (activeMatches: MatchSummary[]) => {
        setMatches(activeMatches);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [socket]);

  const handleSpectate = (sessionId: string) => {
    // Navigate to spectate view
    window.location.href = `/spectate/${sessionId}`;
  };

  if (loading) return <div>Loading matches...</div>;
  if (matches.length === 0) return <div>No active matches</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Active Matches</h1>
      <div className="grid gap-4">
        {matches.map((match) => (
          <div key={match.sessionId} className="border p-4 rounded">
            <div>Round {match.currentRound}/5</div>
            <div>Score: {match.player1Score} - {match.player2Score}</div>
            <div className="text-sm text-gray-500">
              {match.spectatorCount} watching
            </div>
            <button
              onClick={() => handleSpectate(match.sessionId)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Watch Match
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### New Route: `/spectate/[sessionId]` (Spectator View)

**Purpose:** Watch a specific match in real-time

**Component:** `app/spectate/[sessionId]/page.tsx`

```typescript
"use client";

import { useSocket } from "@/components/SocketProvider";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GameMap from "@/app/versus/components/GameMap";
import { UnfilteredClientGameType } from "@/server/types/GameType";

export default function SpectateMatch() {
  const { socket } = useSocket();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [gameState, setGameState] = useState<UnfilteredClientGameType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Join as spectator
  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("spectateMatch", sessionId, (result: any) => {
      if (result.success) {
        setGameState(result.gameState);
        setIsConnected(true);
      } else {
        setError(result.error);
      }
    });

    // Listen for game updates
    const onSpectatorUpdate = (data: UnfilteredClientGameType) => {
      setGameState(data);
    };

    const onRoundStart = (data: UnfilteredClientGameType) => {
      setGameState(data);
    };

    const onRoundOver = (data: UnfilteredClientGameType) => {
      setGameState(data);
    };

    const onGameOver = (data: { winner: string; tie: boolean }) => {
      // Show game over state
      console.log("Game over:", data);
    };

    socket.on("spectatorUpdate", onSpectatorUpdate);
    socket.on("roundStart", onRoundStart);
    socket.on("roundOver", onRoundOver);
    socket.on("gameOver", onGameOver);

    return () => {
      // Leave spectator mode
      socket.emit("stopSpectating", sessionId);
      socket.off("spectatorUpdate", onSpectatorUpdate);
      socket.off("roundStart", onRoundStart);
      socket.off("roundOver", onRoundOver);
      socket.off("gameOver", onGameOver);
    };
  }, [socket, sessionId]);

  if (error) return <div>Error: {error}</div>;
  if (!isConnected || !gameState) return <div>Connecting...</div>;

  return (
    <div className="fixed inset-0 bg-gray-50">
      {/* Spectator UI Banner */}
      <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center font-bold z-50">
        👁️ SPECTATOR MODE - Round {gameState.currentRoundIndex + 1}/5
      </div>

      {/* Game Display */}
      <div className="flex items-center justify-center h-full pt-12">
        <div className="flex flex-row w-full h-full">
          
          {/* Scores & Info (Left Side) */}
          <div className="w-1/3 bg-white border-r p-6">
            <h2 className="text-xl font-bold mb-4">Match Info</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Player 1</h3>
              <p className="text-3xl font-bold">{gameState.points}</p>
              {gameState.guess && (
                <p className="text-sm text-gray-600">
                  Guessed: ✓
                </p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Player 2</h3>
              <p className="text-3xl font-bold">{gameState.partnerPoints}</p>
              {gameState.partnerGuess && (
                <p className="text-sm text-gray-600">
                  Guessed: ✓
                </p>
              )}
            </div>

            {/* Show answer if round is complete */}
            {gameState.answer && gameState.guess && gameState.partnerGuess && (
              <div className="mt-6 p-4 bg-green-100 rounded">
                <p className="font-bold">Round Complete!</p>
                <p className="text-sm">Answer revealed on map</p>
              </div>
            )}
          </div>

          {/* Map Display (Right Side) */}
          <div className="w-2/3 relative">
            <GameMap
              image={gameState.imageUrl}
              xCoor={gameState.guess?.x || null}
              yCoor={gameState.guess?.y || null}
              setXCoor={() => {}} // Read-only
              setYCoor={() => {}} // Read-only
              xRightCoor={gameState.answer?.x}
              yRightCoor={gameState.answer?.y}
              showResult={!!gameState.answer}
              isRoundComplete={!!gameState.answer}
              onContinue={() => {}}
              mapContainerRef={null}
              disabled={true}
              currentScore={0}
            />
            
            {/* Overlay both guesses */}
            {gameState.partnerGuess && (
              <div 
                className="absolute w-4 h-4 bg-red-500 rounded-full"
                style={{
                  left: `${gameState.partnerGuess.x * 100}%`,
                  top: `${gameState.partnerGuess.y * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key Features:**
- Displays both players' guesses with different markers
- Shows live score updates
- Cannot interact with map (read-only)
- Clear "SPECTATOR MODE" banner
- Automatically leaves on unmount

---

## 4. Implementation Roadmap

### Phase 1: Core Infrastructure (2-3 hours)

**Server:**
1. ✅ Add `spectatorIds` array to `GameType` class
2. ✅ Implement `addSpectator()`, `removeSpectator()`, `getSpectatorView()` methods
3. ✅ Create Socket.IO rooms: `spectator:${sessionId}`
4. ✅ Add `listMatches` event handler
5. ✅ Add `spectateMatch` event handler
6. ✅ Add `stopSpectating` event handler

**Frontend:**
7. ✅ Create `/spectate` lobby page
8. ✅ Create `/spectate/[sessionId]` view page
9. ✅ Add "Spectate" link to navbar

### Phase 2: Broadcasting (1-2 hours)

10. ✅ Modify `handleSubmitGuess` to emit `spectatorUpdate`
11. ✅ Modify round start logic to notify spectators
12. ✅ Modify round end logic to notify spectators
13. ✅ Modify game over logic to notify spectators

### Phase 3: Cleanup & Edge Cases (1 hour)

14. ✅ Handle spectator disconnect (remove from arrays)
15. ✅ Handle game completion (notify spectators, close rooms)
16. ✅ Handle mid-round joins (send current state immediately)
17. ✅ Add spectator count to player UI (optional)

### Phase 4: Polish & Testing (2-3 hours)

18. ✅ Style spectator UI
19. ✅ Add loading states
20. ✅ Test with multiple spectators
21. ✅ Test reconnection scenarios
22. ✅ Performance testing (many spectators)

**Total Estimated Time:** 6-9 hours

---

## 5. Bounds & Extents

### What Spectators CAN Do:
✅ Browse list of active matches
✅ Join any started match at any time
✅ See both players' guesses in real-time
✅ See live score updates
✅ See correct answer after each round
✅ Watch until game completion
✅ Switch between matches
✅ Multiple spectators per match

### What Spectators CANNOT Do:
❌ Submit guesses
❌ Affect game state
❌ See guesses before round ends (same as players)
❌ Communicate with players (no chat yet)
❌ See player identities (unless added later)
❌ Access matches that haven't started
❌ Replay completed matches (future feature)

### Technical Limits:
- **Max Spectators per Match:** No hard limit, but consider:
  - Socket.IO room broadcast performance
  - Server memory per spectator socket
  - Recommended soft limit: 50-100 spectators per match
- **Match Listing Refresh:** Every 5 seconds (avoid spam)
- **State Synchronization:** Real-time via Socket.IO events
- **Data Storage:** In-memory only (no persistence)

---

## 6. Security Considerations

### Potential Issues:
1. **DDoS via Spectate:** Rate limit `listMatches` and `spectateMatch` requests
2. **Match Snooping:** Current sessionIds are predictable (socket IDs)
   - Consider hashing or UUIDs for production
3. **Privacy:** Players may not want to be spectated
   - Add opt-in/opt-out in player settings (future)
4. **Resource Exhaustion:** Too many spectators could overload server
   - Implement max spectator limit per match

### Recommended Safeguards:
```typescript
// Rate limiting (add to server)
const spectatorLimits = new Map<string, number>();

socket.on("spectateMatch", (sessionId, callback) => {
  const now = Date.now();
  const lastRequest = spectatorLimits.get(socket.id) || 0;
  
  if (now - lastRequest < 1000) { // 1 request per second
    callback({ success: false, error: "Rate limited" });
    return;
  }
  
  spectatorLimits.set(socket.id, now);
  // ... rest of logic
});
```

---

## 7. Future Enhancements

### Short-term (Next Sprint):
- Spectator count badge on player UI
- "Hot matches" sorting (most spectators, closest scores)
- Auto-refresh match list without manual polling

### Medium-term:
- Spectator chat room per match
- Player profiles/usernames in spectator view
- Opt-in/opt-out for being spectated
- Match history/replays

### Long-term:
- Tournament mode with bracket spectating
- Streaming integration (Twitch/YouTube)
- Analytics dashboard (most spectated matches, popular locations)

---

## 8. Code Checklist

### Server Files to Modify:
- [ ] `server/types/GameType.ts` - Add spectator methods
- [ ] `server/index.ts` - Add spectator event handlers
- [ ] `server/handlers/GameManagement/submitGuess.ts` - Broadcast to spectators
- [ ] `server/handlers/GameManagement/joinedGame.ts` - Notify spectators on game start
- [ ] `websocket-server/server.js` - Mirror all changes for production

### New Frontend Files:
- [ ] `app/spectate/page.tsx` - Match lobby
- [ ] `app/spectate/[sessionId]/page.tsx` - Spectator view
- [ ] `app/spectate/components/MatchCard.tsx` - Match list item (optional)
- [ ] `app/spectate/hooks/useSpectateSocket.ts` - Spectator socket logic (optional)

### Files to Update:
- [ ] `components/Navbar.tsx` - Add "Spectate" link
- [ ] `server/types/GameType.ts` - Export spectator types

---

## 9. Testing Plan

### Unit Tests:
- GameType spectator methods (add, remove, view)
- Spectator event handlers

### Integration Tests:
- Spectator joins mid-round
- Multiple spectators receive same updates
- Spectator disconnect cleanup
- Game ends with spectators present

### Manual Tests:
1. Start a match between two players
2. Open `/spectate` in third browser
3. Verify match appears in list
4. Join as spectator, verify state loads
5. Watch round complete, verify both guesses visible
6. Close spectator tab, verify cleanup
7. Open 5+ spectator tabs, verify performance

---

## 10. Conclusion

**Feasibility:** ✅ Highly feasible with current architecture

**Complexity:** ⭐⭐⭐☆☆ (3/5 - Moderate)

**Key Insights:**
- The modular server structure and hook-based frontend make this relatively straightforward
- Socket.IO rooms provide efficient broadcast mechanism
- Existing `UnfilteredClientGameType` already contains all needed data
- Main work is plumbing events and creating spectator UI

**Recommended Approach:**
1. Start with server-side spectator management (Phase 1)
2. Build simple lobby and view pages (Phase 2)
3. Wire up broadcasting (Phase 3)
4. Test and polish (Phase 4)

**Risks:**
- Low risk overall
- Main concern is performance with many spectators
- Easy to add rate limiting and caps

**Next Steps:**
1. Review this analysis with team
2. Create feature branch: `feature/spectator-mode`
3. Begin Phase 1 implementation
4. Incremental testing after each phase
