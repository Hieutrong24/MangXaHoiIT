const asyncHandler = require('../../common/utils/asyncHandler');
const preferenceService = require('./preference.service');

exports.getPreferences = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const preferences = await preferenceService.getPreferences(userId);
  res.json(preferences);
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] || req.body.userId;
  const updated = await preferenceService.updatePreferences(userId, req.body);
  res.json(updated);
});
