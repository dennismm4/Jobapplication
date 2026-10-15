import { useCallback, useEffect, useMemo, useState } from 'react';
import { TABS, buildSampleJobs } from './data/sampleJobs.js';
import { DEFAULT_FILTERS, dedupeJobs } from './lib/jobs.js';
import { clearJobState, loadJobState, saveJobState, loadProfile, saveProfile, EMPTY_PROFILE } from './lib/storage.js';
import { navigate, href, useHashRoute } from './lib/router.js';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Toast from './components/Toast.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobPage from './pages/JobPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export const MAX_PER_TAB = 5;

export default function App() {
  const route = useHashRoute();
  const [dailyBatch, setDailyBatch] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [feedError, setFeedError] = useState('');
  const refreshJobs = useCallback(async () => {
    setRefreshing(true);
    try {
      const url = new URL('jobs.json', window.location.href.split('#')[0]);
      url.searchParams.set('refresh', String(Date.now()));
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Job feed returned ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.jobs)) throw new Error('Job feed has no jobs array');
      if (!payload.generatedAt) { setDailyBatch(null); return false; }
      setDailyBatch(payload.jobs);
      setLastRefresh(payload.generatedAt || new Date().toISOString());
      setFeedError('');
      return true;
    } catch {
      setFeedError('Could not load the published job feed. Showing sample listings until the feed is available.');
      return false;
    } finally { setRefreshing(false); }
  }, []);
  useEffect(() => { refreshJobs(); }, [refreshJobs]);
  const allJobs = useMemo(() => dedupeJobs(dailyBatch === null ? buildSampleJobs() : dailyBatch), [dailyBatch]);
  const usingLiveJobs = dailyBatch !== null;
  const [filtersByTab, setFiltersByTab] = useState(() =>
    Object.fromEntries(TABS.map((t) => [t.id, { ...DEFAULT_FILTERS }]))
  );
  const [jobState, setJobState] = useState(loadJobState);
  const [profile, setProfile] = useState(loadProfile);
  const [toast, setToast] = useState(null);

  useEffect(() => saveJobState(jobState), [jobState]);
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => window.scrollTo(0, 0), [route.key]);

  // Each tab shows at most MAX_PER_TAB jobs from the daily batch.
  const tabJobs = useMemo(() => {
    const map = {};
    for (const t of TABS) map[t.id] = allJobs.filter((j) => j.tab === t.id).slice(0, MAX_PER_TAB);
    return map;
  }, [allJobs]);

  const counts = Object.fromEntries(
    TABS.map((t) => [t.id, tabJobs[t.id].filter((j) => !jobState[j.id]?.dismissed).length])
  );
  const trackedJobs = allJobs.filter((j) => {
    const s = jobState[j.id];
    return s && !s.dismissed && (s.saved || s.status);
  });

  const closeToast = useCallback(() => setToast(null), []);
  const updateJob = useCallback((id, patch) => {
    setJobState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const actions = {
    toggleSave: (job) => {
      const saved = !jobState[job.id]?.saved;
      updateJob(job.id, { saved, ...(saved ? { dismissed: false } : {}) });
    },
    // Tracking a status implies the job is saved.
    setStatus: (job, status) =>
      updateJob(job.id, { status, ...(status ? { saved: true, dismissed: false } : {}) }),
    dismiss: (job) => {
      updateJob(job.id, { dismissed: true });
      setToast({ message: `Dismissed “${job.title}”`, undo: () => updateJob(job.id, { dismissed: false }) });
    },
    restore: (job) => updateJob(job.id, { dismissed: false }),
    update: updateJob,
  };

  const resetAll = () => {
    if (!window.confirm('Clear your profile, saved jobs, dismissed jobs, statuses and application drafts stored in this browser?')) return;
    clearJobState();
    setJobState({});
    setProfile({ ...EMPTY_PROFILE });
  };

  let page;
  if (route.name === 'job') {
    const job = allJobs.find((j) => j.id === route.id);
    page = (
      <JobPage
        job={job}
        state={job ? jobState[job.id] ?? {} : {}}
        profile={profile}
        actions={actions}
        onDismissed={(j) => navigate(href.tab(j.tab))}
      />
    );
  } else if (route.name === 'applications') {
    page = <ApplicationsPage jobs={trackedJobs} jobState={jobState} actions={actions} />;
  } else if (route.name === 'profile') {
    page = <ProfilePage profile={profile} onChange={setProfile} />;
  } else {
    page = (
      <JobsPage
        tab={TABS.find((t) => t.id === route.tab)}
        jobs={tabJobs[route.tab]}
        jobState={jobState}
        filters={filtersByTab[route.tab]}
        setFilters={(patch) =>
          setFiltersByTab((prev) => ({ ...prev, [route.tab]: { ...prev[route.tab], ...patch } }))
        }
        resetFilters={() =>
          setFiltersByTab((prev) => ({ ...prev, [route.tab]: { ...DEFAULT_FILTERS, view: prev[route.tab].view, sort: prev[route.tab].sort } }))
        }
        actions={actions}
        maxPerTab={MAX_PER_TAB}
        onRefresh={refreshJobs}
        refreshing={refreshing}
        lastRefresh={lastRefresh}
        feedError={feedError}
      />
    );
  }

  const activeSection =
    route.name === 'job'
      ? allJobs.find((j) => j.id === route.id)?.tab
      : route.name === 'applications'
        ? 'applications'
        : route.tab;

  return (
    <div className="site">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to content
      </a>
      <SiteHeader tabs={TABS} active={route.name === 'profile' ? 'profile' : activeSection} counts={counts} trackedCount={trackedJobs.length} />
      <div className="container">
        <div className="sample-banner" role="note">
          {usingLiveJobs ? <><strong>Daily search results.</strong> Listings came from configured job feeds. Confirm details with the employer before applying.</>
            : <><strong>Sample data.</strong> Listings are fictional examples. Configure job-feed keys and the daily workflow to replace them with live results.</>}
        </div>
      </div>
      <main id="main" tabIndex={-1} className="site-main">{page}</main>
      <SiteFooter onReset={resetAll} />
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
