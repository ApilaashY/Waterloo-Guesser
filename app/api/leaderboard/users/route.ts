import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

/**
 * GET /api/leaderboard/users
 *
 * Returns top users combining both:
 * 1. Registered users from the 'users' collection
 * 2. Anonymous players from the 'leaderboard' collection (type: "daily")
 *
 * Query params:
 * - limit: number of results (default: 10, max: 100)
 * - period: "all-time" | "daily" | "weekly" | "monthly" (default: "all-time")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10", 10),
      100
    );
    const period = searchParams.get("period") || "all-time";

    const db = await getDb();
    const userCollection = db.collection("users");
    const leaderboardCollection = db.collection("leaderboard");

    let userLeaderboard: any[] = [];

    if (period === "all-time") {
      // Get registered users with their total points
      const registeredUsers = await userCollection
        .aggregate([
          {
            $addFields: {
              totalPoints: { $ifNull: ["$totalPoints", 0] },
            },
          },
          {
            $match: {
              totalPoints: { $gt: 0 },
            },
          },
          {
            $project: {
              username: 1,
              totalPoints: 1,
              department: 1,
              _id: 0,
              isRegistered: { $literal: true },
            },
          },
        ])
        .toArray();

      // Combine and sort by score
      userLeaderboard = registeredUsers
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit);
    } else if (period === "daily") {
      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Get daily leaderboard entries
      const dailyEntries = await leaderboardCollection
        .aggregate([
          {
            $match: {
              type: "daily",
              date: today,
            },
          },
          {
            $group: {
              _id: "$username",
              totalPoints: { $sum: "$score" },
              gamesPlayed: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              username: "$_id",
              totalPoints: 1,
              gamesPlayed: 1,
              isRegistered: { $literal: false },
            },
          },
          {
            $sort: { totalPoints: -1 },
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      userLeaderboard = dailyEntries;
    } else if (period === "weekly") {
      // Get week's date range
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];

      const weeklyEntries = await leaderboardCollection
        .aggregate([
          {
            $match: {
              type: "daily",
              date: { $gte: weekAgoStr, $lte: todayStr },
            },
          },
          {
            $group: {
              _id: "$username",
              totalPoints: { $sum: "$score" },
              gamesPlayed: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              username: "$_id",
              totalPoints: 1,
              gamesPlayed: 1,
            },
          },
          {
            $sort: { totalPoints: -1 },
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      userLeaderboard = weeklyEntries;
    } else if (period === "monthly") {
      // Get current month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      const monthlyEntries = await leaderboardCollection
        .aggregate([
          {
            $match: {
              type: "daily",
              date: { $regex: `^${currentMonth}` },
            },
          },
          {
            $group: {
              _id: "$username",
              totalPoints: { $sum: "$score" },
              gamesPlayed: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              username: "$_id",
              totalPoints: 1,
              gamesPlayed: 1,
            },
          },
          {
            $sort: { totalPoints: -1 },
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      userLeaderboard = monthlyEntries;
    }

    return NextResponse.json({
      success: true,
      period,
      leaderboard: userLeaderboard,
      count: userLeaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching user leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch user leaderboard" },
      { status: 500 }
    );
  }
}
