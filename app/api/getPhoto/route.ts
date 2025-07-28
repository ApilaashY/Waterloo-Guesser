export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ error: 'GET method not supported. Use POST.' }), { status: 405 });
}
import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || '';
if (!uri || !dbName) {
  console.error('Missing MongoDB env variables:', { uri, dbName });
}

export async function POST(req: NextRequest) {
  try {
    const client = new MongoClient(uri || '');
    await client.connect();
    const db = client.db(dbName || '');
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
      await client.close();
      return new Response(JSON.stringify({ error: 'No images available' }), { status: 404 });
    }
    const randomSkip = Math.floor(Math.random() * count);
    const doc = await collection.find(query).skip(randomSkip).limit(1).next();
    await client.close();
    if (!doc) {
      return new Response(JSON.stringify({ error: 'No image found' }), { status: 404 });
    }
    // Return image as base64 string and metadata
    return new Response(JSON.stringify({
      image: doc.image ? `data:image/png;base64,${doc.image}` : null,
      id: doc._id,
      building: doc.building,
      xCoordinate: doc.xCoordinate,
      yCoordinate: doc.yCoordinate,
      name: doc.name,
      latitude: doc.latitude,
      longitude: doc.longitude
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500 });
  }
}
