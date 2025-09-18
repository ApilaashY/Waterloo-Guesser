import { getDb } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const clubName = searchParams.get("clubname");

  // Fetch posters from the database or any data source
  const db = await getDb();
  const collection = db.collection("posters");

  let posters;
  // Base query to only show approved posters

  // If clubName is provided, add it to the filter; otherwise, get all approved posters
  if (!clubName) {
    posters = await collection.find({ show: true }).toArray();
  } else {
    // Case-insensitive search using regex with show filter
    posters = await collection
      .find({
        show: true,
        clubName: { $regex: new RegExp(clubName, "i") },
      })
      .toArray();
  }

  return NextResponse.json({ posters });
}
