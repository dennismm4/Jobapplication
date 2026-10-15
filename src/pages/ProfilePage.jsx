const FIELDS = [
  ['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone', 'tel'],
  ['location', 'Current location', 'text'], ['preferredRoles', 'Preferred job titles', 'text'],
  ['summary', 'Professional summary', 'textarea'], ['skills', 'Skills', 'textarea'],
  ['experience', 'Work experience', 'textarea'], ['achievements', 'Achievements with evidence or numbers', 'textarea'],
  ['education', 'Education and qualifications', 'textarea'],
  ['workAuthorization', 'Work authorization / sponsorship details', 'textarea'],
];

export default function ProfilePage({ profile, onChange }) {
  const download = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'job-desk-profile.json'; a.click(); URL.revokeObjectURL(url);
  };
  const importFile = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { onChange({ ...profile, ...JSON.parse(await file.text()) }); }
    catch { window.alert('That file is not a valid Job Desk profile JSON file.'); }
    event.target.value = '';
  };
  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow">Private to this browser</p><h1>My profile</h1>
      <p className="page-hero__lede">Add accurate details for matching and application drafts. This profile stays in this browser and is not uploaded.</p></div></section>
    <div className="container narrow"><form className="content-section profile-form" onSubmit={(e) => e.preventDefault()}>
      <div className="callout callout--warn"><strong>Privacy:</strong> profile data is saved in this browser’s local storage. Do not include sensitive identity or financial details.</div>
      {FIELDS.map(([key, label, type]) => <div className="field profile-form__field" key={key}>
        <label htmlFor={`profile-${key}`}>{label}</label>
        {type === 'textarea'
          ? <textarea id={`profile-${key}`} rows={key === 'summary' ? 3 : 5} value={profile[key] || ''} onChange={(e) => onChange({ ...profile, [key]: e.target.value })} />
          : <input id={`profile-${key}`} type={type} value={profile[key] || ''} onChange={(e) => onChange({ ...profile, [key]: e.target.value })} />}
      </div>)}
      <div className="profile-form__actions"><button type="button" className="btn btn--secondary" onClick={download}>Export profile backup</button>
        <label className="btn btn--secondary">Import profile backup<input type="file" accept="application/json,.json" onChange={importFile} hidden /></label></div>
      <p className="muted">Do not commit profile data to GitHub. Export a backup before clearing browser data.</p>
    </form></div>
  </>;
}
