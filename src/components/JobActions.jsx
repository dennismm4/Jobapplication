import { STATUSES } from '../lib/jobs.js';
import { Icon } from './Icon.jsx';

/** Save / dismiss / status controls shared by the card and the detail view. */
export default function JobActions({ job, state, onToggleSave, onDismiss, onRestore, onStatus, idSuffix = 'x', stacked = false }) {
  const statusId = `status-${job.id}-${idSuffix}`;
  return (
    <div className={`job-actions ${stacked ? 'job-actions--stacked' : ''}`}>
      <button
        type="button"
        className={`btn btn--ghost ${state.saved ? 'is-saved' : ''}`}
        aria-pressed={!!state.saved}
        onClick={onToggleSave}
      >
        <Icon name={state.saved ? 'bookmark-filled' : 'bookmark'} />
        {state.saved ? 'Saved' : 'Save'}
      </button>

      {state.dismissed ? (
        <button type="button" className="btn btn--ghost" onClick={onRestore}>
          <Icon name="undo" />
          Restore
        </button>
      ) : (
        <button type="button" className="btn btn--ghost" onClick={onDismiss}>
          <Icon name="x" />
          Dismiss
        </button>
      )}

      <div className="status-select">
        <label htmlFor={statusId} className={stacked ? 'field__label' : 'visually-hidden'}>
          {stacked ? 'Application status' : `Application status for ${job.title}`}
        </label>
        <select
          id={statusId}
          value={state.status ?? ''}
          onChange={(e) => onStatus(e.target.value)}
          data-status={state.status || 'none'}
        >
          {STATUSES.map((s) => (
            <option key={s.id || 'none'} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
