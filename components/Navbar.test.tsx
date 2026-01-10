import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";
import "@testing-library/jest-dom";
import React from "react";

// Mock imports
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

// Mock SessionProvider
const mockUseSession = vi.fn();
vi.mock("./SessionProvider", () => ({
  useSession: () => mockUseSession(),
}));

describe("Navbar Component", () => {
  it("renders login button when unauthenticated", () => {
    mockUseSession.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(<Navbar />);
    const loginButtons = screen.getAllByText(/Log in/i);
    expect(loginButtons.length).toBeGreaterThan(0);
    expect(loginButtons[0]).toBeInTheDocument();
  });

  it("renders user greeting when authenticated", () => {
    mockUseSession.mockReturnValue({
      user: { username: "Test User" },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(<Navbar />);
    const greetings = screen.getAllByText(/Welcome, Test User/i);
    expect(greetings.length).toBeGreaterThan(0);
    expect(greetings[0]).toBeInTheDocument();
  });

  it("toggles mobile menu", () => {
    mockUseSession.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(<Navbar />);

    // Find open menu button (hamburger)
    const openMenuBtn = screen.getByRole("button", { name: /Open main menu/i });
    fireEvent.click(openMenuBtn);

    // Check if menu content is visible/translated
    // Note: Since we can't easily check CSS transitions in jsdom, we check if the element exists and has appropriate classes
    // or checks for the close button which appears in the menu
    const closeMenuBtn = screen.getByRole("button", { name: /Close menu/i });
    expect(closeMenuBtn).toBeInTheDocument();
  });
});
