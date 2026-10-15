import { useCallback, useEffect, useMemo, useState } from 'react';
import { TABS, buildSampleJobs } from './data/sampleJobs.js';
import { DEFAULT_FILTERS, dedupeJobs } from './lib/jobs.js';
import { clearJobState, loadJobState, saveJobState } from './lib/storage.js';
import { navigate, href, useHashRoute } from './lib/router.js';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Toast from './components/Toast.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobPage from './pages/JobPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';

export const MAX_PER_TAB = 5;

export default function App() {
  const route = useHashRoute();
  const allJobs = useMemo(() => dedupeJobs(buildSampleJobs()), []);
  const [filtersByTab, setFiltersByTab] = useState(() =>
    Object.fromEntries(TABS.map((t) => [t.id, { ...DEFAULT_FILTERS }]))
  );
  const [jobState, setJobState] = useState(loadJobState);
  const [toast, setToast] = useState(null);

  useEffect(() => saveJobState(jobState), [jobState]);
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
    if (!window.confirm('Clear all saved, dismissed, status and draft data stored in this browser?')) return;
    clearJobState();
    setJobState({});
  };

  let page;
  if (route.name === 'job') {
    const job = allJobs.find((j) => j.id === route.id);
    page = (
      <JobPage
        job={job}
        state={job ? jobState[job.id] ?? {} : {}}
        actions={actions}
        onDismissed={(j) => navigate(href.tab(j.tab))}
      />
    );
  } else if (route.name === 'applications') {
    page = <ApplicationsPage jobs={trackedJobs} jobState={jobState} actions={actions} />;
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
      <SiteHeader tabs={TABS} active={activeSection} counts={counts} trackedCount={trackedJobs.length} />
      <div className="container">
        <div className="sample-banner" role="note">
          <strong>Sample data.</strong> All listings, employers and links on this site are fictional and exist only
          to demonstrate the layout. Real job search starts in Stage 2.
        </div>
      </div>
      <main id="main" tabIndex={-1} className="site-main">{page}</main>
      <SiteFooter onReset={resetAll} />
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
