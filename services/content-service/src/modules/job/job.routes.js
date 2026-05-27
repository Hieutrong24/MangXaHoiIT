const express = require("express");

function buildJobRoutes({ jobController }) {
  const router = express.Router();
  router.get("/", jobController.list);
  router.get("/applications/me", jobController.listMyApplications);
  router.get("/admin/applications", jobController.adminListApplications);
  router.get("/admin/dashboard", jobController.adminDashboard);
  router.post("/", jobController.create);
  router.patch("/applications/:applicationId", jobController.updateApplicationStatus);
  router.get("/:id/applications", jobController.listApplicationsForJob);
  router.post("/:id/apply", jobController.apply);
  router.get("/:id", jobController.getById);
  router.patch("/:id", jobController.update);
  router.delete("/:id", jobController.remove);
  return router;
}

module.exports = { buildJobRoutes };
