import { TABS } from '../data/sampleJobs.js';
import { STATUSES } from '../lib/jobs.js';
import { closingInfo, formatDate } from '../lib/dates.js';
import { href } from '../lib/router.js';

const approvedCount = (drafts = {}) => Object.values(drafts).filter((d) => d?.approved).length;

export default function ApplicationsPage({ jobs, jobState, actions }) {
  const byStatus = STATUSES.filter((s) => s.id).map((s) => ({
    ...s,
    count: jobs.filter((j) => jobState[j.id]?.status === s.id).length,
  }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Tracker</p>
          <h1>My applications</h1>
          <p className="page-hero__lede">Every job you have saved or given a status, across both categories.</p>
          <ul className="status-summary">
            {byStatus.map((s) => (
              <li key={s.id} className={`status-summary__item s-${s.id}`}>
                <span className="status-summary__n">{s.count}</span>
                {s.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container">
        {jobs.length === 0 ? (
          <div className="empty">
            <h2>Nothing tracked yet</h2>
            <p>Save a job or set its status and it will appear here.</p>
            <a className="btn btn--primary" href={href.tab(TABS[0].id)}>Browse jobs</a>
          </div>
        ) : (
          <div className="table-wrap table-wrap--page">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th scope="col">Job</th>
                  <th scope="col">Category</th>
                  <th scope="col">Closing date</th>
                  <th scope="col">Drafts approved</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const st = jobState[job.id] ?? {};
                  const closing = closingInfo(job.closingDate);
                  return (
                    <tr key={job.id}>
                      <td>
                        <a href={href.job(job.id)} className="tracker-table__title">{job.title}</a>
                        <div className="muted">{job.employer} · {job.location}</div>
                      </td>
                      <td>{TABS.find((t) => t.id === job.tab)?.label}</td>
                      <td className={`tone-${closing.tone}`}>{job.closingDate ? formatDate(job.closingDate) : 'Not stated'}</td>
                      <td>{approvedCount(st.drafts)}</td>
                      <td>
                        <label className="visually-hidden" htmlFor={`status-${job.id}-table`}>Status for {job.title}</label>
                        <select
                          id={`status-${job.id}-table`}
                          className="table-select"
                          value={st.status ?? ''}
                          data-status={st.status || 'none'}
                          onChange={(e) => actions.setStatus(job, e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s.id || 'none'} value={s.id}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="tracker-table__actions">
                        <a className="btn btn--secondary btn--sm" href={href.job(job.id)}>Open</a>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => actions.update(job.id, { saved: false, status: '' })}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
