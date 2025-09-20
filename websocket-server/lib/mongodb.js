import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "";

if (!uri || !dbName) {
  throw new Error("Missing MongoDB environment variables: MONGODB_URI and MONGODB_DB must be set");
}

let globalWithMongo = globalThis;

export async function getDb() {
  if (globalWithMongo._mongoDb && globalWithMongo._mongoClient) {
    return globalWithMongo._mongoDb;
  }
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
    await globalWithMongo._mongoClient.connect();
    console.log("Connected to MongoDB");
  }
  globalWithMongo._mongoDb = globalWithMongo._mongoClient.db(dbName);
  return globalWithMongo._mongoDb;
}
