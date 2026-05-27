import { http } from '../../../services/http';

export const jobsAdminApi = {
  async list(params) {
    const res = await http.get('/admin/jobs', { params });
    return res.data;
  },
  async get(jobId) {
    const res = await http.get(`/admin/jobs/${encodeURIComponent(jobId)}`);
    return res.data;
  },
  async create(body) {
    const res = await http.post('/admin/jobs', body);
    return res.data;
  },
  async update(jobId, body) {
    const res = await http.patch(`/admin/jobs/${encodeURIComponent(jobId)}`, body);
    return res.data;
  },
  async remove(jobId) {
    const res = await http.delete(`/admin/jobs/${encodeURIComponent(jobId)}`);
    return res.data;
  },
  async applications(params) {
    const res = await http.get('/admin/job-applications', { params });
    return res.data;
  },
  async applicationsByJob(jobId, params) {
    const res = await http.get(`/admin/jobs/${encodeURIComponent(jobId)}/applications`, { params });
    return res.data;
  },
  async updateApplicationStatus(applicationId, body) {
    const res = await http.patch(`/admin/job-applications/${encodeURIComponent(applicationId)}/status`, body);
    return res.data;
  },
  async dashboard() {
    const res = await http.get('/admin/jobs/dashboard');
    return res.data;
  },
};
