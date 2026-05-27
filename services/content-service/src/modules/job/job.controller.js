function createJobController({ jobService }) {
  return {
    async list(req, res) {
      try {
        const data = await jobService.listJobs(req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_JOBS_FAILED" });
      }
    },
    async getById(req, res) {
      try {
        const data = await jobService.getJob(req.params.id, req.headers["x-user-id"] || null);
        if (!data) return res.status(404).json({ error: "NOT_FOUND" });
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "GET_JOB_FAILED" });
      }
    },
    async create(req, res) {
      try {
        const data = await jobService.createJob({ ...req.body, postedBy: req.headers["x-user-id"] || req.body.postedBy || "system" });
        res.status(201).json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "CREATE_JOB_FAILED" });
      }
    },
    async update(req, res) {
      try {
        const data = await jobService.updateJob(req.params.id, req.body);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "UPDATE_JOB_FAILED" });
      }
    },
    async remove(req, res) {
      try {
        const data = await jobService.deleteJob(req.params.id);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "DELETE_JOB_FAILED" });
      }
    },
    async apply(req, res) {
      try {
        const applicantId = req.headers["x-user-id"] || req.body.applicantId;
        const data = await jobService.applyToJob(req.params.id, { ...req.body, applicantId });
        res.status(201).json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "APPLY_JOB_FAILED" });
      }
    },
    async listApplicationsForJob(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.query.actorId;
        const data = await jobService.listApplicationsForJob(req.params.id, actorId, req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_JOB_APPLICATIONS_FAILED" });
      }
    },
    async listMyApplications(req, res) {
      try {
        const applicantId = req.headers["x-user-id"] || req.query.applicantId;
        const data = await jobService.listMyApplications(applicantId, req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_MY_JOB_APPLICATIONS_FAILED" });
      }
    },
    async updateApplicationStatus(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await jobService.updateApplicationStatus(req.params.applicationId, actorId, req.body.status);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "UPDATE_JOB_APPLICATION_STATUS_FAILED" });
      }
    },
    async adminListApplications(req, res) {
      try {
        const data = await jobService.listApplicationsAdmin(req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_LIST_APPLICATIONS_FAILED" });
      }
    },
    async adminDashboard(req, res) {
      try {
        const data = await jobService.dashboardAdmin();
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_JOB_DASHBOARD_FAILED" });
      }
    },
  };
}

module.exports = { createJobController };
