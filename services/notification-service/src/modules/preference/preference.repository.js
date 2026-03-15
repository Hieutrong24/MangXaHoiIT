const Preference = require('./preference.model');

class PreferenceRepository {
  async getOrCreateDefault(userId) {
    let doc = await Preference.findOne({ userId });
    if (!doc) {
      doc = await Preference.create({ userId });
    }
    return doc;
  }

  async update(userId, payload) {
    return Preference.findOneAndUpdate({ userId }, { $set: payload }, { upsert: true, new: true });
  }
}

module.exports = new PreferenceRepository();
