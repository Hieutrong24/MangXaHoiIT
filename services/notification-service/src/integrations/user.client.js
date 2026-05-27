module.exports = {
  async getUserById(userId) {
    return {
      id: userId,
      fullName: `Người dùng ${String(userId || '').slice(0, 8) || 'TDMU'}`,
      email: null,
      avatarUrl: null,
    };
  },
};
