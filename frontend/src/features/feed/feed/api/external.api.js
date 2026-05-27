import { http } from "../../../services/http";

export const externalApi = {
  async itJobs(params = {}) {
 
    const res = await http.get("/external/it-jobs", { params });
    return res.data; // { items: [...] }
  },
};