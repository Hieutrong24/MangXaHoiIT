// src/features/search/api/search.api.js
import { http } from "../../../services/http";

function getUserId() {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("uid") ||
    localStorage.getItem("currentUserId") ||
    JSON.parse(localStorage.getItem("user") || "null")?.id ||
    JSON.parse(localStorage.getItem("user") || "null")?._id ||
    ""
  );
}

export const searchApi = {
  async search(params = {}) {
    const userId = getUserId();
    const res = await http.get("/content/search", {
      params,
      headers: userId ? { "x-user-id": userId } : {},
    });
    return res.data;
  },
};
