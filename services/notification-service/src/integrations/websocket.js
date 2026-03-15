let io = null;

module.exports = {
  setServer(server) {
    io = server;
  },
  emitToUser(userId, eventName, payload) {
    if (!io) return;
    io.to(`user:${userId}`).emit(eventName, payload);
  },
};
