import { getDb } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const clubName = searchParams.get("clubname");
  const categoriesParam = searchParams.get("categories");
  const categories =
    !categoriesParam || categoriesParam.length === 0
      ? null
      : categoriesParam?.split(",");

  // Fetch posters from the database or any data source
  const db = await getDb();
  const collection = db.collection("posters");

  // Base query to only show approved posters

  const query: any = { show: true };
  // If clubName is provided, add it to the filter; otherwise, get all approved posters
  if (clubName) {
    // Build query object dynamically
    query.name = { $regex: new RegExp(clubName, "i") };
    query.posterType = "Club";
  }
  // Add categories filter only if categories exist and have items
  if (categories && categories.length > 0) {
    query.categories = { $in: categories };
  }

  console.log(query);
  const posters = await collection.find(query).toArray();

  return NextResponse.json({ posters });
}
