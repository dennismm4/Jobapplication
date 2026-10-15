import { POSTED_OPTIONS, SORT_OPTIONS, STATUSES, VIEW_OPTIONS } from '../lib/jobs.js';

/** Left-hand sidebar: search and narrowing filters. */
export function FilterSidebar({ filters, locations, onChange, onReset, canReset }) {
  return (
    <form className="filter-panel" role="search" aria-label="Filter jobs" onSubmit={(e) => e.preventDefault()}>
      <div className="filter-panel__head">
        <h2>Filter jobs</h2>
        {canReset && (
          <button type="button" className="link-btn" onClick={onReset}>Clear all</button>
        )}
      </div>

      <label className="field">
        <span className="field__label">Job title</span>
        <input
          type="search"
          placeholder="e.g. programme, marketing"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field__label">Location</span>
        <select value={filters.location} onChange={(e) => onChange({ location: e.target.value })}>
          <option value="all">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>

      <fieldset className="field">
        <legend className="field__label">Date posted</legend>
        <div className="radio-list">
          {POSTED_OPTIONS.map((o) => (
            <label key={o.id} className="radio">
              <input
                type="radio"
                name="posted"
                value={o.id}
                checked={filters.posted === o.id}
                onChange={() => onChange({ posted: o.id })}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span className="field__label">Application status</span>
        <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })}>
          <option value="all">Any status</option>
          {STATUSES.map((s) => (
            <option key={s.id || 'none'} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>
    </form>
  );
}

/** Bar above the results: Active / Saved / Dismissed view, result count and sort. */
export function ResultsToolbar({ filters, onChange, shown, total, note }) {
  return (
    <div className="results-toolbar">
      <div className="segmented" role="group" aria-label="Show">
        {VIEW_OPTIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`segmented__btn ${filters.view === v.id ? 'is-on' : ''}`}
            aria-pressed={filters.view === v.id}
            onClick={() => onChange({ view: v.id })}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="results-toolbar__count" aria-live="polite">
        Showing <strong>{shown}</strong> of {total} job{total === 1 ? '' : 's'}
        {note && <span className="muted"> · {note}</span>}
      </p>
      <label className="results-toolbar__sort">
        <span className="field__label">Sort by</span>
        <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
