import { http } from "../../../services/http";
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;
export const jobsApi = {
  list(params = {}) { return http.get('/content/jobs', { params }).then(unwrap); },
};
