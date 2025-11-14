import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    const userCollection = db.collection("users");

    const facultyLeaderboard = await userCollection
      .aggregate([
        {
          $group: {
            _id: "$department",
            totalPoints: { $sum: "$totalPoints" },
          },
        },
        {
          $sort: { totalPoints: -1 },
        },
        {
          $project: {
            _id: 0,
            department: "$_id",
            totalPoints: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(facultyLeaderboard);
  } catch (error) {
    console.error("Error fetching faculty leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch faculty leaderboard" },
      { status: 500 }
    );
  }
}
