import { closingInfo, formatDate, relativePosted } from '../lib/dates.js';
import { statusLabel } from '../lib/jobs.js';
import { href } from '../lib/router.js';
import JobActions from './JobActions.jsx';
import SponsorshipBadge from './SponsorshipBadge.jsx';
import { Icon } from './Icon.jsx';

export default function JobCard({ job, state, actions }) {
  const closing = closingInfo(job.closingDate);

  return (
    <article className={`job-card ${state.dismissed ? 'is-dismissed' : ''}`} aria-labelledby={`title-${job.id}`}>
      <div className="job-card__main">
        <div className="job-card__badges">
          {job.isSample && <span className="badge badge--sample">Sample data</span>}
          <SponsorshipBadge sponsorship={job.sponsorship} />
          {state.status && <span className={`badge badge--status s-${state.status}`}>{statusLabel(state.status)}</span>}
        </div>

        <h2 className="job-card__title" id={`title-${job.id}`}>
          <a href={href.job(job.id)}>{job.title}</a>
        </h2>
        <p className="job-card__employer">{job.employer}</p>

        <ul className="meta">
          <li><Icon name="pin" /> {job.location} · {job.workMode}</li>
          <li><Icon name="calendar" /> Posted {formatDate(job.postedDate)} <span className="muted">({relativePosted(job.postedDate)})</span></li>
          <li className={`tone-${closing.tone}`}>
            <Icon name="clock" />
            {job.closingDate ? `Closes ${formatDate(job.closingDate)}` : 'Closing date not stated'}
          </li>
          <li>
            <Icon name="source" /> {job.source}
            {job.alsoListedOn?.length > 0 && (
              <span className="muted"> · also on {job.alsoListedOn.map((a) => a.source).join(', ')}</span>
            )}
          </li>
        </ul>

        <p className="job-card__summary">{job.summary}</p>
      </div>

      <div className="job-card__side">
        <a className="btn btn--primary" href={job.url} target="_blank" rel="noopener noreferrer">
          Open job <Icon name="external" size={14} />
          <span className="visually-hidden">(opens in a new tab)</span>
        </a>
        <a className="btn btn--secondary" href={href.job(job.id)}>View details</a>
      </div>

      <div className="job-card__footer">
        <JobActions
          job={job}
          state={state}
          idSuffix="card"
          onToggleSave={() => actions.toggleSave(job)}
          onDismiss={() => actions.dismiss(job)}
          onRestore={() => actions.restore(job)}
          onStatus={(s) => actions.setStatus(job, s)}
        />
      </div>
    </article>
  );
}
