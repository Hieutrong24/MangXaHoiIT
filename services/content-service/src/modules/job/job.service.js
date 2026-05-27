function createJobService({ jobRepository }) {
  return {
    async listJobs(query) {
      return jobRepository.list(query);
    },
    async getJob(id, viewerId = null) {
      const job = await jobRepository.getById(id);
      if (!job) return null;
      if (!viewerId) return job;
      const myApplications = await jobRepository.listApplications({ jobId: id, applicantId: String(viewerId), page: 1, pageSize: 10 });
      return { ...job, myApplication: myApplications.items[0] || null };
    },
    async createJob(payload) {
      if (!payload.title || !payload.title.trim()) throw new Error("title required");
      if (!payload.company || !payload.company.trim()) throw new Error("company required");
      return jobRepository.create(payload);
    },
    async updateJob(id, payload) {
      const job = await jobRepository.update(id, payload);
      if (!job) throw new Error("job not found");
      return job;
    },
    async deleteJob(id) {
      const job = await jobRepository.remove(id);
      if (!job) throw new Error("job not found");
      return { ok: true, jobId: id };
    },
    async applyToJob(jobId, payload) {
      if (!payload.applicantId) throw new Error("applicantId required");
      if (!payload.fullName || !payload.email) throw new Error("fullName and email required");
      if (!payload.cvUrl) throw new Error("cvUrl required");
      const job = await jobRepository.getById(jobId);
      if (!job) throw new Error("job not found");
      return jobRepository.createApplication(jobId, payload);
    },
    async listApplicationsForJob(jobId, actorId, query) {
      const job = await jobRepository.getById(jobId);
      if (!job) throw new Error("job not found");
      if (String(job.postedBy) !== String(actorId) && String(actorId) !== "system") throw new Error("forbidden");
      return jobRepository.listApplications({ ...query, jobId });
    },
    async listMyApplications(applicantId, query) {
      if (!applicantId) throw new Error("applicantId required");
      return jobRepository.listApplications({ ...query, applicantId });
    },
    async updateApplicationStatus(applicationId, actorId, status) {
      const application = await jobRepository.getApplicationById(applicationId);
      if (!application) throw new Error("application not found");
      const job = await jobRepository.getById(application.jobId);
      if (!job) throw new Error("job not found");
      if (String(job.postedBy) !== String(actorId) && String(actorId) !== "system") throw new Error("forbidden");
      const updated = await jobRepository.updateApplication(applicationId, { status });
      return updated;
    },
    async listApplicationsAdmin(query = {}) {
      return jobRepository.listApplications(query);
    },
    async dashboardAdmin() {
      return jobRepository.getDashboard();
    },
  };
}

module.exports = { createJobService };
