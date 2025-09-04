import { ValidationBody } from '../types/image';
import { ImageState } from '../types/image';

export interface ValidationResult {
  xCoor: number;
  yCoor: number;
  points: number;
}

export class CoordinateService {
  private static instance: CoordinateService;
  private validatingCoordinate: boolean = false;

  public static getInstance(): CoordinateService {
    if (!CoordinateService.instance) {
      CoordinateService.instance = new CoordinateService();
    }
    return CoordinateService.instance;
  }

  public isValidating(): boolean {
    return this.validatingCoordinate;
  }

  public async validateCoordinate(
    xCoor: number | null,
    yCoor: number | null,
    imageId?: string,
    correctCoords?: { xRightCoor: number | null; yRightCoor: number | null }
  ): Promise<ValidationResult> {
    if (this.validatingCoordinate) {
      throw new Error('Validation already in progress');
    }

    this.validatingCoordinate = true;

    try {
      // Use provided correct coordinates if available
      const correctX = correctCoords?.xRightCoor ?? null;
      const correctY = correctCoords?.yRightCoor ?? null;

      const body: ValidationBody = {
        xCoor: xCoor,
        yCoor: yCoor,
        id: imageId,
      };

      if (correctX != null && correctY != null) {
        body.correctX = correctX;
        body.correctY = correctY;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_LINK}/api/validateCoordinate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      this.validatingCoordinate = false;
      return json as ValidationResult;
    } catch (error) {
      this.validatingCoordinate = false;
      throw error;
    }
  }

  public static calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static calculatePoints(distance: number, maxDistance: number = 1): number {
    // Points calculation: closer guesses get more points
    const normalizedDistance = distance / maxDistance;
    const points = Math.max(0, Math.round(1000 * (1 - normalizedDistance)));
    return points;
  }

  public static isValidCoordinate(x: number | null, y: number | null): boolean {
    return x !== null && y !== null && x >= 0 && x <= 1 && y >= 0 && y <= 1;
  }
}
