module.exports = {
  async send(payload) {
    console.log('[push] send', payload);
    return true;
  },
};
