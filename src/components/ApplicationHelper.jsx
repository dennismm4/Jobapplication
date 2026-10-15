import { useState } from 'react';
import { Icon } from './Icon.jsx';

const TOOLS = [
  { id: 'cover', label: 'Draft cover letter', icon: 'doc' },
  { id: 'cv', label: 'Suggest CV edits', icon: 'edit' },
  { id: 'questions', label: 'Draft question answers', icon: 'chat' },
];

/** Information the drafts would need but that the app does not have yet. */
function missingInfo(job) {
  const items = [
    'Your CV and profile have not been added. Drafts can only use facts from your profile and this listing.',
  ];
  if (job.tab === 'uk-visa') {
    items.push('Your UK work-authorisation wording has not been provided. Drafts will not describe your visa status until you supply it.');
  }
  if (!job.closingDate) items.push('The listing does not state a closing date. Check the employer’s page.');
  items.push('The hiring manager’s name is not stated in the listing.');
  return items;
}

/** Cover-letter skeleton built only from listing facts, with brackets for everything else. */
function coverSkeleton(job) {
  const reqs = job.requirements.slice(0, 3);
  return [
    '[Your name]',
    '[Your contact details]',
    '',
    'Dear [Hiring manager — name not stated in listing],',
    '',
    `Re: ${job.title}, ${job.employer}`,
    '',
    '[Opening: why this role and organisation. To be drafted from your profile.]',
    '',
    '[Evidence: match your own experience to what the listing asks for:',
    ...reqs.map((r) => `  • ${r}`),
    'Only facts from your CV will be used here.]',
    '',
    job.tab === 'uk-visa'
      ? '[Closing: availability and your right-to-work / sponsorship statement, in wording you approve.]'
      : '[Closing: availability and notice period, in wording you approve.]',
    '',
    'Yours sincerely,',
    '[Your name]',
  ].join('\n');
}

function DraftBox({ id, label, value, approved, placeholder, onChange, onApprove, rows = 8 }) {
  return (
    <div className="draft">
      <label htmlFor={id} className="draft__label">{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="draft__footer">
        <label className="checkbox">
          <input type="checkbox" checked={!!approved} onChange={(e) => onApprove(e.target.checked)} disabled={!value.trim()} />
          I have reviewed and approve this text
        </label>
        <span className={`draft__state ${approved ? 'is-approved' : ''}`}>
          {approved ? 'Approved' : value.trim() ? 'Draft · not approved' : 'Empty'}
        </span>
      </div>
    </div>
  );
}

export default function ApplicationHelper({ job, state, onUpdate }) {
  const [open, setOpen] = useState(null);
  const drafts = state.drafts ?? {};

  const setDraft = (key, patch) => {
    const current = drafts[key] ?? {};
    // Editing approved text withdraws approval, so every change is re-reviewed.
    const next = { ...current, ...patch };
    if ('text' in patch && !('approved' in patch) && patch.text !== current.text) next.approved = false;
    onUpdate({ drafts: { ...drafts, [key]: next } });
  };

  const cover = drafts.cover ?? {};
  const coverText = cover.text ?? coverSkeleton(job);

  return (
    <section className="content-section helper" aria-labelledby="sec-helper">
      <h2 id="sec-helper">Application helper</h2>
      <p className="muted">
        Drafts are suggestions for you to edit and approve. Nothing is sent to the employer from this app.
      </p>

      <div className="helper__tools" role="group" aria-label="Application helper tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`helper__tool ${open === t.id ? 'is-open' : ''}`}
            aria-expanded={open === t.id}
            aria-controls={`helper-${t.id}`}
            onClick={() => setOpen(open === t.id ? null : t.id)}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {open && (
        <div className="helper__panel" id={`helper-${open}`}>
          <div className="placeholder-tag">Placeholder · AI drafting not active yet</div>

          <div className="callout callout--warn">
            <Icon name="alert" />
            <div>
              <strong>Missing information</strong>
              <ul className="bullets bullets--tight">
                {missingInfo(job).map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
          </div>

          {open === 'cover' && (
            <>
              <p>
                When active, this will draft a cover letter for <strong>{job.title}</strong> using only your profile
                and this listing. For now, the skeleton below contains only facts from the listing. Everything in
                [brackets] is for you to complete.
              </p>
              <DraftBox
                id={`cover-${job.id}`}
                label="Cover letter (editable)"
                value={coverText}
                approved={cover.approved}
                rows={14}
                onChange={(text) => setDraft('cover', { text })}
                onApprove={(approved) => setDraft('cover', { text: coverText, approved })}
              />
            </>
          )}

          {open === 'cv' && (
            <>
              <p>
                When active, this will compare each requirement below with your CV. It will suggest wording changes
                only where your CV already contains the evidence, and flag gaps it cannot fill.
              </p>
              <div className="table-wrap">
                <table className="req-table">
                  <thead>
                    <tr>
                      <th scope="col">Listing requirement</th>
                      <th scope="col">Evidence in your CV</th>
                      <th scope="col">Suggested edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.requirements.map((r) => (
                      <tr key={r}>
                        <td>{r}</td>
                        <td className="pending">Pending: CV not added</td>
                        <td className="pending">Pending</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DraftBox
                id={`cv-${job.id}`}
                label="Your notes on CV changes (editable)"
                value={drafts.cv?.text ?? ''}
                approved={drafts.cv?.approved}
                placeholder="Note any CV changes you plan to make for this role."
                rows={4}
                onChange={(text) => setDraft('cv', { text })}
                onApprove={(approved) => setDraft('cv', { approved })}
              />
            </>
          )}

          {open === 'questions' && (
            <>
              <p>
                When active, this will draft answers to each question using only your profile. Questions it cannot
                answer from your profile, such as notice period, salary or right to work, stay blank for you to fill.
              </p>
              {job.applicationQuestions.length === 0 ? (
                <p className="muted">No application questions were found in this listing.</p>
              ) : (
                job.applicationQuestions.map((q, i) => {
                  const key = `q${i}`;
                  const d = drafts[key] ?? {};
                  return (
                    <DraftBox
                      key={key}
                      id={`${key}-${job.id}`}
                      label={`Q${i + 1}. ${q}`}
                      value={d.text ?? ''}
                      approved={d.approved}
                      placeholder="Draft answers will appear here once your profile is added. You can write your own answer now."
                      rows={4}
                      onChange={(text) => setDraft(key, { text })}
                      onApprove={(approved) => setDraft(key, { approved })}
                    />
                  );
                })
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
