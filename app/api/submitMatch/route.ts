import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Interface for round data from the game
interface RoundSubmission {
  round: number;
  locationId?: string;
  userCoordinates: {
    x: number;
    y: number;
  };
  correctCoordinates: {
    x: number;
    y: number;
  };
  distance: number;
  points: number;
  timestamp?: string;
}

// Interface for the complete match submission
interface MatchSubmission {
  gameId?: string;
  playerId?: string;
  mode: 'singlePlayer' | 'multiplayer';
  totalScore: number;
  rounds: RoundSubmission[];
  completedAt: string;
  sessionDuration?: number; // in milliseconds
  performanceMetrics?: {
    imageLoadedAt?: number;
    firstMapClickRecorded?: boolean;
    firstSubmitRecorded?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const matchData = body as MatchSubmission;

    // Validate required fields
    if (!matchData.mode || !matchData.totalScore || !matchData.rounds || !matchData.completedAt) {
      return NextResponse.json(
        { error: "Missing required fields: mode, totalScore, rounds, completedAt" },
        { status: 400 }
      );
    }

    // Validate rounds data
    if (!Array.isArray(matchData.rounds) || matchData.rounds.length === 0) {
      return NextResponse.json(
        { error: "Rounds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate each round
    for (let i = 0; i < matchData.rounds.length; i++) {
      const round = matchData.rounds[i];
      console.log(`Validating round ${i}:`, round);
      
      if (typeof round.round !== 'number') {
        return NextResponse.json(
          { error: `Invalid round data structure: round.round must be a number, got ${typeof round.round}` },
          { status: 400 }
        );
      }
      if (!round.userCoordinates) {
        return NextResponse.json(
          { error: `Invalid round data structure: round.userCoordinates is missing` },
          { status: 400 }
        );
      }
      if (typeof round.userCoordinates.x !== 'number' || typeof round.userCoordinates.y !== 'number') {
        return NextResponse.json(
          { error: `Invalid round data structure: userCoordinates must have numeric x and y properties` },
          { status: 400 }
        );
      }
      if (!round.correctCoordinates) {
        return NextResponse.json(
          { error: `Invalid round data structure: round.correctCoordinates is missing` },
          { status: 400 }
        );
      }
      if (typeof round.correctCoordinates.x !== 'number' || typeof round.correctCoordinates.y !== 'number') {
        return NextResponse.json(
          { error: `Invalid round data structure: correctCoordinates must have numeric x and y properties` },
          { status: 400 }
        );
      }
      if (typeof round.distance !== 'number') {
        return NextResponse.json(
          { error: `Invalid round data structure: round.distance must be a number, got ${typeof round.distance}` },
          { status: 400 }
        );
      }
      if (typeof round.points !== 'number') {
        return NextResponse.json(
          { error: `Invalid round data structure: round.points must be a number, got ${typeof round.points}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    
    // Create match document
    const matchDocument = {
      gameId: matchData.gameId || new ObjectId().toString(),
      playerId: matchData.playerId || null,
      mode: matchData.mode,
      totalScore: matchData.totalScore,
      roundCount: matchData.rounds.length,
      rounds: matchData.rounds.map(round => ({
        round: round.round,
        locationId: round.locationId || null,
        userCoordinates: {
          x: round.userCoordinates.x,
          y: round.userCoordinates.y
        },
        correctCoordinates: {
          x: round.correctCoordinates.x,
          y: round.correctCoordinates.y
        },
        distance: round.distance,
        points: round.points,
        timestamp: round.timestamp || new Date().toISOString()
      })),
      completedAt: new Date(matchData.completedAt),
      sessionDuration: matchData.sessionDuration || null,
      performanceMetrics: matchData.performanceMetrics || null,
      createdAt: new Date(),
      status: 'completed'
    };

    // Insert match into matches collection
    const matchesCollection = db.collection("matches");
    const insertResult = await matchesCollection.insertOne(matchDocument);

    // Update player statistics if playerId is provided
    if (matchData.playerId) {
      try {
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({
          _id: ObjectId.createFromHexString(matchData.playerId)
        });

        if (user) {
          // Calculate new statistics
          const currentGamesPlayed = user.stats?.gamesPlayed || 0;
          const currentTotalScore = user.totalPoints || 0;
          const currentBestScore = user.stats?.bestScore || 0;
          const currentAvgScore = user.stats?.avgScore || 0;

          const newGamesPlayed = currentGamesPlayed + 1;
          const newTotalScore = currentTotalScore + matchData.totalScore;
          const newBestScore = Math.max(currentBestScore, matchData.totalScore);
          const newAvgScore = Math.round(newTotalScore / newGamesPlayed);

          // Update user document
          await usersCollection.updateOne(
            { _id: ObjectId.createFromHexString(matchData.playerId) },
            {
              $set: {
                totalPoints: newTotalScore,
                lastActiveAt: new Date(),
                "stats.gamesPlayed": newGamesPlayed,
                "stats.gamesPlayedLastUpdated": new Date(),
                "stats.avgScore": newAvgScore,
                "stats.bestScore": newBestScore,
                "stats.bestScoreLastUpdated": newBestScore > currentBestScore ? new Date() : user.stats?.bestScoreLastUpdated
              }
            }
          );

          // Optionally update leaderboard collection if it exists
          const leaderboardCollection = db.collection("leaderboard");
          const leaderboardEntry = await leaderboardCollection.findOne({
            playerId: matchData.playerId
          });

          if (leaderboardEntry) {
            await leaderboardCollection.updateOne(
              { playerId: matchData.playerId },
              {
                $set: {
                  score: newTotalScore,
                  lastUpdated: new Date()
                }
              }
            );
          } else {
            // Create new leaderboard entry
            await leaderboardCollection.insertOne({
              playerId: matchData.playerId,
              score: newTotalScore,
              rank: null, // Will be calculated separately
              lastUpdated: new Date()
            });
          }

          // Maintain last 100 matches for the player
          await maintainPlayerMatchHistory(db, matchData.playerId, insertResult.insertedId);
        }
      } catch (userUpdateError) {
        console.error("Error updating user statistics:", userUpdateError);
        // Continue execution - match was saved successfully
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      matchId: insertResult.insertedId.toString(),
      message: "Match submitted successfully",
      data: {
        gameId: matchDocument.gameId,
        totalScore: matchDocument.totalScore,
        roundCount: matchDocument.roundCount,
        completedAt: matchDocument.completedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error submitting match:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}

/**
 * Maintains the last 100 matches for a player.
 * If player has more than 100 matches, removes the oldest entries.
 */
async function maintainPlayerMatchHistory(db: any, playerId: string, newMatchId: ObjectId) {
  try {
    const playerMatchesCollection = db.collection("player_matches");
    
    // First, add the new match to the player's match history
    await playerMatchesCollection.insertOne({
      playerId: playerId,
      matchId: newMatchId,
      createdAt: new Date()
    });

    // Count total matches for this player
    const totalMatches = await playerMatchesCollection.countDocuments({
      playerId: playerId
    });

    // If more than 100 matches, remove the oldest ones
    if (totalMatches > 100) {
      const excessCount = totalMatches - 100;
      
      // Find the oldest matches to remove
      const oldestMatches = await playerMatchesCollection
        .find({ playerId: playerId })
        .sort({ createdAt: 1 })
        .limit(excessCount)
        .toArray();

      if (oldestMatches.length > 0) {
        const oldestMatchIds = oldestMatches.map((match: any) => match._id);
        
        // Remove the oldest match history entries
        await playerMatchesCollection.deleteMany({
          _id: { $in: oldestMatchIds }
        });

        console.log(`Removed ${oldestMatches.length} oldest matches for player ${playerId}`);
      }
    }

    console.log(`Maintained match history for player ${playerId}. Total matches: ${Math.min(totalMatches, 100)}`);
  } catch (error) {
    console.error("Error maintaining player match history:", error);
    // Don't throw - this is not critical for the main operation
  }
}

// GET method to retrieve match data (optional)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    const playerId = searchParams.get('playerId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const matchesCollection = db.collection("matches");

    let matches: any[] = [];
    
    if (matchId) {
      // Retrieve specific match by ID
      const match = await matchesCollection.findOne({
        _id: ObjectId.createFromHexString(matchId)
      });
      matches = match ? [match] : [];
    } else if (playerId) {
      // Retrieve matches for a specific player using the player_matches collection
      // This ensures we only get the last 100 matches maintained for the player
      const playerMatchesCollection = db.collection("player_matches");
      
      const playerMatches = await playerMatchesCollection
        .find({ playerId: playerId })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();

      if (playerMatches.length > 0) {
        const matchIds = playerMatches.map((pm: any) => pm.matchId);
        
        // Get the actual match documents
        matches = await matchesCollection
          .find({ _id: { $in: matchIds } })
          .sort({ completedAt: -1 })
          .toArray();
      }
    } else {
      // Retrieve recent matches (general query)
      matches = await matchesCollection
        .find({})
        .sort({ completedAt: -1 })
        .limit(limit)
        .toArray();
    }

    return NextResponse.json({
      success: true,
      matches: matches.map((match: any) => ({
        ...match,
        _id: match._id.toString()
      }))
    });

  } catch (error) {
    console.error("Error retrieving matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
