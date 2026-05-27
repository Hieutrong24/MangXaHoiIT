export const NOTIFICATION_SOUND_KEY = 'ui.notifications.sound.enabled';

const SOUND_SOURCES = {
  message: '/sounds/message.wav',
  notification: '/sounds/notification.wav',
  call: '/sounds/call-ringtone.wav',
};

const VOLUMES = {
  message: 0.55,
  notification: 0.5,
  call: 0.75,
};

let unlocked = false;
let unlockBound = false;
let callAudio = null;

function isBrowser() {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

function normalizeEnabled(value, fallback = true) {
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  return fallback;
}

export function readNotificationSoundEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    return normalizeEnabled(window.localStorage.getItem(NOTIFICATION_SOUND_KEY), true);
  } catch {
    return true;
  }
}

export function writeNotificationSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NOTIFICATION_SOUND_KEY, String(!!enabled));
    window.dispatchEvent(
      new CustomEvent('social:notification-sound:changed', {
        detail: { enabled: !!enabled },
      })
    );
    if (!enabled) stopIncomingCallRingtone();
  } catch {
    // localStorage can be blocked in private or embedded browser contexts.
  }
}

export function syncNotificationSoundPreference(notifyPrefs = {}) {
  if (!notifyPrefs || typeof notifyPrefs !== 'object') return;
  if (Object.prototype.hasOwnProperty.call(notifyPrefs, 'sound')) {
    writeNotificationSoundEnabled(normalizeEnabled(notifyPrefs.sound));
  }
}

function makeAudio(type) {
  if (!isBrowser()) return null;
  const audio = new Audio(SOUND_SOURCES[type] || SOUND_SOURCES.notification);
  audio.preload = 'auto';
  audio.volume = VOLUMES[type] ?? 0.5;
  return audio;
}

function unlockAudio() {
  if (unlocked || !isBrowser()) return;

  const audio = makeAudio('notification');
  if (!audio) return;

  audio.muted = true;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      unlocked = true;
    })
    .catch(() => {
      unlocked = false;
    });
}

export function bindNotificationSoundUnlock() {
  if (!isBrowser() || unlockBound) return () => undefined;
  unlockBound = true;

  const onFirstGesture = () => {
    unlockAudio();
  };

  window.addEventListener('pointerdown', onFirstGesture, { passive: true });
  window.addEventListener('keydown', onFirstGesture);

  return () => {
    unlockBound = false;
    window.removeEventListener('pointerdown', onFirstGesture);
    window.removeEventListener('keydown', onFirstGesture);
  };
}

export async function playNotificationSound(type = 'notification') {
  if (!readNotificationSoundEnabled() || !isBrowser()) return;

  try {
    const audio = makeAudio(type);
    if (!audio) return;
    audio.currentTime = 0;
    await audio.play();
  } catch {
    // Browsers can still block playback before the first trusted gesture.
  }
}

export function startIncomingCallRingtone() {
  if (!readNotificationSoundEnabled() || !isBrowser()) return;

  try {
    if (!callAudio) {
      callAudio = makeAudio('call');
      if (!callAudio) return;
      callAudio.loop = true;
    }

    callAudio.currentTime = 0;
    callAudio.play().catch(() => {
      // Browsers can still block playback before the first trusted gesture.
    });
  } catch {
    // Ignore transient media errors; the call UI remains the source of truth.
  }
}

export function stopIncomingCallRingtone() {
  if (!callAudio) return;

  try {
    callAudio.pause();
    callAudio.currentTime = 0;
  } catch {
    // Ignore transient media errors while cleaning up a ringtone.
  }
}
