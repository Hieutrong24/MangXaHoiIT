const preferenceRepository = require('./preference.repository');
const { CHANNELS } = require('../../config/constants');

class PreferenceService {
  async getPreferences(userId) {
    return preferenceRepository.getOrCreateDefault(userId);
  }

  async updatePreferences(userId, payload) {
    return preferenceRepository.update(userId, payload);
  }

  resolveChannels(preferences, type, preferredChannels = []) {
    if (preferences.mutedTypes?.includes(type)) return [];

    const typeSetting = preferences.typeSettings?.[type] || {};
    const all = [
      { key: CHANNELS.IN_APP, enabled: preferences.inAppEnabled, typeEnabled: typeSetting.inapp },
      { key: CHANNELS.REALTIME, enabled: preferences.realtimeEnabled, typeEnabled: typeSetting.realtime },
      { key: CHANNELS.EMAIL, enabled: preferences.emailEnabled, typeEnabled: typeSetting.email },
      { key: CHANNELS.PUSH, enabled: preferences.pushEnabled, typeEnabled: typeSetting.push },
    ];

    const active = all
      .filter((item) => item.typeEnabled !== false && item.enabled !== false)
      .map((item) => item.key);

    if (!preferredChannels.length) return active;
    return preferredChannels.filter((channel) => active.includes(channel));
  }
}

module.exports = new PreferenceService();
