import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('base_locations');

    // Optionally, filter out previously used images
    let previousCodes: string[] = [];
    try {
      const body = await req.json();
      previousCodes = body.previousCodes || [];
    } catch {}

    // Convert previousCodes to ObjectId
    let query = {};
    if (previousCodes.length > 0) {
      const objectIds = previousCodes
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));
      query = { _id: { $nin: objectIds } };
    }
    const count = await collection.countDocuments(query);
    if (count === 0) {
      return new Response(JSON.stringify({ error: 'No images available' }), { status: 404 });
    }
    const randomSkip = Math.floor(Math.random() * count);
    const doc = await collection.find(query).skip(randomSkip).limit(1).next();
    if (!doc) {
      return new Response(JSON.stringify({ error: 'No image found' }), { status: 404 });
    }
    // Return only the image as base64 string
    return new Response(
      JSON.stringify({ image: doc.image ? `data:image/png;base64,${doc.image}` : null }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500 });
  }
}
