import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "./Logo";
import React from "react";

// Use a mock for animationComplete as it's required
describe("Logo Component", () => {
  it("renders the logo image", () => {
    render(<Logo animationComplete={true} />);
    // Check if the logo image is present by its alt text
    const logoImg = screen.getByAltText(/UW Guesser Logo/i);
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute(
      "src",
      "/UWguesser-logo-beige-spokeless.png"
    );
  });

  it("renders spokes", () => {
    render(<Logo animationComplete={true} />);
    // There are 6 spokes in the Logo component
    const spokes = screen.getAllByAltText(/Spoke/i);
    expect(spokes).toHaveLength(6);
  });
});
