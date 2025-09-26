import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Interface for daily leaderboard entry (stored in leaderboard collection with type="daily")
interface DailyLeaderboardEntry {
  username: string;
  score: number;
  type: string; // "daily" for daily leaderboard entries
  date: string; // YYYY-MM-DD format
  timestamp: Date;
  sessionId?: string;
  rounds: number;
}

// Interface for image records tracking
interface ImageRecord {
  distance: number;
  username: string;
  sessionId: string;
  timestamp: Date;
  score?: number; // For accuracy records
  responseTime?: number; // For speed records (milliseconds)
  month?: string; // YYYY-MM format for monthly records
}

interface ImageRecords {
  imageId: string;
  mostAccurate_allTime: ImageRecord | null;
  mostAccurate_monthly: ImageRecord | null;
  fastestCorrect_allTime: ImageRecord | null;
  fastestCorrect_monthly: ImageRecord | null;
  totalGuesses: number;
  averageDistance: number;
  lastUpdated: Date;
}

// Interface for achievements earned
interface Achievement {
  type: 'most_accurate' | 'fastest_correct';
  scope: 'all_time' | 'monthly';
  imageId: string;
  previousRecord?: ImageRecord;
  newRecord: ImageRecord;
}

// Interface for the request payload with timing and accuracy data
interface SaveScoreRequest {
  username?: string; // Optional - will be auto-generated if not provided
  score: number;
  rounds: number;
  sessionId?: string;
  // New timing and accuracy fields
  imageId?: string;
  userCoordinates?: { x: number; y: number };
  correctCoordinates?: { x: number; y: number };
  imageLoadedAt?: number; // timestamp when image finished loading
  guessSubmittedAt?: number; // timestamp when user submitted guess
}

// Interface for getting daily leaderboard
interface GetLeaderboardRequest {
  date?: string; // Optional, defaults to today
  limit?: number; // Optional, defaults to 10
}

