import { TABS } from '../data/sampleJobs.js';
import { closingInfo, formatDate } from '../lib/dates.js';
import { href } from '../lib/router.js';
import JobActions from '../components/JobActions.jsx';
import SponsorshipBadge from '../components/SponsorshipBadge.jsx';
import ApplicationHelper from '../components/ApplicationHelper.jsx';
import { Icon } from '../components/Icon.jsx';

const STOP = new Set('the and for with from your you have this that will years experience role skills in of to a an is are our'.split(' '));
function profileEvidence(profile = {}, requirement) {
  const sources = [
    ['Summary', profile.summary], ['Work experience', profile.experience], ['Skills', profile.skills],
    ['Education', profile.education], ['Achievements', profile.achievements], ['Uploaded CV', profile.cvText],
  ].filter(([, value]) => value?.trim());
  const terms = requirement.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((word) => !STOP.has(word)) || [];
  return sources.map(([label, value]) => {
    const matches = [...new Set(terms.filter((word) => value.toLowerCase().includes(word)))];
    const first = matches.length ? value.toLowerCase().indexOf(matches[0]) : 0;
    const excerpt = value.length > 360 ? `…${value.slice(Math.max(0, first - 90), Math.max(0, first - 90) + 360)}…` : value;
    return matches.length ? { label, value: excerpt, matches } : null;
  }).filter(Boolean).sort((a, b) => b.matches.length - a.matches.length)[0] || null;
}

export default function JobPage({ job, state, actions, onDismissed, profile }) {
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
                {profile && [profile.summary, profile.experience, profile.skills, profile.education, profile.achievements, profile.cvText].some(Boolean)
                  ? 'Suggested evidence below comes from text you entered or extracted from your CV in this browser. Keyword overlap is only a prompt for your review; it does not prove that you meet a requirement.'
                  : <>Add your information in <a href={href.profile()}>My profile</a> to see possible evidence matches. No claims are generated from missing information.</>}
              </div>
            </div>
            {profile && [profile.summary, profile.experience, profile.skills, profile.education, profile.achievements, profile.cvText].some(Boolean) && job.requirements.length > 0 && (
              <div className="evidence-list">
                {job.requirements.map((requirement) => {
                  const evidence = profileEvidence(profile, requirement);
                  return <div className="evidence-list__item" key={requirement}>
                    <strong>Listing asks: {requirement}</strong>
                    <p>{evidence ? <><span className="evidence-list__label">Possible profile evidence ({evidence.label}):</span> {evidence.value}</> : <span className="pending">No keyword match found in your profile; review this requirement yourself.</span>}</p>
                  </div>;
                })}
              </div>
            )}
            {job.listingSignals.length > 0 && (
              <>
                <h3>Signals from the listing (used for matching later)</h3>
                <ul className="chips">
                  {job.listingSignals.map((s) => <li key={s} className="chip">{s}</li>)}
                </ul>
              </>
            )}
          </section>

          {(job.tab === 'uk-visa' || job.tab === 'nordic-visa') && (
            <section className="content-section" aria-labelledby="sec-visa">
              <h2 id="sec-visa">{job.tab === 'uk-visa' ? 'Visa sponsorship evidence' : 'Work permit / relocation evidence'}</h2>
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
                    Always confirm immigration support for this specific vacancy with the employer. {job.tab === 'uk-visa' && 'A sponsor-register entry alone does not prove that a role offers sponsorship.'}
                  </p>
                </>
              ) : (
                <p>No sponsorship evidence found.</p>
              )}
            </section>
          )}

          <ApplicationHelper job={job} state={state} profile={profile} onUpdate={(patch) => actions.update(job.id, patch)} />
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
