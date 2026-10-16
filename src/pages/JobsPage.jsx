import { applyFilters, isFiltered, locationsFor, profileMatchScore } from '../lib/jobs.js';
import { FilterSidebar, ResultsToolbar } from '../components/FilterBar.jsx';
import JobCard from '../components/JobCard.jsx';
import { JOB_SOURCES } from '../data/jobSources.js';

export default function JobsPage({ tab, jobs, jobState, filters, setFilters, resetFilters, actions, maxPerTab, onRefresh, refreshing, lastRefresh, feedError, profile }) {
  const visible = applyFilters(jobs, filters, jobState);
  if (tab.id === 'uk-visa' && profile?.cvText) visible.sort((a, b) => {
    const nhs = (job) => /\bNHS\b|National Health Service/i.test(`${job.title} ${job.employer}`) ? 1 : 0;
    return nhs(b) - nhs(a) || profileMatchScore(b, profile) - profileMatchScore(a, profile) || b.postedDate.localeCompare(a.postedDate);
  });
  const locations = locationsFor(jobs);
  const shortOfMax = jobs.length < maxPerTab;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Today’s shortlist</p>
          <h1>{tab.label}</h1>
          <p className="page-hero__lede">
            {tab.blurb} Up to {maxPerTab} new jobs are added each day
            {shortOfMax ? '; fewer appear when there are not enough relevant listings.' : '.'}
          </p>
        </div>
      </section>

      <div className="container layout-with-sidebar">
        <aside className="layout-sidebar">
          <FilterSidebar
            filters={filters}
            locations={locations}
            onChange={setFilters}
            onReset={resetFilters}
            canReset={isFiltered(filters)}
          />
        </aside>

        <section className="layout-content" aria-label={`${tab.label} results`}>
          <div className="feed-refresh">
            <button type="button" className="btn btn--secondary btn--sm" onClick={onRefresh} disabled={refreshing}>{refreshing ? 'Checking feed…' : 'Refresh jobs'}</button>
            <span className="muted">{lastRefresh ? `Feed updated ${new Date(lastRefresh).toLocaleString()}` : 'Daily feed refresh is scheduled in GitHub Actions.'}</span>
          </div>
          {feedError && <p role="status" className="feed-error">{feedError}</p>}
          {JOB_SOURCES[tab.id] && <section className="source-links" aria-label="Other job websites">
            <h2>Search these job websites</h2>
            <ul>{JOB_SOURCES[tab.id].map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a><span>{source.note}</span></li>)}</ul>
          </section>}
          {tab.id === 'uk-visa' && profile?.cvText && <p className="callout callout--info">UK jobs are ranked using keywords from your CV, with NHS roles kept first. This is a relevance hint, not an eligibility or sponsorship decision.</p>}
          <ResultsToolbar
            filters={filters}
            onChange={setFilters}
            shown={visible.length}
            total={jobs.length}
            note={shortOfMax ? `fewer than ${maxPerTab} relevant listings today` : null}
          />

          {visible.length === 0 ? (
            <div className="empty">
              <h2>No jobs here</h2>
              <p>
                {filters.view === 'saved'
                  ? 'You have not saved any jobs in this category yet.'
                  : filters.view === 'dismissed'
                    ? 'Nothing dismissed in this category.'
                    : 'No jobs match these filters.'}
              </p>
              {isFiltered(filters) && (
                <button type="button" className="btn btn--secondary" onClick={resetFilters}>Clear filters</button>
              )}
            </div>
          ) : (
            <ul className="job-list">
              {visible.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} state={jobState[job.id] ?? {}} actions={actions} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
