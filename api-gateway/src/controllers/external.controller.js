// src/controllers/external.controller.js
const svc = require("../clients/external.client"); // hoặc ../services/external.client

exports.itNews = async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const q = String(req.query.q || "");
    const items = await svc.itNews({ limit, q });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

exports.itJobs = async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const q = String(req.query.q || "software");
    const items = await svc.itJobs({ limit, q });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};