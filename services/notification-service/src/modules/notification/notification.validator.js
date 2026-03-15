const AppError = require('../../common/errors/AppError');

function validateCreateNotification(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload notification không hợp lệ', 400);
  }

  const required = ['recipientId', 'type', 'title', 'body'];
  for (const field of required) {
    if (!payload[field]) {
      throw new AppError(`Thiếu trường bắt buộc: ${field}`, 400);
    }
  }
}

module.exports = {
  validateCreateNotification,
};
