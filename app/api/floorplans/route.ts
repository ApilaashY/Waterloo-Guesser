import { NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || '';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const floorplans = await db.collection('floorplans').find({}).toArray();
    const buildings = await db.collection('buildings').find({}).toArray();
    await client.close();
    return new Response(
      JSON.stringify({ floorplans, buildings }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
