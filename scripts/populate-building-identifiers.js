/**
 * Migration script to populate buildingIdentifier field for existing locations
 * This script should be run once to update all existing records in the database
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  console.error('Missing MongoDB environment variables');
  process.exit(1);
}

async function populateBuildingIdentifiers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection('base_locations');
    
    // Find all locations that don't have buildingIdentifier field
    const locationsWithoutIdentifier = await collection.find({
      buildingIdentifier: { $exists: false }
    }).toArray();
    
    console.log(`Found ${locationsWithoutIdentifier.length} locations without buildingIdentifier`);
    
    if (locationsWithoutIdentifier.length === 0) {
      console.log('All locations already have buildingIdentifier field');
      return;
    }
    
    // Group locations by building
    const locationsByBuilding = {};
    locationsWithoutIdentifier.forEach(location => {
      const building = location.building;
      if (!locationsByBuilding[building]) {
        locationsByBuilding[building] = [];
      }
      locationsByBuilding[building].push(location);
    });
    
    console.log('Buildings to process:', Object.keys(locationsByBuilding));
    
    // Process each building
    for (const building of Object.keys(locationsByBuilding)) {
      console.log(`\nProcessing building: ${building}`);
      
      // Find existing locations with buildingIdentifier for this building to get the current max number
      const existingWithIdentifier = await collection
        .find({ 
          building: building,
          buildingIdentifier: { $regex: `^${building} \\d+$` }
        })
        .sort({ buildingIdentifier: -1 })
        .toArray();
      
      let startNumber = 1;
      if (existingWithIdentifier.length > 0) {
        const lastIdentifier = existingWithIdentifier[0].buildingIdentifier;
        const match = lastIdentifier.match(/(\d+)$/);
        if (match) {
          startNumber = parseInt(match[1]) + 1;
        }
      }
      
      console.log(`Starting numbering from: ${building} ${startNumber}`);
      
      const locations = locationsByBuilding[building];
      
      // Sort locations by creation date to maintain consistency
      locations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Update each location with the new buildingIdentifier
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const identifier = `${building} ${startNumber + i}`;
        
        await collection.updateOne(
          { _id: location._id },
          { $set: { buildingIdentifier: identifier } }
        );
        
        console.log(`Updated ${location._id}: ${identifier}`);
      }
      
      console.log(`Completed ${building}: ${locations.length} locations updated`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify the results
    const totalLocations = await collection.countDocuments({});
    const locationsWithIdentifier = await collection.countDocuments({
      buildingIdentifier: { $exists: true }
    });
    
    console.log(`\nVerification:`);
    console.log(`Total locations: ${totalLocations}`);
    console.log(`Locations with buildingIdentifier: ${locationsWithIdentifier}`);
    
    if (totalLocations === locationsWithIdentifier) {
      console.log('✅ All locations now have buildingIdentifier field');
    } else {
      console.log('⚠️  Some locations still missing buildingIdentifier field');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the migration
console.log('Starting buildingIdentifier migration...');
populateBuildingIdentifiers();
