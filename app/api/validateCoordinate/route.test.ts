import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Mock the mongodb library
vi.mock("../../../lib/mongodb");

describe("API: validateCoordinate", () => {
  const mockCollection = {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  };

  const mockDb = {
    collection: vi.fn(() => mockCollection),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDb).mockResolvedValue(mockDb as any);
  });

  it("should return 400 if xCoor or yCoor are missing", async () => {
    const req = new NextRequest("http://localhost/api/validateCoordinate", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required fields");
  });

  it("should calculate points and distance correctly with provided correct coordinates", async () => {
    const req = new NextRequest("http://localhost/api/validateCoordinate", {
      method: "POST",
      body: JSON.stringify({
        xCoor: 100,
        yCoor: 100,
        correctX: 100,
        correctY: 100,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.points).toBe(1000); // Max points for 0 distance
    expect(data.distance).toBe(0);
  });

  it("should calculate points and distance correctly with database lookup", async () => {
    const locationId = new ObjectId().toString();
    mockCollection.findOne.mockResolvedValueOnce({
      _id: new ObjectId(locationId),
      xCoordinate: 200,
      yCoordinate: 200,
    });

    const req = new NextRequest("http://localhost/api/validateCoordinate", {
      method: "POST",
      body: JSON.stringify({
        xCoor: 100,
        yCoor: 100,
        id: locationId,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.distance).toBeGreaterThan(0);
    expect(data.points).toBeDefined();
    expect(mockCollection.findOne).toHaveBeenCalledWith({
      _id: expect.any(Object), // check if ObjectId wrapper works
    });
  });

  it("should update user points if userId is provided", async () => {
    const userId = new ObjectId().toString();
    const locationId = new ObjectId().toString();

    // Mock location find
    mockCollection.findOne.mockResolvedValueOnce({
      _id: new ObjectId(locationId),
      xCoordinate: 100,
      yCoordinate: 100,
    });

    // Mock user find
    mockCollection.findOne.mockResolvedValueOnce({
      _id: new ObjectId(userId),
      totalPoints: 500,
    });

    const req = new NextRequest("http://localhost/api/validateCoordinate", {
      method: "POST",
      body: JSON.stringify({
        xCoor: 100,
        yCoor: 100,
        id: locationId,
        userId: userId,
      }),
    });

    await POST(req);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      { $set: { totalPoints: 1500 } } // 500 + 1000 new points
    );
  });
});
