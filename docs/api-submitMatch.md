# Match Submission API

This API endpoint handles the submission and retrieval of completed game matches.

## Endpoint: `/api/submitMatch`

### POST - Submit a Match

Submits a completed game match with all round data and player statistics.

#### Request Body

```typescript
interface MatchSubmission {
  gameId?: string;                    // Optional game ID
  playerId?: string;                  // Optional player ID (MongoDB ObjectId)
  mode: 'singlePlayer' | 'multiplayer'; // Game mode
  totalScore: number;                 // Total score for the match
  rounds: Array<{
    round: number;                    // Round number
    locationId?: string;              // Optional location ID
    userCoordinates: {
      x: number;                      // User's guess X coordinate (0-1)
      y: number;                      // User's guess Y coordinate (0-1)
    };
    correctCoordinates: {
      x: number;                      // Correct X coordinate (0-1)
      y: number;                      // Correct Y coordinate (0-1)
    };
    distance: number;                 // Distance between guess and correct answer
    points: number;                   // Points scored for this round
    timestamp?: string;               // Optional timestamp for the round
  }>;
  completedAt: string;                // ISO timestamp when match completed
  sessionDuration?: number;           // Optional session duration in milliseconds
  performanceMetrics?: {
    imageLoadedAt?: number;           // Timestamp when image loaded
    firstMapClickRecorded?: boolean;  // Whether first click was recorded
    firstSubmitRecorded?: boolean;    // Whether first submit was recorded
  };
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "matchId": "676b1234567890abcdef1234",
  "message": "Match submitted successfully",
  "data": {
    "gameId": "test-game-1234567890",
    "totalScore": 2500,
    "roundCount": 3,
    "completedAt": "2024-12-09T10:30:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "error": "Missing required fields: mode, totalScore, rounds, completedAt"
}
```

### GET - Retrieve Matches

Retrieves match data by match ID or player ID.

#### Query Parameters

- `matchId` (string): Retrieve a specific match by ID
- `playerId` (string): Retrieve matches for a specific player (limited to last 100 matches)
- `limit` (number): Limit number of results (default: 10, max: 100 for player queries)

#### Examples

```
GET /api/submitMatch?matchId=676b1234567890abcdef1234
GET /api/submitMatch?playerId=676a9876543210fedcba9876&limit=5
```

**Note:** When retrieving by `playerId`, the API automatically uses the `player_matches` collection to ensure only the most recent 100 matches are returned, maintaining optimal performance.

#### Response

**Success (200):**
```json
{
  "success": true,
  "matches": [
    {
      "_id": "676b1234567890abcdef1234",
      "gameId": "test-game-1234567890",
      "playerId": null,
      "mode": "singlePlayer",
      "totalScore": 2500,
      "roundCount": 3,
      "rounds": [...],
      "completedAt": "2024-12-09T10:30:00.000Z",
      "sessionDuration": 180000,
      "status": "completed"
    }
  ]
}
```

## Database Schema

### Matches Collection

```typescript
interface MatchDocument {
  _id: ObjectId;
  gameId: string;
  playerId: string | null;
  mode: 'singlePlayer' | 'multiplayer';
  totalScore: number;
  roundCount: number;
  rounds: Array<{
    round: number;
    locationId?: string;
    userCoordinates: { x: number; y: number };
    correctCoordinates: { x: number; y: number };
    distance: number;
    points: number;
    timestamp: string;
  }>;
  completedAt: Date;
  sessionDuration?: number;
  performanceMetrics?: object;
  createdAt: Date;
  status: 'completed';
}
```

### Player Matches Collection (New)

```typescript
interface PlayerMatchDocument {
  _id: ObjectId;
  playerId: string;          // Reference to user ObjectId
  matchId: ObjectId;         // Reference to match document
  createdAt: Date;           // When this match was completed
}
```

## Player Statistics Updates

When a match is submitted with a valid `playerId`, the API automatically updates:

- **User Statistics:**
  - `totalPoints`: Accumulated total score
  - `stats.gamesPlayed`: Number of games played
  - `stats.avgScore`: Average score per game
  - `stats.bestScore`: Highest score achieved
  - `lastActiveAt`: Last activity timestamp

- **Leaderboard:**
  - Creates or updates leaderboard entry
  - Updates player's total score for ranking

- **Match History (New):**
  - Maintains the last 100 matches for each player
  - Automatically removes oldest matches when exceeding 100
  - Stored in separate `player_matches` collection for efficient queries
  - Linked to full match data via `matchId` references

## Integration with GamePage

The API is automatically called when a game ends in the `GamePage` component:

```typescript
import { MatchService } from './game';

// In handleNext function when game ends:
const matchService = MatchService.getInstance();
const matchData = matchService.createMatchSubmission(
  gameState,
  user?.id,
  startTime
);
const result = await matchService.submitMatch(matchData);
```

## Testing

Use the provided test script (`test-api.js`) to test the API endpoint in the browser console:

```javascript
// Submit a test match
testSubmitMatch();

// Retrieve a specific match
testGetMatch('676b1234567890abcdef1234');
```

## Error Handling

The API includes comprehensive error handling:

- Validates required fields
- Checks data types and structure
- Handles database connection errors
- Provides detailed error messages in development
- Continues execution if user updates fail (match is still saved)

## Security Considerations

- No authentication required (matches current app pattern)
- Input validation on all fields
- Sanitized error messages in production
- MongoDB injection protection through ObjectId validation
