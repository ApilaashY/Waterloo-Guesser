import { NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';
import { Buffer } from 'buffer';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || '';
if (!uri || !dbName) {
  console.error('Missing MongoDB env variables:', { uri, dbName });
}

export async function POST(req: NextRequest) {
    // Debug: log the MongoDB URI being used
    console.log('MongoDB URI:', uri);
  try {
    // Parse form data
    const formData = await req.formData();
    const imageFile = formData.get('image');
    const xCoordinate = formData.get('xCoordinate');
    const yCoordinate = formData.get('yCoordinate');
    const name = formData.get('name');
    const building = formData.get('building');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const status = formData.get('status');

    if (!imageFile || !xCoordinate || !yCoordinate || !building) {
      console.error('Missing required fields:', { imageFile, xCoordinate, yCoordinate, building });
      return new Response(JSON.stringify({ error: 'Missing required fields', details: { imageFile, xCoordinate, yCoordinate, building } }), { status: 400 });
    }

    // Debug: log imageFile type
    console.log('imageFile type:', typeof imageFile, imageFile && imageFile.constructor && imageFile.constructor.name);

    // Convert image to base64
    let imageBase64 = null;
    try {
      if (imageFile instanceof Blob) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        imageBase64 = buffer.toString('base64');
      } else {
        console.error('imageFile is not a Blob:', imageFile);
        imageBase64 = null;
      }
    } catch (imgErr) {
      console.error('Image conversion error:', imgErr);
      imageBase64 = null;
    }

    let client;
    try {
      console.log(uri)
      client = new MongoClient(uri || '');
      await client.connect();
    } catch (connErr) {
      console.error('MongoDB connection error:', connErr);
      return new Response(JSON.stringify({ error: 'MongoDB connection error', details: String(connErr) }), { status: 500 });
    }
    let db, collection;
    try {
      db = client.db(dbName);
      db = client.db(dbName || '');
      collection = db.collection('base_locations');
    } catch (dbInitErr) {
      console.error('MongoDB db/collection error:', dbInitErr);
      await client.close();
      return new Response(JSON.stringify({ error: 'MongoDB db/collection error', details: String(dbInitErr) }), { status: 500 });
    }

    const locationDoc = {
      image: imageBase64,
      xCoordinate: parseFloat(xCoordinate as string),
      yCoordinate: parseFloat(yCoordinate as string),
      name,
      building,
      latitude,
      longitude,
      status,
      createdAt: new Date()
    };

    try {
      await collection.insertOne(locationDoc);
    } catch (dbErr) {
      console.error('MongoDB insert error:', dbErr);
      await client.close();
      return new Response(JSON.stringify({ error: 'Database error', details: String(dbErr), doc: locationDoc }), { status: 500 });
    }
    await client.close();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500 });
  }
}
