import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    const userCollection = db.collection("users");

    const userLeaderboard = await userCollection
      .aggregate([
        {
          $addFields: {
            totalPoints: { $ifNull: ["$totalPoints", 0] },
          },
        },
        {
          $sort: { totalPoints: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: { username: 1, totalPoints: 1, _id: 0 },
        },
      ])
      .toArray();

    return NextResponse.json(userLeaderboard);
  } catch (error) {
    console.error("Error fetching user leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch user leaderboard" },
      { status: 500 }
    );
  }
}
