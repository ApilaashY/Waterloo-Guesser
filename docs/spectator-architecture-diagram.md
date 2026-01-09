# Spectator Mode Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Socket.IO Server                         │
│                      (server/index.ts)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Queue: [socket1, socket2, ...]                                │
│                                                                 │
│  GameRooms: {                                                   │
│    "session123": GameType {                                     │
│      player1Id: "abc",                                          │
│      player2Id: "def",                                          │
│      spectatorIds: ["ghi", "jkl", "mno"],  ← NEW               │
│      currentRoundIndex: 2,                                      │
│      player1Points: 1500,                                       │
│      player2Points: 1800,                                       │
│      imageUrl: "...",                                           │
│      answer: { x: 0.5, y: 0.3 },                               │
│      player1Guess: { x: 0.52, y: 0.31 },                       │
│      player2Guess: { x: 0.48, y: 0.29 }                        │
│    }                                                            │
│  }                                                              │
│                                                                 │
│  Socket.IO Rooms:                                               │
│    "spectator:session123" → [socket-ghi, socket-jkl, ...]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           │                    │                    │
           ▼                    ▼                    ▼
    
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Player 1   │    │   Player 2   │    │  Spectators  │
│  (abc)       │    │  (def)       │    │ (ghi, jkl)   │
├──────────────┤    ├──────────────┤    ├──────────────┤
│              │    │              │    │              │
│ /versus?     │    │ /versus?     │    │ /spectate/   │
│ sessionId=   │    │ sessionId=   │    │ session123   │
│ 123          │    │ 123          │    │              │
│              │    │              │    │              │
│ Receives:    │    │ Receives:    │    │ Receives:    │
│ - Filtered   │    │ - Filtered   │    │ - Unfiltered │
│   (own view) │    │   (own view) │    │   (full view)│
│              │    │              │    │              │
│ Can:         │    │ Can:         │    │ Can:         │
│ ✓ Submit     │    │ ✓ Submit     │    │ ✗ Submit     │
│ ✓ See own    │    │ ✓ See own    │    │ ✓ See both   │
│   guess      │    │   guess      │    │   guesses    │
│ ✗ See opp.   │    │ ✗ See opp.   │    │ ✓ See answer │
│   guess      │    │   guess      │    │   (when done)│
│              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Event Flow Diagram

### 1. Match Discovery
```
Spectator                        Server
    │                              │
    │────── listMatches ──────────>│
    │                              │
    │                              │ Query gameRooms{}
    │                              │ Filter started games
    │                              │ Build MatchSummary[]
    │                              │
    │<─── MatchSummary[] ──────────│
    │ [{sessionId, scores,         │
    │   spectatorCount}]           │
    │                              │
```

### 2. Joining as Spectator
```
Spectator                        Server
    │                              │
    │─── spectateMatch(id) ────────>│
    │                              │
    │                              │ Validate game exists
    │                              │ game.addSpectator(socketId)
    │                              │ socket.join("spectator:id")
    │                              │ Get current state
    │                              │
    │<── {success, gameState} ──────│
    │   UnfilteredClientGameType   │
    │                              │
```

### 3. Receiving Real-time Updates
```
Player 1          Server          Player 2          Spectators
    │               │                │                  │
    │─submitGuess──>│                │                  │
    │               │                │                  │
    │               │─playerPoints──>│                  │
    │               │                │                  │
    │               │<─submitGuess───│                  │
    │               │                │                  │
    │               │──partnerPoints>│                  │
    │               │                │                  │
    │               │ Both submitted!│                  │
    │               │ Calculate scores                  │
    │               │                │                  │
    │<─roundOver────│────roundOver──>│                  │
    │  (filtered)   │   (filtered)   │                  │
    │               │                │                  │
    │               │─────── roundOver ────────────────>│
    │               │     (unfiltered - broadcast)      │
    │               │     to spectator:sessionId room   │
    │               │                │                  │
    │               │                                   │
    │               │ After 5 seconds...                │
    │               │                │                  │
    │<─roundStart───│────roundStart─>│                  │
    │               │────── roundStart ────────────────>│
    │               │                │                  │
```

## Data Flow: Filtered vs Unfiltered

