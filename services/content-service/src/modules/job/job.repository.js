const { loadJobs, saveJobs, loadJobApplications, saveJobApplications, randomObjectId } = require("../../storage/fileStore");

function paginate(items, { page = 1, pageSize = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));
  const total = items.length;
  return {
    items: items.slice((safePage - 1) * safePageSize, safePage * safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
  };
}

function createJobRepository() {
  return {
    driver: "file",
    async list(query = {}) {
      let items = loadJobs().filter((x) => x.isActive !== false).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      if (query.keyword) {
        const k = String(query.keyword).trim().toLowerCase();
        items = items.filter((j) => [j.title, j.company, j.location, j.description, ...(j.skills || []), ...(j.tags || [])].join(" ").toLowerCase().includes(k));
      }
      if (query.location) items = items.filter((j) => j.location.toLowerCase().includes(String(query.location).toLowerCase()));
      if (query.level) items = items.filter((j) => j.level === String(query.level).toLowerCase());
      return paginate(items, query);
    },
    async getById(id) {
      return loadJobs().find((x) => String(x._id) === String(id)) || null;
    },
    async create(data) {
      const jobs = loadJobs();
      const now = new Date().toISOString();
      const job = {
        _id: randomObjectId(),
        title: String(data.title || "Vị trí IT").trim(),
        company: String(data.company || "Công ty công nghệ").trim(),
        companyLogoUrl: String(data.companyLogoUrl || "").trim(),
        location: String(data.location || "Hồ Chí Minh").trim(),
        employmentType: String(data.employmentType || "full-time").trim().toLowerCase(),
        level: String(data.level || "junior").trim().toLowerCase(),
        salaryRange: String(data.salaryRange || "Thoả thuận").trim(),
        description: String(data.description || "").trim(),
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.map(String) : [],
        requirements: Array.isArray(data.requirements) ? data.requirements.map(String) : [],
        benefits: Array.isArray(data.benefits) ? data.benefits.map(String) : [],
        skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
        applyUrl: String(data.applyUrl || "").trim(),
        source: String(data.source || "manual").trim().toLowerCase(),
        recruiterName: String(data.recruiterName || "Nhà tuyển dụng").trim(),
        recruiterEmail: String(data.recruiterEmail || "").trim(),
        postedBy: String(data.postedBy || "system").trim(),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        isActive: data.isActive !== false,
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      };
      jobs.unshift(job);
      saveJobs(jobs);
      return job;
    },
    async update(id, patch) {
      const jobs = loadJobs();
      const job = jobs.find((x) => String(x._id) === String(id));
      if (!job) return null;
      Object.assign(job, patch, { updatedAt: new Date().toISOString() });
      saveJobs(jobs);
      return job;
    },
    async remove(id) {
      const jobs = loadJobs();
      const idx = jobs.findIndex((x) => String(x._id) === String(id));
      if (idx < 0) return null;
      const [removed] = jobs.splice(idx, 1);
      saveJobs(jobs);
      return removed;
    },
    async createApplication(jobId, data) {
      const apps = loadJobApplications();
      const existing = apps.find((x) => String(x.jobId) === String(jobId) && String(x.applicantId) === String(data.applicantId));
      if (existing) {
        Object.assign(existing, {
          fullName: String(data.fullName || existing.fullName || "").trim(),
          email: String(data.email || existing.email || "").trim(),
          phone: String(data.phone || existing.phone || "").trim(),
          coverLetter: String(data.coverLetter || existing.coverLetter || "").trim(),
          cvUrl: String(data.cvUrl || existing.cvUrl || "").trim(),
          cvName: String(data.cvName || existing.cvName || "").trim(),
          portfolioUrl: String(data.portfolioUrl || existing.portfolioUrl || "").trim(),
          updatedAt: new Date().toISOString(),
          status: existing.status || "submitted",
        });
        saveJobApplications(apps);
        return existing;
      }
      const now = new Date().toISOString();
      const application = {
        _id: randomObjectId(),
        jobId: String(jobId),
        applicantId: String(data.applicantId),
        fullName: String(data.fullName || "").trim(),
        email: String(data.email || "").trim(),
        phone: String(data.phone || "").trim(),
        coverLetter: String(data.coverLetter || "").trim(),
        cvUrl: String(data.cvUrl || "").trim(),
        cvName: String(data.cvName || "").trim(),
        portfolioUrl: String(data.portfolioUrl || "").trim(),
        status: "submitted",
        createdAt: now,
        updatedAt: now,
      };
      apps.unshift(application);
      saveJobApplications(apps);
      return application;
    },
    async listApplications(query = {}) {
      let items = loadJobApplications().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (query.jobId) items = items.filter((x) => String(x.jobId) === String(query.jobId));
      if (query.applicantId) items = items.filter((x) => String(x.applicantId) === String(query.applicantId));
      if (query.status) items = items.filter((x) => String(x.status) === String(query.status));
      const jobs = loadJobs();
      items = items.map((app) => ({ ...app, job: jobs.find((x) => String(x._id) === String(app.jobId)) || null }));
      return paginate(items, query);
    },
    async getApplicationById(id) {
      return loadJobApplications().find((x) => String(x._id) === String(id)) || null;
    },
    async updateApplication(id, patch) {
      const apps = loadJobApplications();
      const app = apps.find((x) => String(x._id) === String(id));
      if (!app) return null;
      Object.assign(app, patch, { updatedAt: new Date().toISOString() });
      saveJobApplications(apps);
      return app;
    },
    async getDashboard() {
      const jobs = loadJobs();
      const apps = loadJobApplications();
      const statusCounts = apps.reduce((acc, item) => {
        const key = String(item.status || 'submitted');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const applicationsByJob = apps.reduce((acc, item) => {
        const key = String(item.jobId);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const topJobs = jobs.map((job) => ({ ...job, applicationCount: applicationsByJob[String(job._id)] || 0 }))
        .sort((a, b) => b.applicationCount - a.applicationCount)
        .slice(0, 10);
      return {
        totals: {
          jobs: jobs.length,
          activeJobs: jobs.filter((x) => x.isActive !== false).length,
          applications: apps.length,
        },
        applicationStatusCounts: statusCounts,
        topJobs,
        recentApplications: apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
      };
    },
  };
}

module.exports = { createJobRepository };
