import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import GameMap from "./GameMap";

// Mock the child Map component to avoid complex rendering
vi.mock("./Map", () => ({
  default: vi.fn(() => <div data-testid="mock-map">Map Component</div>),
}));

describe("GameMap Component", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(
      <GameMap xCoor={0} yCoor={0} xRightCoor={0} yRightCoor={0} />
    );
    expect(getByTestId("mock-map")).toBeInTheDocument();
  });

  it("attaches and removes event listeners", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <GameMap xCoor={0} yCoor={0} xRightCoor={0} yRightCoor={0} />
    );

    // Check if critical event listeners support gameplay
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    unmount();

    // Check cleanup
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });
});
