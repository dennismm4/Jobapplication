import { TABS } from '../data/sampleJobs.js';
import { closingInfo, formatDate } from '../lib/dates.js';
import { href } from '../lib/router.js';
import JobActions from '../components/JobActions.jsx';
import SponsorshipBadge from '../components/SponsorshipBadge.jsx';
import ApplicationHelper from '../components/ApplicationHelper.jsx';
import { Icon } from '../components/Icon.jsx';

export default function JobPage({ job, state, actions, onDismissed }) {
  if (!job) {
    return (
      <div className="container narrow">
        <div className="empty">
          <h1>Job not found</h1>
          <p>This job is not in today’s list. It may have been replaced by a newer listing.</p>
          <a className="btn btn--primary" href={href.tab(TABS[0].id)}>Back to jobs</a>
        </div>
      </div>
    );
  }

  const tab = TABS.find((t) => t.id === job.tab);
  const closing = closingInfo(job.closingDate);

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href={href.tab(job.tab)}>{tab.label}</a></li>
          <li aria-current="page">{job.title}</li>
        </ol>
      </nav>

      <div className="job-page">
        <article className="job-page__main">
          <header className="job-page__head">
            <div className="job-card__badges">
              {job.isSample && <span className="badge badge--sample">Sample data</span>}
              <SponsorshipBadge sponsorship={job.sponsorship} />
            </div>
            <h1>{job.title}</h1>
            <p className="job-page__employer">{job.employer} · {job.location}</p>
            <p className="job-page__summary">{job.summary}</p>
          </header>

          <section className="content-section" aria-labelledby="sec-desc">
            <h2 id="sec-desc">Job description</h2>
            {job.description.map((p, i) => <p key={i}>{p}</p>)}
            {job.requirements.length > 0 && (
              <>
                <h3>What the listing asks for</h3>
                <ul className="bullets">
                  {job.requirements.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </>
            )}
          </section>

          <section className="content-section" aria-labelledby="sec-match">
            <h2 id="sec-match">Why it matches your profile</h2>
            <div className="callout callout--info">
              <Icon name="alert" />
              <div>
                <strong>Profile matching is not active yet.</strong> Your CV and preferences have not been added, so
                this section cannot say how you match. Once they are added, each point here will cite a specific line
                from your profile next to the listing requirement it meets.
              </div>
            </div>
            {job.listingSignals.length > 0 && (
              <>
                <h3>Signals from the listing (used for matching later)</h3>
                <ul className="chips">
                  {job.listingSignals.map((s) => <li key={s} className="chip">{s}</li>)}
                </ul>
              </>
            )}
          </section>

          {job.tab === 'uk-visa' && (
            <section className="content-section" aria-labelledby="sec-visa">
              <h2 id="sec-visa">Visa sponsorship evidence</h2>
              {job.sponsorship ? (
                <>
                  <div className={`callout ${job.sponsorship.status === 'verified' ? 'callout--ok' : 'callout--warn'}`}>
                    <Icon name={job.sponsorship.status === 'verified' ? 'shield' : 'alert'} />
                    <div>
                      <strong>{job.sponsorship.status === 'verified' ? 'Stated in listing' : 'Unverified'}</strong>
                      {' — '}
                      {job.sponsorship.summary}
                    </div>
                  </div>
                  <ul className="evidence">
                    {job.sponsorship.evidence.map((e, i) => (
                      <li key={i} className={`evidence__item evidence--${e.kind}`}>
                        <span className="evidence__label">{e.label}</span>
                        <span>{e.detail}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="fine-print">
                    Always confirm sponsorship with the employer before relying on it. Evidence here is sample data.
                  </p>
                </>
              ) : (
                <p>No sponsorship evidence found.</p>
              )}
            </section>
          )}

          <ApplicationHelper job={job} state={state} onUpdate={(patch) => actions.update(job.id, patch)} />
        </article>

        <aside className="job-page__aside" aria-label="Job summary and actions">
          <div className="aside-card">
            <a className="btn btn--primary btn--block" href={job.url} target="_blank" rel="noopener noreferrer">
              Open job on {job.source} <Icon name="external" size={14} />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
            <p className="fine-print">You apply on the employer’s site. This app never submits for you.</p>

            <JobActions
              job={job}
              state={state}
              idSuffix="page"
              stacked
              onToggleSave={() => actions.toggleSave(job)}
              onDismiss={() => { actions.dismiss(job); onDismissed(job); }}
              onRestore={() => actions.restore(job)}
              onStatus={(s) => actions.setStatus(job, s)}
            />
          </div>

          <div className="aside-card">
            <h2 className="aside-card__title">Key facts</h2>
            <dl className="facts">
              <div><dt>Employer</dt><dd>{job.employer}</dd></div>
              <div><dt>Location</dt><dd>{job.location} · {job.workMode}</dd></div>
              <div><dt>Contract</dt><dd>{job.contractType}</dd></div>
              <div><dt>Salary</dt><dd>{job.salary}</dd></div>
              <div><dt>Date posted</dt><dd>{formatDate(job.postedDate)}</dd></div>
              <div><dt>Date found</dt><dd>{formatDate(job.foundDate)}</dd></div>
              <div>
                <dt>Closing date</dt>
                <dd className={`tone-${closing.tone}`}>
                  {job.closingDate ? `${formatDate(job.closingDate)} (${closing.label.toLowerCase()})` : 'Not stated in listing'}
                </dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>
                  {job.source}
                  {job.alsoListedOn?.length > 0 && (
                    <span className="muted"> (also on {job.alsoListedOn.map((a) => a.source).join(', ')})</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <a className="back-link" href={href.tab(job.tab)}>
            <Icon name="back" /> Back to {tab.label}
          </a>
        </aside>
      </div>
    </div>
  );
}
