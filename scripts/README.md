# Building Identifier Migration

This directory contains a migration script to populate the `buildingIdentifier` field for existing location records in the database.

## What it does

The script `populate-building-identifiers.js` will:

1. Find all locations in the `base_locations` collection that don't have a `buildingIdentifier` field
2. Group them by building name
3. For each building, check what's the highest existing number (if any)
4. Assign incremented numbers to each location in that building
5. Update the database records with the new `buildingIdentifier` field

## Before running

Make sure your `.env` file contains the correct MongoDB connection details:
```
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=your_database_name
```

## How to run

### Option 1: Using npm script (recommended)
```bash
npm run migrate:building-identifiers
```

### Option 2: Running directly with Node.js
```bash
node scripts/populate-building-identifiers.js
```

## Example output

```
Starting buildingIdentifier migration...
Connected to MongoDB
Found 25 locations without buildingIdentifier
Buildings to process: [ 'SLC', 'QNC', 'MC', 'DC' ]

Processing building: SLC
Starting numbering from: SLC 1
Updated 64a1f2e8b5c9d1e2f3a4b5c6: SLC 1
Updated 64a1f2e8b5c9d1e2f3a4b5c7: SLC 2
Updated 64a1f2e8b5c9d1e2f3a4b5c8: SLC 3
Completed SLC: 3 locations updated

Processing building: QNC
Starting numbering from: QNC 1
Updated 64a1f2e8b5c9d1e2f3a4b5c9: QNC 1
Updated 64a1f2e8b5c9d1e2f3a4b5ca: QNC 2
Completed QNC: 2 locations updated

✅ Migration completed successfully!

Verification:
Total locations: 25
Locations with buildingIdentifier: 25
✅ All locations now have buildingIdentifier field
Database connection closed
```

## Important notes

- **Run this script only once** - it's designed for migrating existing data
- The script respects existing `buildingIdentifier` values and continues numbering from there
- Locations are numbered based on their creation date (oldest first)
- The script includes verification to ensure all records were updated correctly
- If the script fails partway through, you can safely run it again - it will only process records that still need the field

## Rollback

If you need to remove the `buildingIdentifier` field from all records, you can run this MongoDB command:

```javascript
db.base_locations.updateMany(
  {},
  { $unset: { buildingIdentifier: "" } }
)
```

## Schema update

After running this migration, all new locations uploaded through the `/api/uploadLocation` endpoint will automatically get a `buildingIdentifier` field populated with the correct incremented number.
