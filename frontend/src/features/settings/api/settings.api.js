// src/features/settings/api/settings.api.js
import { http } from "../../../services/http";

export const settingsApi = {
  async update(payload) {
    const res = await http.put("/users/settings", payload);
    return res.data;
  },
};
