export function safeReadStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  if (typeof window === 'undefined') return '';

  const storedUser = safeReadStoredUser();
  return (
    window.localStorage.getItem('userId') ||
    window.localStorage.getItem('uid') ||
    window.localStorage.getItem('currentUserId') ||
    storedUser?.userId ||
    storedUser?.id ||
    storedUser?._id ||
    ''
  );
}

export function getCurrentUser() {
  return safeReadStoredUser();
}
