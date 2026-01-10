import { vi } from "vitest";

export const mockCollection = {
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

export const mockDb = {
  collection: vi.fn(() => mockCollection),
};

export const mockGetDb = vi.fn(() => Promise.resolve(mockDb));
