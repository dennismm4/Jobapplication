import { applyFilters, isFiltered, locationsFor } from '../lib/jobs.js';
import { FilterSidebar, ResultsToolbar } from '../components/FilterBar.jsx';
import JobCard from '../components/JobCard.jsx';

export default function JobsPage({ tab, jobs, jobState, filters, setFilters, resetFilters, actions, maxPerTab }) {
  const visible = applyFilters(jobs, filters, jobState);
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