```
GameType (Server)
{
  player1Id: "abc",
  player2Id: "def",
  player1Points: 1500,
  player2Points: 1800,
  player1Guess: { x: 0.5, y: 0.3 },
  player2Guess: { x: 0.48, y: 0.29 },
  answer: { x: 0.49, y: 0.31 }
}
             │
             │ filterForPlayer({ player1: true })
             ├──────────────────────────────────────────┐
             │                                          │
             ▼                                          ▼
  
FilteredClientGameType              FilteredClientGameType
(Player 1 receives)                 (Player 2 receives)
{                                   {
  id: "abc",                          id: "def",
  partnerId: "def",                   partnerId: "abc",
  points: 1500,                       points: 1800,
  partnerPoints: 1800,                partnerPoints: 1500,
  guess: { x: 0.5, y: 0.3 },         guess: { x: 0.48, y: 0.29 },
  ❌ NO answer                        ❌ NO answer
  ❌ NO partnerGuess                  ❌ NO partnerGuess
}                                   }

             │
             │ nonFilterForPlayer({ player1: true })
             ▼

UnfilteredClientGameType
(Spectators receive)
{
  id: "abc",
  partnerId: "def",
  points: 1500,
  partnerPoints: 1800,
  guess: { x: 0.5, y: 0.3 },
  ✅ answer: { x: 0.49, y: 0.31 },
  ✅ partnerGuess: { x: 0.48, y: 0.29 },
  spectatorCount: 3,
  isSpectatorView: true
}
```

## UI Component Hierarchy

### `/spectate` - Lobby Page
```
SpectateLobbPage
├── Header ("Active Matches")
├── MatchList
│   ├── MatchCard (match1)
│   │   ├── RoundIndicator
│   │   ├── ScoreDisplay
│   │   ├── SpectatorCount
│   │   └── WatchButton
│   ├── MatchCard (match2)
│   └── ...
└── RefreshIndicator
```

### `/spectate/[sessionId]` - Spectator View
```
SpectateMatchPage
├── SpectatorBanner ("👁️ SPECTATOR MODE")
├── MainContainer
│   ├── LeftSidebar (1/3 width)
│   │   ├── MatchInfo
│   │   │   ├── RoundCounter
│   │   │   ├── Player1Score
│   │   │   │   ├── PointsDisplay
│   │   │   │   └── GuessStatus (✓ or waiting)
│   │   │   └── Player2Score
│   │   │       ├── PointsDisplay
│   │   │       └── GuessStatus
│   │   └── RoundCompleteIndicator
│   │
│   └── MapDisplay (2/3 width)
│       ├── GameMap (read-only)
│       │   ├── CampusImage
│       │   │   └── MapOverlay
│       │   │       ├── Player1Marker (blue)
│       │   │       ├── Player2Marker (red)
│       │   │       └── AnswerMarker (green, when revealed)
│       │   └── ZoomControls (disabled)
│       └── ImagePreview (floating)
└── BackToLobbyButton
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│              SpectateMatch Component                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  State:                                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ gameState: UnfilteredClientGameType | null    │    │
│  │ error: string | null                          │    │
│  │ isConnected: boolean                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Effects:                                               │
│  ┌────────────────────────────────────────────────┐    │
│  │ useEffect(() => {                              │    │
│  │   socket.emit("spectateMatch", sessionId)      │    │
│  │   socket.on("spectatorUpdate", updateState)    │    │
│  │   socket.on("roundStart", updateState)         │    │
│  │   socket.on("roundOver", updateState)          │    │
│  │   socket.on("gameOver", handleEnd)             │    │
│  │                                                │    │
│  │   return () => {                               │    │
│  │     socket.emit("stopSpectating", sessionId)   │    │
│  │     // cleanup listeners                       │    │
│  │   }                                            │    │
│  │ }, [socket, sessionId])                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Server Handler Flow

```
┌────────────────────────────────────────────────────┐
│           handleSubmitGuess()                       │
│         (modified for spectators)                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. Validate game & player                        │
│  2. Calculate points                              │
│  3. Update game.player1Guess or player2Guess      │
│  4. Emit playerPoints/partnerPoints               │
│                                                    │
│  5. ⭐ NEW: Emit spectatorUpdate                   │
│     io.to(`spectator:${sessionId}`)               │
│       .emit("spectatorUpdate",                    │
│              game.getSpectatorView())             │
│                                                    │
│  6. Check if both submitted                       │
│     │                                             │
│     ├─ YES: Calculate final scores                │
│     │   ├─ Emit roundOver to players             │
│     │   └─ ⭐ Emit roundOver to spectators        │
│     │                                             │
│     │   setTimeout(() => {                        │
│     │     game.nextRound()                        │
│     │     Emit roundStart to players              │
│     │     ⭐ Emit roundStart to spectators        │
│     │   }, 5000)                                  │
│     │                                             │
│     └─ NO: Wait for other player                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Socket.IO Room Structure

