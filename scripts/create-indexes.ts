/**
 * Database Indexes Creation Script
 *
 * Run this script to create optimized indexes for the MongoDB collections.
 * This improves query performance for frequently accessed fields.
 *
 * Usage: npx ts-node scripts/create-indexes.ts
 */

import { getDb } from "../lib/mongodb";

async function createIndexes() {
  console.log("🔧 Starting index creation...\n");

  try {
    const db = await getDb();

    // ========================================================================
    // USERS COLLECTION
    // ========================================================================
    console.log("📊 Creating indexes for 'users' collection...");
    const usersCollection = db.collection("users");

    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log("  ✅ Created unique index on 'email'");

    await usersCollection.createIndex({ username: 1 });
    console.log("  ✅ Created index on 'username'");

    await usersCollection.createIndex({ waterlooUsername: 1 });
    console.log("  ✅ Created index on 'waterlooUsername'");

    await usersCollection.createIndex({ totalPoints: -1 });
    console.log("  ✅ Created descending index on 'totalPoints' (for leaderboards)");

    await usersCollection.createIndex({ department: 1, totalPoints: -1 });
    console.log("  ✅ Created compound index on 'department' + 'totalPoints' (for faculty leaderboards)");

    // ========================================================================
    // BASE LOCATIONS COLLECTION
    // ========================================================================
    console.log("\n📊 Creating indexes for 'base_locations' collection...");
    const baseLocationsCollection = db.collection("base_locations");

    await baseLocationsCollection.createIndex({ status: 1 });
    console.log("  ✅ Created index on 'status'");

    await baseLocationsCollection.createIndex({ building: 1 });
    console.log("  ✅ Created index on 'building'");

    await baseLocationsCollection.createIndex({ buildingCode: 1 });
    console.log("  ✅ Created index on 'buildingCode'");

    await baseLocationsCollection.createIndex({ buildingIdentifier: -1 });
    console.log("  ✅ Created descending index on 'buildingIdentifier'");

    await baseLocationsCollection.createIndex({
      building: 1,
      buildingIdentifier: -1
    });
    console.log("  ✅ Created compound index on 'building' + 'buildingIdentifier'");

    // ========================================================================
    // MATCHES COLLECTION
    // ========================================================================
    console.log("\n📊 Creating indexes for 'matches' collection...");
    const matchesCollection = db.collection("matches");

    await matchesCollection.createIndex({ playerId: 1 });
    console.log("  ✅ Created index on 'playerId'");

    await matchesCollection.createIndex({ gameId: 1 });
    console.log("  ✅ Created index on 'gameId'");

    await matchesCollection.createIndex({ completedAt: -1 });
    console.log("  ✅ Created descending index on 'completedAt'");

    await matchesCollection.createIndex({ mode: 1 });
    console.log("  ✅ Created index on 'mode'");

    await matchesCollection.createIndex({
      playerId: 1,
      completedAt: -1
    });
    console.log("  ✅ Created compound index on 'playerId' + 'completedAt'");

    await matchesCollection.createIndex({ status: 1 });
    console.log("  ✅ Created index on 'status'");

    // ========================================================================
    // PLAYER MATCHES COLLECTION
    // ========================================================================
    console.log("\n📊 Creating indexes for 'player_matches' collection...");
    const playerMatchesCollection = db.collection("player_matches");

    await playerMatchesCollection.createIndex({
      playerId: 1,
      createdAt: -1
    });
    console.log("  ✅ Created compound index on 'playerId' + 'createdAt'");

    await playerMatchesCollection.createIndex({ matchId: 1 });
    console.log("  ✅ Created index on 'matchId'");

    // ========================================================================
    // LEADERBOARD COLLECTION
    // ========================================================================
    console.log("\n📊 Creating indexes for 'leaderboard' collection...");
    const leaderboardCollection = db.collection("leaderboard");

    await leaderboardCollection.createIndex({ playerId: 1 });
    console.log("  ✅ Created index on 'playerId'");

    await leaderboardCollection.createIndex({ score: -1 });
    console.log("  ✅ Created descending index on 'score'");

    await leaderboardCollection.createIndex({ rank: 1 });
    console.log("  ✅ Created index on 'rank'");

    // Daily leaderboard specific indexes
    await leaderboardCollection.createIndex({
      type: 1,
      date: 1,
      score: -1
    });
    console.log("  ✅ Created compound index on 'type' + 'date' + 'score' (for daily leaderboards)");

    await leaderboardCollection.createIndex({ lastUpdated: -1 });
    console.log("  ✅ Created descending index on 'lastUpdated'");

    // ========================================================================
    // USER REFS COLLECTION
    // ========================================================================
    console.log("\n📊 Creating indexes for 'user_refs' collection...");
    const userRefsCollection = db.collection("user_refs");

    await userRefsCollection.createIndex({ user: 1 });
    console.log("  ✅ Created index on 'user'");

    console.log("\n✨ All indexes created successfully!\n");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  }
}

// Run the script
createIndexes()
  .then(() => {
    console.log("🎉 Index creation complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
