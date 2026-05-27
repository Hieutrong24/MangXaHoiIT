const { userClient } = require("../clients/user.client");
const { authClient } = require("../clients/auth.client");
const { contentClient } = require("../clients/content.client");
const { codejudgeClient } = require("../clients/codejudge.client");
const { chatClient } = require("../clients/chat.client");
const { notificationClient } = require("../clients/notification.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader,
    user: req.user,
    userId: req.user?.id || req.user?.userId || null,
    xUserId: req.user?.id || req.user?.userId || null,
  };
}

const adminController = {
  async listUsers(req, res, next) {
    try {
      const data = await userClient.adminListUsers(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getUser(req, res, next) {
    try {
      const data = await userClient.adminGetUser(req.params.userId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async lockUser(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const [userData, authData] = await Promise.all([
        userClient.adminLockUser(req.params.userId, req.body || {}, ctx),
        authClient.adminLockAccount(req.params.userId, req.body || {}, ctx),
      ]);
      res.json({ success: true, data: { user: userData, auth: authData }, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async unlockUser(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const [userData, authData] = await Promise.all([
        userClient.adminUnlockUser(req.params.userId, req.body || {}, ctx),
        authClient.adminUnlockAccount(req.params.userId, req.body || {}, ctx),
      ]);
      res.json({ success: true, data: { user: userData, auth: authData }, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteUser(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const [userData, authData] = await Promise.all([
        userClient.adminDeleteUser(req.params.userId, req.body || {}, ctx),
        authClient.adminDeleteAccount(req.params.userId, ctx),
      ]);
      res.json({ success: true, data: { user: userData, auth: authData }, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listUserActivityLogs(req, res, next) {
    try {
      const data = await userClient.adminListActivityLogs(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getUserActivityDashboard(req, res, next) {
    try {
      const data = await userClient.adminGetActivityDashboard(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listAuthAccounts(req, res, next) {
    try {
      const data = await authClient.adminListAccounts(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getAuthAccount(req, res, next) {
    try {
      const data = await authClient.adminGetAccount(req.params.userId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listAuthAuditLogs(req, res, next) {
    try {
      const data = await authClient.adminListAuditLogs(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async updateUserRoles(req, res, next) {
    try {
      const data = await authClient.adminUpdateRoles(req.params.userId, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listJobs(req, res, next) {
    try {
      const data = await contentClient.listJobs(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getJob(req, res, next) {
    try {
      const data = await contentClient.adminGetJob(req.params.jobId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async createJob(req, res, next) {
    try {
      const data = await contentClient.adminCreateJob(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async updateJob(req, res, next) {
    try {
      const data = await contentClient.adminUpdateJob(req.params.jobId, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteJob(req, res, next) {
    try {
      const data = await contentClient.adminDeleteJob(req.params.jobId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listJobApplications(req, res, next) {
    try {
      const data = await contentClient.adminListJobApplications({ ...req.query, jobId: req.params.jobId || req.query.jobId }, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async updateApplicationStatus(req, res, next) {
    try {
      const data = await contentClient.adminUpdateApplicationStatus(req.params.applicationId, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getJobsDashboard(req, res, next) {
    try {
      const data = await contentClient.adminGetJobsDashboard(ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getContentDashboard(req, res, next) {
    try {
      const data = await contentClient.adminGetContentDashboard(ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listContentPosts(req, res, next) {
    try {
      const data = await contentClient.adminListPosts(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async moderateContentPost(req, res, next) {
    try {
      const data = await contentClient.adminModeratePost(req.params.postId, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listContentComments(req, res, next) {
    try {
      const data = await contentClient.adminListComments(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteContentComment(req, res, next) {
    try {
      const data = await contentClient.adminDeleteComment(req.params.commentId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listContentGroups(req, res, next) {
    try {
      const data = await contentClient.adminListGroups(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getContentGroup(req, res, next) {
    try {
      const data = await contentClient.adminGetGroup(req.params.groupId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getContentGroupStats(req, res, next) {
    try {
      const data = await contentClient.adminGetGroupStats(req.params.groupId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteContentGroup(req, res, next) {
    try {
      const data = await contentClient.adminDeleteGroup(req.params.groupId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getChatDashboard(req, res, next) {
    try {
      const data = await chatClient.adminGetDashboard(ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listChatGroups(req, res, next) {
    try {
      const data = await chatClient.adminListGroups(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getChatGroup(req, res, next) {
    try {
      const data = await chatClient.adminGetGroup(req.params.chatId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listChatMessages(req, res, next) {
    try {
      const data = await chatClient.adminListMessages(req.params.chatId, req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteChatGroup(req, res, next) {
    try {
      const data = await chatClient.adminDeleteGroup(req.params.chatId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteChatMessage(req, res, next) {
    try {
      const data = await chatClient.adminDeleteMessage(req.params.messageId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listAdminNotifications(req, res, next) {
    try {
      const data = await notificationClient.adminList(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async broadcastNotification(req, res, next) {
    try {
      const data = await notificationClient.adminBroadcast(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getNotificationsDashboard(req, res, next) {
    try {
      const data = await notificationClient.adminGetDashboard(ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listProblems(req, res, next) {
    try {
      const data = await codejudgeClient.listProblems(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getProblem(req, res, next) {
    try {
      const data = await codejudgeClient.getProblemById(req.params.problemId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async createProblem(req, res, next) {
    try {
      const data = await codejudgeClient.adminCreateProblem(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async updateProblem(req, res, next) {
    try {
      const data = await codejudgeClient.adminUpdateProblem(req.params.problemId, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteProblem(req, res, next) {
    try {
      const data = await codejudgeClient.adminDeleteProblem(req.params.problemId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getProblemOverview(req, res, next) {
    try {
      const data = await codejudgeClient.getProblemOverview(req.params.problemId, req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listTestCases(req, res, next) {
    try {
      const data = await codejudgeClient.listTestCasesByProblem(req.params.problemId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async createTestCase(req, res, next) {
    try {
      const data = await codejudgeClient.adminCreateTestCase({ ...req.body, problemId: req.params.problemId || req.body.problemId }, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async updateTestCase(req, res, next) {
    try {
      const data = await codejudgeClient.adminUpdateTestCase(req.params.testCaseId, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async deleteTestCase(req, res, next) {
    try {
      const data = await codejudgeClient.adminDeleteTestCase(req.params.testCaseId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listSubmissions(req, res, next) {
    try {
      const data = await codejudgeClient.adminListSubmissions(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getSubmission(req, res, next) {
    try {
      const data = await codejudgeClient.getSubmissionById(req.params.submissionId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getSubmissionResult(req, res, next) {
    try {
      const data = await codejudgeClient.getSubmissionResult(req.params.submissionId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async rejudgeSubmission(req, res, next) {
    try {
      const data = await codejudgeClient.adminRejudgeSubmission(req.params.submissionId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async cancelSubmission(req, res, next) {
    try {
      const data = await codejudgeClient.adminCancelSubmission(req.params.submissionId, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async getLearningDashboard(req, res, next) {
    try {
      const data = await codejudgeClient.adminGetLearningDashboard(ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listLearningPaths(req, res, next) {
    try {
      const data = await codejudgeClient.adminListLearningPaths(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listLearningLessons(req, res, next) {
    try {
      const data = await codejudgeClient.adminListLessons(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listLearningQuizzes(req, res, next) {
    try {
      const data = await codejudgeClient.adminListQuizzes(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listLearningChallenges(req, res, next) {
    try {
      const data = await codejudgeClient.adminListChallenges(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listLearningBadges(req, res, next) {
    try {
      const data = await codejudgeClient.adminListBadges(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
};

module.exports = { adminController };
