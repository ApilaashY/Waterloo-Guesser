import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Mock the mongodb library
vi.mock("../../../lib/mongodb");

describe("API: submitMatch", () => {
  const mockCollection = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn(),
    countDocuments: vi.fn(),
    deleteMany: vi.fn(),
  };

  const mockDb = {
    collection: vi.fn(() => mockCollection),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDb).mockResolvedValue(mockDb as any);
  });

  const validMatchData = {
    mode: "singlePlayer",
    totalScore: 5000,
    rounds: [
      {
        round: 1,
        userCoordinates: { x: 10, y: 10 },
        correctCoordinates: { x: 10, y: 10 },
        distance: 0,
        points: 5000,
      },
    ],
    completedAt: new Date().toISOString(),
  };

  it("should return 400 if required fields are missing", async () => {
    const req = new NextRequest("http://localhost/api/submitMatch", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("should successfully submit a match for a guest (no playerId)", async () => {
    mockCollection.insertOne.mockResolvedValueOnce({
      insertedId: new ObjectId(),
    });

    const req = new NextRequest("http://localhost/api/submitMatch", {
      method: "POST",
      body: JSON.stringify(validMatchData),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
    // Should NOT call updateOne on users collection
    expect(mockCollection.updateOne).not.toHaveBeenCalled();
  });

  it("should submit match and update stats for a logged-in user", async () => {
    const userId = new ObjectId().toString();
    const matchDataWithUser = { ...validMatchData, playerId: userId };

    mockCollection.insertOne.mockResolvedValueOnce({
      insertedId: new ObjectId(),
    });
    // User lookup mock
    mockCollection.findOne.mockResolvedValueOnce({
      _id: new ObjectId(userId),
      totalPoints: 1000,
      stats: {
        gamesPlayed: 5,
        bestScore: 4000,
      },
    });

    const req = new NextRequest("http://localhost/api/submitMatch", {
      method: "POST",
      body: JSON.stringify(matchDataWithUser),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    // Check if user stats were updated
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      expect.objectContaining({
        $set: expect.objectContaining({
          totalPoints: 6000, // 1000 + 5000
          "stats.gamesPlayed": 6, // 5 + 1
          "stats.bestScore": 5000, // New high score
        }),
      })
    );
  });

  it("should reject invalid round data", async () => {
    const invalidData = {
      ...validMatchData,
      rounds: [{ round: "invalid" }], // Round should be a number
    };

    const req = new NextRequest("http://localhost/api/submitMatch", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid round data");
  });
});
