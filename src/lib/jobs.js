// Pure helpers for deduplicating, filtering and sorting jobs.

import { daysFromToday } from './dates.js';

const normalise = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Same title + employer + location = same job, whichever source it came from. */
export function dedupeKey(job) {
  return [job.tab, job.title, job.employer, job.location].map(normalise).join('|');
}

/**
 * Merges duplicate listings. The first (richest) entry is kept; other sources
 * are recorded in `alsoListedOn` so nothing is silently lost.
 */
export function dedupeJobs(jobs) {
  const byKey = new Map();
  for (const job of jobs) {
    const key = dedupeKey(job);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...job, alsoListedOn: [] });
    } else {
      existing.alsoListedOn.push({ source: job.source, url: job.url });
    }
  }
  return [...byKey.values()];
}

export function profileMatchScore(job, profile = {}) {
  const profileText = [profile.preferredRoles, profile.summary, profile.skills, profile.experience, profile.education, profile.achievements, profile.cvText].join(' ').toLowerCase();
  const terms = [...new Set(profileText.match(/[a-z0-9+#.]{3,}/g) || [])]
    .filter((term) => !'and the for with from your have this that will years experience role skills'.split(' ').includes(term));
  if (!terms.length) return 0;
  const jobText = [job.title, job.employer, job.location, job.summary, ...(job.description || []), ...(job.requirements || [])].join(' ').toLowerCase();
  return Math.round((terms.filter((term) => jobText.includes(term)).length / terms.length) * 100);
}

export const STATUSES = [
  { id: '', label: 'Not tracked' },
  { id: 'interested', label: 'Interested' },
  { id: 'preparing', label: 'Preparing application' },
  { id: 'applied', label: 'Applied' },
  { id: 'rejected', label: 'Rejected' },
];

export const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label ?? 'Not tracked';

export const POSTED_OPTIONS = [
  { id: 'any', label: 'Any time', maxDays: Infinity },
  { id: '1', label: 'Last 24 hours', maxDays: 1 },
  { id: '3', label: 'Last 3 days', maxDays: 3 },
  { id: '7', label: 'Last 7 days', maxDays: 7 },
  { id: '14', label: 'Last 14 days', maxDays: 14 },
];

export const VIEW_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'saved', label: 'Saved' },
  { id: 'dismissed', label: 'Dismissed' },
];

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'closing', label: 'Closing soonest' },
];

export const DEFAULT_FILTERS = {
  query: '',
  location: 'all',
  posted: 'any',
  view: 'active',
  status: 'all',
  sort: 'newest',
};

export function locationsFor(jobs) {
  return [...new Set(jobs.map((j) => j.location))].sort((a, b) => a.localeCompare(b));
}

export function applyFilters(jobs, filters, jobState) {
  const q = normalise(filters.query);
  const maxDays = POSTED_OPTIONS.find((o) => o.id === filters.posted)?.maxDays ?? Infinity;

  const filtered = jobs.filter((job) => {
    const st = jobState[job.id] ?? {};
    if (filters.view === 'active' && st.dismissed) return false;
    if (filters.view === 'saved' && (!st.saved || st.dismissed)) return false;
    if (filters.view === 'dismissed' && !st.dismissed) return false;
    if (q && !normalise(job.title).includes(q)) return false;
    if (filters.location !== 'all' && job.location !== filters.location) return false;
    if (-daysFromToday(job.postedDate) >= maxDays && maxDays !== Infinity) return false;
    if (filters.status !== 'all' && (st.status ?? '') !== filters.status) return false;
    return true;
  });

  const closingValue = (j) => (j.closingDate ? daysFromToday(j.closingDate) : Infinity);
  return filtered.sort((a, b) =>
    filters.sort === 'closing'
      ? closingValue(a) - closingValue(b)
      : b.postedDate.localeCompare(a.postedDate)
  );
}

export function isFiltered(filters) {
  return (
    filters.query !== '' ||
    filters.location !== 'all' ||
    filters.posted !== 'any' ||
    filters.status !== 'all'
  );
}
