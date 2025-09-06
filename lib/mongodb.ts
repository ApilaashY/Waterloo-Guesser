import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "";

if (!uri || !dbName) {
  throw new Error("Missing MongoDB env variables");
}

// Use globalThis to persist client across hot reloads in dev (Next.js best practice)
let globalWithMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
};

export async function getDb(): Promise<Db> {
  if (globalWithMongo._mongoDb && globalWithMongo._mongoClient) {
    return globalWithMongo._mongoDb;
  }
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
    await globalWithMongo._mongoClient.connect();
  }
  globalWithMongo._mongoDb = globalWithMongo._mongoClient.db(dbName);
  return globalWithMongo._mongoDb;
}
