export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function createMatchId(sessionId1: string, sessionId2: string): string {
  return [sessionId1, sessionId2].sort().join('_');
}

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function calculatePoints(distance: number, threshold: number = 0.1, maxPoints: number = 1000): number {
  const isValid = distance <= threshold;
  return isValid ? Math.floor(maxPoints * (1 - distance / threshold)) : 0;
}