```
Server Socket.IO Instance
│
├── Connected Sockets
│   ├── abc (Player 1)
│   ├── def (Player 2)
│   ├── ghi (Spectator 1)
│   ├── jkl (Spectator 2)
│   └── mno (Spectator 3)
│
└── Rooms
    ├── "spectator:session123"
    │   ├── ghi
    │   ├── jkl
    │   └── mno
    │
    ├── "spectator:session456"
    │   └── xyz
    │
    └── ...

Broadcast Example:
io.to("spectator:session123").emit("roundOver", data)
  → Sends to: ghi, jkl, mno
  → Does NOT send to: abc, def (players use direct socket.emit)
```

## Cleanup Flow

```
Spectator Disconnects
        │
        ▼
socket.on("disconnect")
        │
        ├─ Find all gameRooms where socket.id is in spectatorIds
        │   │
        │   └─ For each game:
        │       ├─ game.removeSpectator(socket.id)
        │       └─ socket.leave(`spectator:${sessionId}`)
        │
        └─ Socket.IO automatically removes from rooms

Game Ends (gameOver)
        │
        ▼
handleSubmitGuess() detects final round
        │
        ├─ Emit gameOver to players
        ├─ Emit gameOver to spectators
        │   io.to(`spectator:${sessionId}`).emit("gameOver", ...)
        │
        └─ Optional: Close spectator room
            io.in(`spectator:${sessionId}`).socketsLeave(`spectator:${sessionId}`)
            delete gameRooms[sessionId]
```

## Performance Considerations

```
Single Match with N Spectators:

Memory Usage:
- GameType object: ~2 KB
- Each spectator socket: ~100 bytes (just ID)
- Total: 2 KB + (N × 100 bytes)

For 100 spectators: ~12 KB per match

Broadcast Latency:
- Socket.IO room emit: O(N) where N = spectators
- Typical: <10ms for 100 spectators on modern server

Recommended Limits:
┌──────────────┬─────────┬──────────┬─────────┐
│ Spectators   │ Memory  │ Latency  │ Status  │
├──────────────┼─────────┼──────────┼─────────┤
│ 0-50         │ <10 KB  │ <5ms     │ ✅ Good │
│ 50-100       │ <15 KB  │ <10ms    │ ⚠️ OK   │
│ 100-500      │ <60 KB  │ <50ms    │ ⚠️ Risk │
│ 500+         │ >60 KB  │ >50ms    │ ❌ Bad  │
└──────────────┴─────────┴──────────┴─────────┘

Mitigation Strategies:
1. Soft cap at 100 spectators per match
2. Throttle spectatorUpdate to max 1/sec
3. Use binary protocol for Socket.IO
4. Scale horizontally with Redis adapter
```

---

## Quick Reference: Socket Events

### Client → Server
| Event | Sender | Data | Purpose |
|-------|--------|------|---------|
| `listMatches` | Anyone | callback | Get active matches |
| `spectateMatch` | Spectator | `sessionId`, callback | Join as spectator |
| `stopSpectating` | Spectator | `sessionId` | Leave spectator mode |
| `joinQueue` | Player | - | Enter matchmaking |
| `joinedGame` | Player | `sessionId`, `socketId` | Mark ready |
| `submitGuess` | Player | `x`, `y`, `sessionId` | Submit guess |

### Server → Client
| Event | Receiver | Data | Purpose |
|-------|----------|------|---------|
| `queueMatched` | Players | `sessionId`, `partnerId` | Match found |
| `roundStart` | All | `FilteredClientGameType` | New round |
| `roundOver` | All | `UnfilteredClientGameType` | Round complete |
| `playerPoints` | Players | `points` | Score update |
| `partnerPoints` | Players | `points` | Opponent score |
| `spectatorUpdate` | Spectators | `UnfilteredClientGameType` | Real-time update |
| `gameOver` | All | `winner`, `tie` | Match complete |

---

**Legend:**
- ✅ Implemented / Good
- ⚠️ Warning / Needs attention
- ❌ Not implemented / Bad
- ⭐ New for spectator mode
