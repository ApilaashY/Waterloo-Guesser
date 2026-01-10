import { GameType } from "../../types/GameType.js";

export interface QueueEntry {
  socket: any;
  modifier?: string;
}

export async function handleAddToQueue(
  queue: QueueEntry[],
  socket: any,
  gameRooms: { [key: string]: GameType },
  io: any,
  modifier?: string
) {
  // Normalize modifier (undefined and "" are treated as "normal")
  const normalizedModifier = modifier || "normal";

  // Find a user in queue with matching modifier preference
  const matchIndex = queue.findIndex(entry => {
    const entryModifier = entry.modifier || "normal";
    return entryModifier === normalizedModifier;
  });

  if (matchIndex !== -1) {
    // Found a match with same modifier
    const partnerEntry = queue.splice(matchIndex, 1)[0];
    const partnerSocket = partnerEntry.socket;
    const userId = socket.id;
    const partnerSessionId = partnerSocket.id;
    const sessionId = `${userId}-${partnerSessionId}`;

    // Determine if timed mode should be enabled
    const timedMode = normalizedModifier === "timed";

    console.log(
      `Matched users: ${userId} and ${partnerSessionId} in match ${sessionId} (modifier: ${normalizedModifier}, timedMode: ${timedMode})`
    );

    // Create a new game room for the matched users
    const newGame: GameType | undefined = await GameType.generateNewGame(
      sessionId,
      userId,
      partnerSessionId,
      timedMode
    );

    // Check if the new game was created successfully
    if (!newGame) {
      console.error("Failed to create a new game instance.");
      // Put the partner back in queue since match failed
      queue.push(partnerEntry);
      return;
    }

    // Add the new game to the gameRooms
    gameRooms[sessionId] = newGame;

    // Notify both users of the match
    socket.emit("queueMatched", {
      sessionId,
      partnerId: partnerSessionId,
      timedMode,
    });
    partnerSocket.emit("queueMatched", {
      sessionId,
      partnerId: userId,
      timedMode,
    });

    console.log(newGame);
    
    // Broadcast updated stats after match
    const inQueue = queue.length;
    const inMatch = Object.keys(gameRooms).length * 2;
    io.emit("playerStats", { inQueue, inMatch });
    console.log(`[STATS] Match created - Broadcasting: ${inQueue} in queue, ${inMatch} in match`);
  } else {
    // No match found with same modifier, add to queue and wait
    addToQueue(queue, socket, modifier);
  }
}

function addToQueue(queue: QueueEntry[], socket: any, modifier?: string) {
  // Add the user to the queue with their modifier preference
  queue.push({ socket, modifier });
  const normalizedModifier = modifier || "normal";
  console.log(`User added to queue with modifier: ${normalizedModifier}. Current queue length: ${queue.length}`);

  // Send back confirmation to the user
  socket.emit("queueJoined", { message: "You have joined the queue.", modifier: normalizedModifier });
}

