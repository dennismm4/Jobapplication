// Date helpers. All dates are handled as local calendar dates (YYYY-MM-DD).

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso) {
  return new Date(`${iso}T00:00:00`);
}

export function daysFromToday(iso) {
  const ms = parseISODate(iso) - startOfToday();
  return Math.round(ms / 86400000);
}

export function formatDate(iso) {
  if (!iso) return 'Not stated';
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function relativePosted(iso) {
  const n = -daysFromToday(iso);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  return `${n} days ago`;
}

export function closingInfo(iso) {
  if (!iso) return { label: 'Closing date not stated', tone: 'muted' };
  const n = daysFromToday(iso);
  if (n < 0) return { label: 'Closed', tone: 'danger' };
  if (n === 0) return { label: 'Closes today', tone: 'danger' };
  if (n <= 7) return { label: `Closes in ${n} day${n === 1 ? '' : 's'}`, tone: 'warn' };
  return { label: `Closes in ${n} days`, tone: 'muted' };
}
