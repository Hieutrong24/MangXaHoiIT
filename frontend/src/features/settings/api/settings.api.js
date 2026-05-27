import { http } from "../../../services/http";

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res;
}

export const settingsApi = {
  async get() {
    return unwrap(await http.get("/users/settings"));
  },
  async update(payload) {
    return unwrap(await http.put("/users/settings", payload));
  },
};
