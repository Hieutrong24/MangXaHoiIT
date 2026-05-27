class PresenceService {
  constructor() {
    this.userSockets = new Map();
    this.lastSeenAt = new Map();
  }

  markOnline(userId, socketId) {
    const key = String(userId);
    const socketKey = String(socketId);
    const sockets = this.userSockets.get(key) || new Set();
    const wasOnline = sockets.size > 0;
    sockets.add(socketKey);
    this.userSockets.set(key, sockets);

    return {
      userId: key,
      online: true,
      socketCount: sockets.size,
      changed: !wasOnline,
      lastSeenAt: this.lastSeenAt.get(key) || null,
    };
  }

  markOffline(userId, socketId) {
    const key = String(userId);
    const socketKey = String(socketId);
    const sockets = this.userSockets.get(key);
    if (!sockets) {
      return {
        userId: key,
        online: false,
        socketCount: 0,
        changed: false,
        lastSeenAt: this.lastSeenAt.get(key) || null,
      };
    }

    sockets.delete(socketKey);
    if (sockets.size > 0) {
      this.userSockets.set(key, sockets);
      return {
        userId: key,
        online: true,
        socketCount: sockets.size,
        changed: false,
        lastSeenAt: this.lastSeenAt.get(key) || null,
      };
    }

    this.userSockets.delete(key);
    const lastSeenAt = new Date();
    this.lastSeenAt.set(key, lastSeenAt);

    return {
      userId: key,
      online: false,
      socketCount: 0,
      changed: true,
      lastSeenAt,
    };
  }

  isOnline(userId) {
    const sockets = this.userSockets.get(String(userId));
    return !!sockets && sockets.size > 0;
  }

  getPresence(userId) {
    const key = String(userId);
    return {
      userId: key,
      online: this.isOnline(key),
      lastSeenAt: this.lastSeenAt.get(key) || null,
      socketCount: (this.userSockets.get(key) || new Set()).size,
    };
  }

  getMany(userIds = []) {
    return userIds.map((userId) => this.getPresence(userId));
  }
}

module.exports = new PresenceService();
