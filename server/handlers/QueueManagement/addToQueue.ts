import { GameType } from "../../types/GameType.js";

export async function handleAddToQueue(
  queue: any[],
  socket: any,
  gameRooms: { [key: string]: GameType }
) {
  // Check if there's another user in the queue to match with
  if (queue.length >= 1) {
    const partnerSocket = queue.shift(); // Remove the first user from the queue
    if (partnerSocket) {
      const userId = socket.id; // Use socket ID as session ID for simplicity
      const partnerSessionId = partnerSocket.id;
      const sessionId = `${userId}-${partnerSessionId}`; // Simple match ID

      console.log(
        `Matched users: ${sessionId} and ${partnerSessionId} in match ${sessionId}`
      );

      // Create a new game room for the matched users
      const newGame: GameType | undefined = await GameType.generateNewGame(
        sessionId,
        userId,
        partnerSessionId
      );

      // Check if the new game was created successfully
      if (!newGame) {
        console.error("Failed to create a new game instance.");
        return;
      }

      // Add the new game to the gameRooms
      gameRooms[sessionId] = newGame;

      // Notify both users of the match
      socket.emit("queueMatched", {
        sessionId,
        partnerId: partnerSessionId,
      });
      partnerSocket.emit("queueMatched", {
        sessionId,
        partnerId: userId,
      });

      console.log(newGame);
    } else {
      addToQueue(queue, socket); // Add the user to the queue if no partner found
    }
  } else {
    addToQueue(queue, socket); // Add the user to the queue if no match found
  }
}

function addToQueue(queue: any[], socket: any) {
  // Add the user to the queue
  queue.push(socket);
  console.log(`User added to queue. Current queue length: ${queue.length}`);

  // Send back confirmation to the user
  socket.emit("queueJoined", { message: "You have joined the queue." });
}
