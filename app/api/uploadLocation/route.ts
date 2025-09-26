import { NextRequest } from 'next/server';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { getDb } from '../../../lib/mongodb';

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

    let imageUrl = null;
    try {
      // Upload image to Cloudinary CDN
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Missing Cloudinary env variables');
      }
      if (imageFile instanceof Blob) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64 = buffer.toString('base64');
        const timestamp = Math.floor(Date.now() / 1000);
        // Generate signature
        const paramsToSign = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', `data:image/png;base64,${base64}`);
        formData.append('timestamp', String(timestamp));
        formData.append('api_key', apiKey);
        formData.append('signature', signature);
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.secure_url;
      }
    } catch (cloudErr) {
      console.error('Cloudinary upload error:', cloudErr);
      imageUrl = null;
    }
    // Save to MongoDB
    let db, collection;
    try {
      db = await getDb();
      collection = db.collection('base_locations');
    } catch (dbInitErr) {
      console.error('MongoDB db/collection error:', dbInitErr);
      return new Response(JSON.stringify({ error: 'MongoDB db/collection error', details: String(dbInitErr) }), { status: 500 });
    }

    // Generate incremented building identifier
    let buildingIdentifier = '';
    try {
      // Find the highest number for this building
      const existingLocations = await collection
        .find({ 
          building: building,
          buildingIdentifier: { $regex: `^${building} \\d+$` }
        })
        .sort({ buildingIdentifier: -1 })
        .limit(1)
        .toArray();
      
      let nextNumber = 1;
      if (existingLocations.length > 0) {
        const lastIdentifier = existingLocations[0].buildingIdentifier;
        // Extract the number from the identifier (e.g., "SLC 5" -> 5)
        const match = lastIdentifier.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      buildingIdentifier = `${building} ${nextNumber}`;
      console.log(`Generated building identifier: ${buildingIdentifier}`);
    } catch (identifierErr) {
      console.error('Error generating building identifier:', identifierErr);
      // Fallback to building name + timestamp if identifier generation fails
      buildingIdentifier = `${building} ${Date.now()}`;
    }

    const locationDoc = {
      image: imageUrl,
      xCoordinate: parseFloat(xCoordinate as string),
      yCoordinate: parseFloat(yCoordinate as string),
      name,
      building,
      buildingIdentifier,
      latitude,
      longitude,
      status,
      createdAt: new Date()
    };

    try {
      await collection.insertOne(locationDoc);
    } catch (dbErr) {
      console.error('MongoDB insert error:', dbErr);
      return new Response(JSON.stringify({ error: 'Database error', details: String(dbErr), doc: locationDoc }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500 });
  }
}
