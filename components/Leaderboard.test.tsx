import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Leaderboard from "./Leaderboard";
import "@testing-library/jest-dom";
import React from "react";

// Mock fetch
global.fetch = vi.fn();

describe("Leaderboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // Return pending promises to keep it in loading state
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<Leaderboard />);
    // Check for spinner or loading indicator logic
    // The component has a spinner div with specific classes
    const spinners = document.getElementsByClassName("animate-spin");
    expect(spinners.length).toBeGreaterThan(0);
  });

  it("renders leaderboard data after fetch", async () => {
    const mockFacultyData = [{ department: "Engineering", totalPoints: 1000 }];
    const mockUserData = {
      success: true,
      leaderboard: [{ username: "Player1", totalPoints: 500, gamesPlayed: 2 }],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/leaderboard/faculty")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockFacultyData),
        });
      }
      if (url.includes("/api/leaderboard/users")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockUserData),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<Leaderboard />);

    await waitFor(() => {
      // Engineering appears in faculty list and as selected faculty label
      const engineeringElements = screen.getAllByText("Engineering");
      expect(engineeringElements.length).toBeGreaterThan(0);

      expect(screen.getByText("Player1")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
    });
  });

  it("renders empty state when no users found", async () => {
    const mockFacultyData: any[] = [];
    const mockUserData = {
      success: true,
      leaderboard: [],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/leaderboard/faculty")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockFacultyData),
        });
      }
      if (url.includes("/api/leaderboard/users")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockUserData),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText("No scores yet")).toBeInTheDocument();
    });
  });
});
