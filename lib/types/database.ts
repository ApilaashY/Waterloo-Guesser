import { ObjectId } from "mongodb";

/**
 * Database Type Definitions for Waterloo Guesser
 *
 * This file contains all TypeScript interfaces for MongoDB collections
 * to ensure type safety across the application.
 */

// ============================================================================
// USER COLLECTION
// ============================================================================

export interface User {
  _id: ObjectId;
  username: string; // Display name (3-20 chars)
  email: string; // Email address
  password: string; // TODO: Should be hashed (currently plain text)
  department: Department;
  waterlooUsername: string; // UW username
  totalPoints?: number; // Cumulative score (used for leaderboards)
  lastActiveAt?: Date; // Last activity timestamp
  stats?: UserStats;
  createdAt?: Date;
}

export interface UserStats {
  gamesPlayed: number; // Total games count
  gamesPlayedLastUpdated?: Date;
  avgScore: number; // Average score per game
  bestScore: number; // Highest score achieved
  bestScoreLastUpdated?: Date;
}

export type Department =
  | "Arts"
  | "Engineering"
  | "Environment"
  | "Health"
  | "Mathematics"
  | "Science"
  | "Other";

// ============================================================================
// USER REFS COLLECTION
// ============================================================================

export interface UserRef {
  _id: ObjectId;
  user: string; // User ObjectId as string
}

// ============================================================================
// BASE LOCATIONS COLLECTION
// ============================================================================

export interface BaseLocation {
  _id: ObjectId;
  image: string; // Cloudinary URL
  xCoordinate: number; // Correct X position on map
  yCoordinate: number; // Correct Y position on map
  name?: string; // Location name
  building: string; // Building name
  buildingCode?: string; // Building identifier code
  buildingIdentifier?: string; // Auto-generated identifier (e.g., "SLC 5")
  latitude?: string; // GPS latitude
  longitude?: string; // GPS longitude
  status: "approved" | "pending" | "rejected"; // Photo approval status
  createdAt?: Date;

  // Performance records
  mostAccurate_allTime?: ImageRecord | null;
  mostAccurate_monthly?: ImageRecord | null;
  fastestCorrect_allTime?: ImageRecord | null;
  fastestCorrect_monthly?: ImageRecord | null;
  totalGuesses?: number;
  averageDistance?: number;
  lastUpdated?: Date;
}

export interface ImageRecord {
  distance: number; // Distance from correct location in pixels
  username: string; // Player username
  sessionId: string; // Session identifier
  timestamp: Date; // When the record was set
  score?: number; // Points scored
  responseTime?: number; // Time to submit in milliseconds
  month?: string; // Format: "YYYY-MM" for monthly records
}

// ============================================================================
// MATCHES COLLECTION
// ============================================================================

export interface Match {
  _id: ObjectId;
  gameId: string; // Game identifier
  playerId: string | null; // User ObjectId (null for anonymous)
  mode: GameMode;
  totalScore: number; // Sum of all round scores
  roundCount: number; // Number of rounds played
  rounds: MatchRound[];
  completedAt: Date; // Match completion time
  sessionDuration?: number | null; // Total time in milliseconds
  performanceMetrics?: PerformanceMetrics | null;
  createdAt: Date;
  status: "completed" | "in_progress" | "abandoned";
}

export type GameMode = "singlePlayer" | "multiplayer";

export interface MatchRound {
  round: number; // Round number (0-indexed)
  locationId?: string | null; // base_locations _id
  userCoordinates: Coordinates;
  correctCoordinates: Coordinates;
  distance: number; // Distance from correct location
  points: number; // Points earned this round
  timestamp: string; // ISO timestamp
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface PerformanceMetrics {
  imageLoadedAt?: number;
  firstMapClickRecorded?: boolean;
  firstSubmitRecorded?: boolean;
}

// ============================================================================
// PLAYER MATCHES COLLECTION (Last 100 matches per player)
// ============================================================================

export interface PlayerMatch {
  _id: ObjectId;
  playerId: string; // User ObjectId
  matchId: ObjectId; // Reference to matches._id
  createdAt: Date;
}

// ============================================================================
// LEADERBOARD COLLECTION
// ============================================================================

export interface LeaderboardEntry {
  _id: ObjectId;
  playerId?: string; // User ObjectId (optional for anonymous)
  username?: string; // For daily leaderboard entries
  score: number; // Total score
  rank?: number | null; // Calculated rank
  lastUpdated: Date;

  // Daily leaderboard specific fields
  type?: "daily" | "global"; // Entry type
  date?: string; // YYYY-MM-DD format for daily entries
  timestamp?: Date;
  rounds?: number;
  sessionId?: string;
}

// ============================================================================
// LOCATIONS COLLECTION (User-submitted suggestions)
// ============================================================================

export interface LocationSubmission {
  _id: ObjectId;
  image: string; // Cloudinary URL
  xCoordinate: number;
  yCoordinate: number;
  name?: string;
  building: string;
  buildingIdentifier?: string;
  latitude?: string;
  longitude?: string;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
}

// ============================================================================
// POSTERS COLLECTION
// ============================================================================

export interface Poster {
  _id: ObjectId;
  title?: string;
  content?: string;
  author?: string;
  createdAt: Date;
  // Additional fields to be documented
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Leaderboard API responses
export interface UserLeaderboardEntry {
  username: string;
  totalPoints: number;
}

export interface FacultyLeaderboardEntry {
  department: string;
  totalPoints: number;
}

export interface DailyLeaderboardResponse {
  success: boolean;
  date: string;
  leaderboard: Array<{
    username: string;
    score: number;
    rounds: number;
    timestamp: Date;
  }>;
  count: number;
}

// Match submission
export interface MatchSubmission {
  gameId?: string;
  playerId?: string;
  mode: GameMode;
  totalScore: number;
  rounds: RoundSubmission[];
  completedAt: string;
  sessionDuration?: number;
  performanceMetrics?: PerformanceMetrics;
}

export interface RoundSubmission {
  round: number;
  locationId?: string;
  userCoordinates: Coordinates;
  correctCoordinates: Coordinates;
  distance: number;
  points: number;
  timestamp?: string;
}

// Photo API
export interface PhotoResponse {
  mode: "normal" | "triangle";
  image?: string;
  id?: ObjectId | string;
  correctX?: number;
  correctY?: number;
  records?: ImageRecordsResponse;
  images?: TriangleImage[];
  triangleData?: TriangleData;
}

export interface ImageRecordsResponse {
  mostAccurate_allTime: ImageRecord | null;
  mostAccurate_monthly: ImageRecord | null;
  fastestCorrect_allTime: ImageRecord | null;
  fastestCorrect_monthly: ImageRecord | null;
  totalGuesses: number;
  averageDistance: number;
}

export interface TriangleImage {
  image: string;
  id: string;
  correctX: number;
  correctY: number;
  records: ImageRecordsResponse;
}

export interface TriangleData {
  centroid: Coordinates;
  vertices: Coordinates[];
  area: number;
}
