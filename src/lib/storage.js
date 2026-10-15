// Per-job state (saved, dismissed, status, drafts) kept in this browser only.
// Nothing here is sent anywhere. Stage 2 moves this into a private database.

const KEY = 'jobdesk.v1.jobState';

export function loadJobState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveJobState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The app keeps working in memory.
  }
}

export function clearJobState() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
