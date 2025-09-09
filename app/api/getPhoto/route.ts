import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb";

export async function POST(req: NextRequest) {
  const start = Date.now();
  console.log("[getPhoto] Start");
  try {
    const dbStart = Date.now();
    const db = await getDb();
    const collection = db.collection("base_locations");
    console.log("[getPhoto] DB connect:", Date.now() - dbStart, "ms");

    // Optionally, filter out previously used images
    let previousCodes: string[] = [];
    let forceId: string | undefined = undefined;
    let bodyParseStart = Date.now();
    try {
      const body = await req.json();
      previousCodes = body.previousCodes || [];
      forceId = body.forceId;
    } catch {}
    console.log("[getPhoto] Body parse:", Date.now() - bodyParseStart, "ms");

    let doc = null;
    if (forceId && ObjectId.isValid(forceId)) {
      const findStart = Date.now();
      doc = await collection.findOne({
        _id: ObjectId.createFromHexString(forceId),
      });
      console.log("[getPhoto] Find by forceId:", Date.now() - findStart, "ms");
      if (!doc) {
        console.log("[getPhoto] No image found for forceId");
        return new Response(
          JSON.stringify({ error: "No image found for forceId" }),
          { status: 404 }
        );
      }
    } else {
      // Convert previousCodes to ObjectId
      let query = {};
      if (previousCodes.length > 0) {
        const objectIds = previousCodes
          .filter((id) => ObjectId.isValid(id))
          .map((id) => ObjectId.createFromHexString(id));
        query = { _id: { $nin: objectIds } };
      }
      const countStart = Date.now();
      const count = await collection.countDocuments(query);
      console.log("[getPhoto] Count query:", Date.now() - countStart, "ms");
      if (count === 0) {
        console.log("[getPhoto] No images available");
        return new Response(JSON.stringify({ error: "No images available" }), {
          status: 404,
        });
      }
      const randomSkip = Math.floor(Math.random() * count);
      const findStart = Date.now();
      doc = await collection.find(query).skip(randomSkip).limit(1).next();
      console.log("[getPhoto] Find random doc:", Date.now() - findStart, "ms");
      if (!doc) {
        console.log("[getPhoto] No image found");
        return new Response(JSON.stringify({ error: "No image found" }), {
          status: 404,
        });
      }
    }
    // Return image URL and MongoDB document id with coordinates
    console.log("[getPhoto] Total time:", Date.now() - start, "ms");
    return new Response(
      JSON.stringify({
        image: doc.image ?? null,
        id: doc._id,
        correctX: doc.xCoordinate,
        correctY: doc.yCoordinate,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log("[getPhoto] Error:", String(err));
    return new Response(
      JSON.stringify({ error: "Server error", details: String(err) }),
      { status: 500 }
    );
  }
}
