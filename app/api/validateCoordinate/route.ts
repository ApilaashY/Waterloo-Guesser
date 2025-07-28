import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { xCoor, yCoor, id } = body;
    if (!id || xCoor == null || yCoor == null) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    const db = await getDb();
    const collection = db.collection('base_locations');
    const doc = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { xCoordinate: 1, yCoordinate: 1 } }
    );
    if (!doc) {
      return new Response(JSON.stringify({ error: 'Location not found' }), { status: 404 });
    }
    // Calculate points based on distance (simple Euclidean for now)
    const dx = (xCoor - doc.xCoordinate);
    const dy = (yCoor - doc.yCoordinate);
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Example scoring: max 100, lose 20 per 0.1 distance
    const points = Math.max(0, Math.round(100 - distance * 200));
    return new Response(
      JSON.stringify({ xCoor: doc.xCoordinate, yCoor: doc.yCoordinate, points }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500 });
  }
}
