module.exports = function createUserLoggedInHandler({ notificationService }) {
  return async function handleUserLoggedIn(message) {
    const payload = message?.data || message;

    const userId = payload.userId;
    const email = payload.email;
    const occurredAt = payload.occurredAt || new Date().toISOString();

    if (!userId) {
      console.warn("[notification-service] auth.user_logged_in missing userId");
      return;
    }

    await notificationService.createInAppNotification({
      userId,
      type: "auth.user_logged_in",
      title: "Đăng nhập thành công",
      content: `Tài khoản ${email || userId} đã đăng nhập lúc ${occurredAt}`,
      metadata: payload,
    });

    console.log("[notification-service] handled auth.user_logged_in", {
      userId,
      email,
    });
  };
};