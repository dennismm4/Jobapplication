import { useState } from 'react';
import { Icon } from './Icon.jsx';

const TOOLS = [
  { id: 'cover', label: 'Draft cover letter', icon: 'doc' },
  { id: 'cv', label: 'Suggest CV edits', icon: 'edit' },
  { id: 'questions', label: 'Draft question answers', icon: 'chat' },
];

/** Information the drafts would need but that the app does not have yet. */
function missingInfo(job, profile) {
  const items = [];
  if (!profile?.summary && !profile?.experience && !profile?.skills) items.push('Add a professional summary, skills, or work experience in My profile before generating profile-based drafts.');
  if (job.tab === 'uk-visa' || job.tab === 'nordic-visa') {
    if (!profile?.workAuthorization) items.push(`Your ${job.tab === 'uk-visa' ? 'UK' : 'country-specific'} work-authorisation wording is missing. Drafts will not claim a visa status.`);
  }
  if (!job.closingDate) items.push('The listing does not state a closing date. Check the employer’s page.');
  items.push('The hiring manager’s name is not stated in the listing.');
  return items;
}

/** Cover-letter skeleton built only from listing facts, with brackets for everything else. */
function coverSkeleton(job, profile = {}) {
  const reqs = job.requirements.slice(0, 3);
  const evidence = [profile.summary, profile.experience, profile.achievements].filter(Boolean).join('\n\n');
  return [
    profile.name || '[Your name]',
    [profile.email, profile.phone, profile.location].filter(Boolean).join(' · ') || '[Your contact details]',
    '',
    'Dear [Hiring manager — name not stated in listing],',
    '',
    `Re: ${job.title}, ${job.employer}`,
    '',
    `I am applying for the ${job.title} position at ${job.employer}. ${profile.summary || '[Add a short introduction based on your experience and interest in this role.]'}`,
    '',
    evidence || '[Add relevant experience from your profile.]',
    '',
    `The listing highlights: ${reqs.join('; ')}. Review this draft and connect these requirements to specific examples from your experience.`,
    '',
    job.tab === 'uk-visa'
      ? (profile.workAuthorization || '[Add your accurate UK work-authorisation statement before using this letter.]')
      : job.tab === 'nordic-visa'
        ? (profile.workAuthorization || '[Add your accurate work-authorisation statement for this country before using this letter.]')
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

export default function ApplicationHelper({ job, state, profile = {}, onUpdate }) {
  const [open, setOpen] = useState(null);
  const [copied, setCopied] = useState(false);
  const drafts = state.drafts ?? {};

  const setDraft = (key, patch) => {
    const current = drafts[key] ?? {};
    // Editing approved text withdraws approval, so every change is re-reviewed.
    const next = { ...current, ...patch };
    if ('text' in patch && !('approved' in patch) && patch.text !== current.text) next.approved = false;
    onUpdate({ drafts: { ...drafts, [key]: next } });
  };

  const cover = drafts.cover ?? {};
  const coverText = cover.text ?? '';
  const generate = (key, value) => setDraft(key, { text: value });
  const profileFacts = [profile.summary, profile.experience, profile.skills, profile.education, profile.achievements].filter(Boolean).join('\n\n');
  const makeAnswer = (question) => {
    if (!profileFacts) return '[Add relevant details to My profile, then generate this answer.]';
    const q = question.toLowerCase();
    const matched = q.includes('skill') ? profile.skills
      : q.includes('experience') || q.includes('tell us') || q.includes('background') ? [profile.summary, profile.experience, profile.achievements].filter(Boolean).join('\n\n')
        : q.includes('education') || q.includes('qualification') ? profile.education
          : profile.summary || profile.experience;
    return matched || '[No matching profile information. Add a truthful answer yourself.]';
  };
  const copyPrompt = async () => {
    const task = open === 'cover' ? 'Write a tailored cover letter'
      : open === 'cv' ? 'Suggest truthful CV edits'
        : 'Draft answers to the application questions';
    const prompt = [
      'Act as a careful job-application writing assistant.', task + '.',
      'Use only facts explicitly present in the profile and listing below. Do not invent qualifications, dates, achievements, metrics, work authorization, or experience. If evidence is missing, flag it as [NEEDS MY INPUT] instead of guessing. Keep wording clear and specific. Return editable plain text.',
      'PROFILE (provided by me):', JSON.stringify(profile, null, 2),
      'JOB LISTING:', JSON.stringify({ title: job.title, employer: job.employer, location: job.location, description: job.description, requirements: job.requirements, applicationQuestions: job.applicationQuestions, sponsorship: job.sponsorship }, null, 2),
      open === 'questions' ? 'Answer each listed question separately. Leave personal details not in the profile marked [NEEDS MY INPUT].' : '',
      open === 'cv' ? 'For each suggested edit, identify the profile fact that supports it. Do not add unsupported accomplishments.' : '',
    ].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true); window.setTimeout(() => setCopied(false), 3000);
    } catch { setCopied(false); }
  };

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
          <div className="helper__prompt-row"><div className="placeholder-tag">Profile-based draft · no AI service connected</div>
            <button type="button" className="btn btn--secondary btn--sm" onClick={copyPrompt}>{copied ? 'Prompt copied' : 'Copy prompt for Claude'}</button></div>
          <p className="muted">Paste the copied prompt into Claude, review its response, then paste the text you want to keep into the editable draft below.</p>

          <div className="callout callout--warn">
            <Icon name="alert" />
            <div>
              <strong>Missing information</strong>
              <ul className="bullets bullets--tight">
                {missingInfo(job, profile).map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
          </div>

          {open === 'cover' && (
            <>
              <p>
                This draft uses only the details you entered in My profile and the job listing. Review every statement before use.
              </p>
              <button type="button" className="btn btn--secondary" onClick={() => generate('cover', coverSkeleton(job, profile))}>Generate / refresh draft</button>
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
                Profile evidence is shown when available. Use the suggestions as editing prompts; they are not a claim that your CV contains proof beyond the text you entered.
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
                        <td>{[profile.skills, profile.experience, profile.summary].filter(Boolean).join(' · ') || <span className="pending">Add details in My profile</span>}</td>
                        <td>{profileFacts ? `Review whether your profile evidence supports: ${r}` : <span className="pending">Pending profile details</span>}</td>
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
                Select “Draft answer” to prefill from matching profile details. Questions not covered by your profile remain for you to answer.
              </p>
              {job.applicationQuestions.length === 0 ? (
                <p className="muted">No application questions were found in this listing.</p>
              ) : (
                job.applicationQuestions.map((q, i) => {
                  const key = `q${i}`;
                  const d = drafts[key] ?? {};
                  return (
                    <div key={key}>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => generate(key, makeAnswer(q))}>Draft answer from profile</button>
                    <DraftBox
                      id={`${key}-${job.id}`}
                      label={`Q${i + 1}. ${q}`}
                      value={d.text ?? ''}
                      approved={d.approved}
                      placeholder="Add your own truthful answer, or draft from your profile."
                      rows={4}
                      onChange={(text) => setDraft(key, { text })}
                      onApprove={(approved) => setDraft(key, { approved })}
                    />
                    </div>
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
