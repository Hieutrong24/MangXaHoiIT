import { http } from "../../../services/http";

export const aiApi = {
  async getSuggestion() {
    const res = await http.post("/ai/suggestion");
    return res.data?.data || res.data;
  }
};