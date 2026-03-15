module.exports = {
  async getUserById(userId) {
    return {
      id: userId,
      fullName: 'TDMU Student',
      email: 'student@example.com',
    };
  },
};
