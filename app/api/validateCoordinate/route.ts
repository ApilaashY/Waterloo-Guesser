import { NextRequest } from "next/server";
import { Db, ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { xCoor, yCoor, id, userId } = body as any;

    // Accept correct coordinates directly to short-circuit DB lookup
    const providedCorrectX = (body.correctX ??
      body.correct_x ??
      body.correctx ??
      null) as number | null;
    const providedCorrectY = (body.correctY ??
      body.correct_y ??
      body.correcty ??
      null) as number | null;

    if (xCoor == null || yCoor == null) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    let correctX: number | null = null;
    let correctY: number | null = null;

    if (providedCorrectX != null && providedCorrectY != null) {
      // Use provided coords
      correctX = providedCorrectX;
      correctY = providedCorrectY;
    } else {
      if (!id) {
        return new Response(
          JSON.stringify({ error: "Missing id for lookup" }),
          { status: 400 }
        );
      }

      const db = await getDb();
      const collection = db.collection("base_locations");
      const doc = await collection.findOne({
        _id: ObjectId.createFromHexString(id),
      });
      if (!doc) {
        return new Response(JSON.stringify({ error: "Location not found" }), {
          status: 404,
        });
      }
      correctX = doc.xCoordinate;
      correctY = doc.yCoordinate;
    }

    // Calculate distance and points
    const result = calculatePointsAndDistance(xCoor, yCoor, correctX!, correctY!);

    // Check if the request is coming from a logged-in user and add the points to their account total
    if (userId) {
      const db = await getDb();
      const usersCollection = db.collection("users");
      const userObject = await usersCollection.findOne({
        _id: ObjectId.createFromHexString(userId),
      });

      if (userObject) {
        const newTotalPoints = (userObject.totalPoints || 0) + result.points;
        await usersCollection.updateOne(
          { _id: ObjectId.createFromHexString(userId) },
          { $set: { totalPoints: newTotalPoints } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        xCoor: correctX, 
        yCoor: correctY, 
        points: result.points,
        distance: result.distance 
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: String(err) }),
      { status: 500 }
    );
  }
}

function calculatePointsAndDistance(
  xCoor: number,
  yCoor: number,
  correctX: number,
  correctY: number
): { points: number; distance: number } {
  // Calculate distance (simple Euclidean)
  const dx = xCoor - correctX!;
  const dy = yCoor - correctY!;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Example scoring: max 1000, lose 200 per 0.1 distance
  const points = Math.max(0, Math.round(1000 - distance * 2000));
  return { points, distance };
}
