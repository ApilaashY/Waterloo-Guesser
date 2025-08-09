import { QueueItem, PlayerSession, GameState } from '../types/player.js';
import { Match } from '../types/match.js';
import { RoundData, RoundLock } from '../types/round.js';

export class GameStorage {
  public queue: QueueItem[] = [];
  public currentRounds = new Map<string, RoundData>();
  public activePlayers = new Map<string, QueueItem>();
  public activeMatches = new Map<string, Match>();
  public playerSessions = new Map<string, PlayerSession>();
  public roundLocks = new Map<string, RoundLock>();
  public gameStates = new Map<string, Record<string, GameState>>();

  // Queue management
  addToQueue(item: QueueItem): void {
    this.queue.push(item);
  }

  removeFromQueue(sessionId: string): boolean {
    const index = this.queue.findIndex(q => q.sessionId === sessionId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  findInQueue(predicate: (item: QueueItem) => boolean): QueueItem | undefined {
    return this.queue.find(predicate);
  }

  // Player management
  addActivePlayer(sessionId: string, player: QueueItem): void {
    this.activePlayers.set(sessionId, player);
  }

  getActivePlayer(sessionId: string): QueueItem | undefined {
    return this.activePlayers.get(sessionId);
  }

  removeActivePlayer(sessionId: string): boolean {
    return this.activePlayers.delete(sessionId);
  }

  // Match management
  addMatch(matchId: string, match: Match): void {
    this.activeMatches.set(matchId, match);
  }

  getMatch(matchId: string): Match | undefined {
    return this.activeMatches.get(matchId);
  }

  // Session management
  addPlayerSession(sessionId: string, session: PlayerSession): void {
    this.playerSessions.set(sessionId, session);
  }

  getPlayerSession(sessionId: string): PlayerSession | undefined {
    return this.playerSessions.get(sessionId);
  }

  // Round management
  addCurrentRound(matchId: string, roundData: RoundData): void {
    this.currentRounds.set(matchId, roundData);
  }

  getCurrentRound(matchId: string): RoundData | undefined {
    return this.currentRounds.get(matchId);
  }

  removeCurrentRound(matchId: string): boolean {
    return this.currentRounds.delete(matchId);
  }

  // Round lock management
  addRoundLock(roundId: string, lock: RoundLock): void {
    this.roundLocks.set(roundId, lock);
  }

  getRoundLock(roundId: string): RoundLock | undefined {
    return this.roundLocks.get(roundId);
  }

  removeRoundLock(roundId: string): boolean {
    return this.roundLocks.delete(roundId);
  }

  // Game state management
  updateGameState(matchId: string, sessionId: string, state: GameState): void {
    let gameState = this.gameStates.get(matchId) || {};
    gameState[sessionId] = state;
    this.gameStates.set(matchId, gameState);
  }

  getGameState(matchId: string): Record<string, GameState> | undefined {
    return this.gameStates.get(matchId);
  }

  removeGameState(matchId: string): boolean {
    return this.gameStates.delete(matchId);
  }
}

export const gameStorage = new GameStorage();
