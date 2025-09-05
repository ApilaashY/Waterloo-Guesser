export function handleAddToQueue(queue: any[], socket: any) {
  // Check if there's another user in the queue to match with
  if (queue.length >= 1) {
    const partnerSocket = queue.shift(); // Remove the first user from the queue
    if (partnerSocket) {
      const sessionId = socket.id; // Use socket ID as session ID for simplicity
      const partnerSessionId = partnerSocket.id;
      const matchId = `${sessionId}-${partnerSessionId}`; // Simple match ID

      // Notify both users of the match
      socket.emit("queueMatched", {
        sessionId,
        partnerId: partnerSessionId,
        matchId,
      });
      partnerSocket.emit("queueMatched", {
        sessionId: partnerSessionId,
        partnerId: sessionId,
        matchId,
      });

      console.log(
        `Matched users: ${sessionId} and ${partnerSessionId} in match ${matchId}`
      );
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
