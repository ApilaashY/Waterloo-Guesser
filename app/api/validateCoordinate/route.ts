import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { xCoor, yCoor, id } = body as any;

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
      const doc = await collection.findOne(
        { _id: new ObjectId(id) },
        { projection: { xCoordinate: 1, yCoordinate: 1 } }
      );
      if (!doc) {
        return new Response(JSON.stringify({ error: "Location not found" }), {
          status: 404,
        });
      }
      correctX = doc.xCoordinate;
      correctY = doc.yCoordinate;
    }

    // Calculate points based on distance (simple Euclidean for now)
    const points = calculatePoints(xCoor, yCoor, correctX!, correctY!);

    return new Response(
      JSON.stringify({ xCoor: correctX, yCoor: correctY, points }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: String(err) }),
      { status: 500 }
    );
  }
}

function calculatePoints(
  xCoor: number,
  yCoor: number,
  correctX: number,
  correctY: number
): number {
  // Calculate points based on distance (simple Euclidean for now)
  const dx = xCoor - correctX!;
  const dy = yCoor - correctY!;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Example scoring: max 1000, lose 200 per 0.1 distance
  const points = Math.max(0, Math.round(1000 - distance * 2000));
  return points;
}
