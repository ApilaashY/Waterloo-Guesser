import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb";

// Interface for image records
interface ImageRecord {
  distance: number;
  username: string;
  sessionId: string;
  timestamp: Date;
  score?: number;
  responseTime?: number;
  month?: string;
}

interface ImageRecordsResponse {
  mostAccurate_allTime: ImageRecord | null;
  mostAccurate_monthly: ImageRecord | null;
  fastestCorrect_allTime: ImageRecord | null;
  fastestCorrect_monthly: ImageRecord | null;
  totalGuesses: number;
  averageDistance: number;
}

// Interface for Triangle mode response
interface TriangleResponse {
  mode: "triangle";
  images: Array<{
    image: string;
    id: string;
    correctX: number;
    correctY: number;
    records: ImageRecordsResponse;
  }>;
  triangleData: {
    centroid: { x: number; y: number };
    vertices: Array<{ x: number; y: number }>;
    area: number;
  };
}

// Function to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Function to calculate triangle centroid
function calculateCentroid(vertices: Array<{ x: number; y: number }>): { x: number; y: number } {
  const sumX = vertices.reduce((sum, vertex) => sum + vertex.x, 0);
  const sumY = vertices.reduce((sum, vertex) => sum + vertex.y, 0);
  return {
    x: sumX / vertices.length,
    y: sumY / vertices.length
  };
}

// Function to calculate triangle area using shoelace formula
function calculateTriangleArea(vertices: Array<{ x: number; y: number }>): number {
  if (vertices.length !== 3) return 0;
  
  const [a, b, c] = vertices;
  return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
}

// Function to select 3 images that form a good triangle
async function selectTriangleImages(collection: any, previousCodes: string[]): Promise<any[]> {
  let query: any = { status: "approved" };
  if (previousCodes.length > 0) {
    const objectIds = previousCodes
      .filter((id) => ObjectId.isValid(id))
      .map((id) => ObjectId.createFromHexString(id));
    query = { _id: { $nin: objectIds } };
  }

  // Get all available images
  const allDocs = await collection.find(query).toArray();
  if (allDocs.length < 3) {
    throw new Error("Not enough images available for triangle mode");
  }

  // Try to find 3 images that form a good triangle (not too small, not too linear)
  const maxAttempts = 50;
  let bestTriangle = null;
  let bestScore = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Randomly select 3 images
    const shuffled = allDocs.sort(() => 0.5 - Math.random());
    const candidates = shuffled.slice(0, 3);
    
    const vertices = candidates.map((doc: any) => ({ x: doc.xCoordinate, y: doc.yCoordinate }));
    const area = calculateTriangleArea(vertices);
    
    // Score based on area (prefer larger triangles) and avoid degenerate triangles
    if (area > 0.01) { // Minimum area threshold
      const score = area;
      if (score > bestScore) {
        bestScore = score;
        bestTriangle = candidates;
      }
    }
  }

  return bestTriangle || allDocs.slice(0, 3); // Fallback to first 3 if no good triangle found
}

// Function to fetch image records from base_locations collection
async function getImageRecords(db: any, imageId: string): Promise<ImageRecordsResponse> {
  const baseLocationsCollection = db.collection("base_locations");
  const currentMonth = getCurrentMonth();
  
  const record = await baseLocationsCollection.findOne({ 
    _id: ObjectId.createFromHexString(imageId) 
  });
  
  if (!record || !record.mostAccurate_allTime) {
    return {
      mostAccurate_allTime: null,
      mostAccurate_monthly: null,
      fastestCorrect_allTime: null,
      fastestCorrect_monthly: null,
      totalGuesses: 0,
      averageDistance: 0
    };
  }
  
  // Clean up monthly record if it's from a different month
  const monthlyAccurate = record.mostAccurate_monthly?.month === currentMonth ? 
    record.mostAccurate_monthly : null;
  const monthlyFastest = record.fastestCorrect_monthly?.month === currentMonth ? 
    record.fastestCorrect_monthly : null;
  
  return {
    mostAccurate_allTime: record.mostAccurate_allTime,
    mostAccurate_monthly: monthlyAccurate,
    fastestCorrect_allTime: record.fastestCorrect_allTime,
    fastestCorrect_monthly: monthlyFastest,
    totalGuesses: record.totalGuesses || 0,
    averageDistance: record.averageDistance || 0
  };
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  console.log("[getPhoto] Start");
  try {
    const dbStart = Date.now();
    const db = await getDb();
    const collection = db.collection("base_locations");
    console.log("[getPhoto] DB connect:", Date.now() - dbStart, "ms");

    // Parse request body
    let previousCodes: string[] = [];
    let forceId: string | undefined = undefined;
    let mode: string = "normal"; // Default to normal mode
    let bodyParseStart = Date.now();
    try {
      const body = await req.json();
      previousCodes = body.previousCodes || [];
      forceId = body.forceId;
      mode = body.mode || "normal";
    } catch {}
    console.log("[getPhoto] Body parse:", Date.now() - bodyParseStart, "ms");

    // Handle Triangle Trouble mode
    if (mode === "triangle") {
      console.log("[getPhoto] Triangle mode requested");
      const triangleStart = Date.now();
      
      try {
        const triangleImages = await selectTriangleImages(collection, previousCodes);
        console.log("[getPhoto] Triangle selection:", Date.now() - triangleStart, "ms");
        
        // Get records for each image and prepare response
        const imagesWithRecords = await Promise.all(
          triangleImages.map(async (doc: any) => {
            const records = await getImageRecords(db, doc._id.toString());
            return {
              image: doc.image ?? null,
              id: doc._id.toString(),
              correctX: doc.xCoordinate,
              correctY: doc.yCoordinate,
              records: records
            };
          })
        );

        // Calculate triangle data
        const vertices = triangleImages.map((doc: any) => ({ x: doc.xCoordinate, y: doc.yCoordinate }));
        const centroid = calculateCentroid(vertices);
        const area = calculateTriangleArea(vertices);

        const triangleResponse: TriangleResponse = {
          mode: "triangle",
          images: imagesWithRecords,
          triangleData: {
            centroid,
            vertices,
            area
          }
        };

        console.log("[getPhoto] Triangle mode total time:", Date.now() - start, "ms");
        return new Response(JSON.stringify(triangleResponse), { status: 200 });
      } catch (error) {
        console.log("[getPhoto] Triangle mode error:", String(error));
        return new Response(
          JSON.stringify({ error: "Triangle mode error", details: String(error) }),
          { status: 500 }
        );
      }
    }

    // Original single image logic (normal mode)
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
      let query: any = { status: "approved" };
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
    // Return image URL and MongoDB document id with coordinates and current records
    console.log("[getPhoto] Getting records for image:", doc._id.toString());
    const recordsStart = Date.now();
    const records = await getImageRecords(db, doc._id.toString());
    console.log("[getPhoto] Records fetch:", Date.now() - recordsStart, "ms");
    
    console.log("[getPhoto] Total time:", Date.now() - start, "ms");
    return new Response(
      JSON.stringify({
        mode: "normal",
        image: doc.image ?? null,
        id: doc._id,
        correctX: doc.xCoordinate,
        correctY: doc.yCoordinate,
        records: records
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