// Function to generate random usernames
function generateUsername(): string {
  const adjectives = [
    'Swift', 'Brave', 'Smart', 'Quick', 'Bold', 'Wise', 'Cool', 'Epic',
    'Fast', 'Sharp', 'Bright', 'Strong', 'Lucky', 'Clever', 'Mighty',
    'Silent', 'Golden', 'Silver', 'Fierce', 'Noble', 'Wild', 'Free',
    'Royal', 'Elite', 'Prime', 'Alpha', 'Ultra', 'Super', 'Mega', 'Turbo'
  ];
  
  const nouns = [
    'Explorer', 'Navigator', 'Hunter', 'Scout', 'Warrior', 'Champion', 'Master',
    'Seeker', 'Finder', 'Detective', 'Ranger', 'Guardian', 'Knight', 'Hero',
    'Adventurer', 'Pioneer', 'Traveler', 'Wanderer', 'Pilot', 'Captain',
    'Fox', 'Wolf', 'Eagle', 'Hawk', 'Tiger', 'Lion', 'Bear', 'Dragon',
    'Phoenix', 'Falcon', 'Raven', 'Shark', 'Panther', 'Lynx', 'Cobra'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
}

// Function to calculate distance between two coordinates (in pixels)
function calculateDistance(coord1: { x: number; y: number }, coord2: { x: number; y: number }): number {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Function to determine if a guess is "correct" or "close" enough for speed records
function isCorrectOrClose(distance: number): boolean {
  // Consider guesses within 100 pixels as "correct/close"
  return distance <= 100;
}

// Function to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Function to check and update image records in base_locations collection
async function checkAndUpdateImageRecords(
  db: any,
  imageId: string,
  username: string,
  sessionId: string,
  distance: number,
  responseTime: number,
  score: number
): Promise<Achievement[]> {
  const achievements: Achievement[] = [];
  const currentMonth = getCurrentMonth();
  const timestamp = new Date();
  
  const baseLocationsCollection = db.collection("base_locations");
  
  // Get existing record for this image from base_locations
  let existingDoc = await baseLocationsCollection.findOne({ 
    _id: ObjectId.createFromHexString(imageId) 
  });
  
  if (!existingDoc) {
    console.error(`Image document not found for ID: ${imageId}`);
    return achievements;
  }
  
  // Initialize record fields if they don't exist
  if (!existingDoc.mostAccurate_allTime) existingDoc.mostAccurate_allTime = null;
  if (!existingDoc.mostAccurate_monthly) existingDoc.mostAccurate_monthly = null;
  if (!existingDoc.fastestCorrect_allTime) existingDoc.fastestCorrect_allTime = null;
  if (!existingDoc.fastestCorrect_monthly) existingDoc.fastestCorrect_monthly = null;
  if (!existingDoc.totalGuesses) existingDoc.totalGuesses = 0;
  if (!existingDoc.averageDistance) existingDoc.averageDistance = 0;
  
  const isCorrect = isCorrectOrClose(distance);
  
  // Check for most accurate records (all-time)
  if (!existingDoc.mostAccurate_allTime || distance < existingDoc.mostAccurate_allTime.distance) {
    const previousRecord = existingDoc.mostAccurate_allTime;
    const newRecord: ImageRecord = {
      distance,
      username,
      sessionId,
      timestamp,
      score
    };
    
    existingDoc.mostAccurate_allTime = newRecord;
    achievements.push({
      type: 'most_accurate',
      scope: 'all_time',
      imageId,
      previousRecord,
      newRecord
    });
  }
  
  // Check for most accurate records (monthly)
  if (!existingDoc.mostAccurate_monthly || 
      distance < existingDoc.mostAccurate_monthly.distance ||
      existingDoc.mostAccurate_monthly.month !== currentMonth) {
    
    const previousRecord = existingDoc.mostAccurate_monthly?.month === currentMonth ? 
      existingDoc.mostAccurate_monthly : null;
    
    const newRecord: ImageRecord = {
      distance,
      username,
      sessionId,
      timestamp,
      score,
      month: currentMonth
    };
    
    existingDoc.mostAccurate_monthly = newRecord;
    achievements.push({
      type: 'most_accurate',
      scope: 'monthly',
      imageId,
      previousRecord,
      newRecord
    });
  }
  
  // Check for fastest correct records (only if guess is correct/close)
  if (isCorrect) {
    // Check all-time fastest
    if (!existingDoc.fastestCorrect_allTime || responseTime < existingDoc.fastestCorrect_allTime.responseTime!) {
      const previousRecord = existingDoc.fastestCorrect_allTime;
      const newRecord: ImageRecord = {
        distance,
        username,
        sessionId,
        timestamp,
        responseTime
      };
      
      existingDoc.fastestCorrect_allTime = newRecord;
      achievements.push({
        type: 'fastest_correct',
        scope: 'all_time',
        imageId,
        previousRecord,
        newRecord
      });
    }
    
    // Check monthly fastest
    if (!existingDoc.fastestCorrect_monthly || 
        responseTime < existingDoc.fastestCorrect_monthly.responseTime! ||
        existingDoc.fastestCorrect_monthly.month !== currentMonth) {
      
      const previousRecord = existingDoc.fastestCorrect_monthly?.month === currentMonth ? 
        existingDoc.fastestCorrect_monthly : null;
      
      const newRecord: ImageRecord = {
        distance,
        username,
        sessionId,
        timestamp,
        responseTime,
        month: currentMonth
      };
      
      existingDoc.fastestCorrect_monthly = newRecord;
      achievements.push({
        type: 'fastest_correct',
        scope: 'monthly',
        imageId,
        previousRecord,
        newRecord
      });
    }
  }
  
  // Update statistics
  const newTotalGuesses = existingDoc.totalGuesses + 1;
  const newAverageDistance = ((existingDoc.averageDistance * existingDoc.totalGuesses) + distance) / newTotalGuesses;
  
  existingDoc.totalGuesses = newTotalGuesses;
  existingDoc.averageDistance = newAverageDistance;
  existingDoc.lastUpdated = timestamp;
  
  // Save updated document back to base_locations
  await baseLocationsCollection.updateOne(
    { _id: ObjectId.createFromHexString(imageId) },
    {
      $set: {
        mostAccurate_allTime: existingDoc.mostAccurate_allTime,
        mostAccurate_monthly: existingDoc.mostAccurate_monthly,
        fastestCorrect_allTime: existingDoc.fastestCorrect_allTime,
        fastestCorrect_monthly: existingDoc.fastestCorrect_monthly,
        totalGuesses: existingDoc.totalGuesses,
        averageDistance: existingDoc.averageDistance,
        lastUpdated: existingDoc.lastUpdated
      }
    }
  );
  
  return achievements;
}

export async function POST(req: NextRequest) {
  try {
    const body: SaveScoreRequest = await req.json();
    const { 
      username, 
      score, 
      rounds, 
      sessionId,
      imageId,
      userCoordinates,
      correctCoordinates,
      imageLoadedAt,
      guessSubmittedAt
    } = body;

    // Validate input
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Score must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof rounds !== 'number' || rounds < 1) {
      return NextResponse.json(
        { error: 'Rounds must be a positive number' },
        { status: 400 }
      );
    }

    // Generate username if not provided, or sanitize if provided
    let finalUsername: string;
    if (username && typeof username === 'string' && username.trim().length > 0) {
      finalUsername = username.trim().substring(0, 50);
    } else {
      finalUsername = generateUsername();
    }

    const db = await getDb();
    const leaderboardCollection = db.collection("leaderboard");

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const timestamp = new Date();

    // Initialize achievements array
    let achievements: Achievement[] = [];

    // Process server-side scoring if we have all required data
    if (imageId && userCoordinates && correctCoordinates && imageLoadedAt && guessSubmittedAt) {
      try {
        // Calculate distance server-side
        const distance = calculateDistance(userCoordinates, correctCoordinates);
        
        // Calculate response time (how long from image loaded to guess submitted)
        const responseTime = guessSubmittedAt - imageLoadedAt;
        
        // Check and update image records
        achievements = await checkAndUpdateImageRecords(
          db,
          imageId,
          finalUsername,
          sessionId || `temp_${Date.now()}`,
          distance,
          responseTime,
          score
        );
        
        console.log(`Server-side scoring completed for ${imageId}: distance=${distance.toFixed(2)}px, responseTime=${responseTime}ms, achievements=${achievements.length}`);
      } catch (recordError) {
        console.error('Error processing image records:', recordError);
        // Continue with leaderboard save even if record processing fails
      }
    }

    const leaderboardEntry: DailyLeaderboardEntry = {
      username: finalUsername,
      score,
      type: "daily",
      date: today,
      timestamp,
      rounds,
      sessionId,
    };

    // Insert the entry
    const result = await leaderboardCollection.insertOne(leaderboardEntry);

    return NextResponse.json({
      success: true,
      entryId: result.insertedId,
      username: finalUsername,
      message: 'Score saved to daily leaderboard successfully',
      achievements: achievements.map(achievement => ({
        type: achievement.type,
        scope: achievement.scope,
        imageId: achievement.imageId,
        isNewRecord: true,
        previousRecord: achievement.previousRecord ? {
          distance: achievement.previousRecord.distance,
          username: achievement.previousRecord.username,
          responseTime: achievement.previousRecord.responseTime,
          score: achievement.previousRecord.score
        } : null,
        newRecord: {
          distance: achievement.newRecord.distance,
          username: achievement.newRecord.username,
          responseTime: achievement.newRecord.responseTime,
          score: achievement.newRecord.score
        }
      }))
    });

  } catch (error) {
    console.error('Error saving to daily leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to save score to daily leaderboard' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const db = await getDb();
    const leaderboardCollection = db.collection("leaderboard");

    // Get leaderboard for the specified date, filtered by type="daily", sorted by score descending
    const leaderboard = await leaderboardCollection
      .find(
        { 
          type: "daily",
          date 
        },
        { 
          projection: { 
            username: 1, 
            score: 1, 
            rounds: 1, 
            timestamp: 1, 
            _id: 0 
          } 
        }
      )
      .sort({ score: -1, timestamp: 1 }) // Sort by score desc, then by earliest timestamp
      .limit(Math.min(limit, 100)) // Cap at 100 entries max
      .toArray();

    return NextResponse.json({
      success: true,
      date,
      leaderboard,
      count: leaderboard.length
    });

  } catch (error) {
    console.error('Error retrieving daily leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve daily leaderboard' },
      { status: 500 }
    );
  }
}
