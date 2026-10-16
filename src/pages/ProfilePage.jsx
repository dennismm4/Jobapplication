import { useState } from 'react';
import { extractCvText } from '../lib/cv.js';

const FIELDS = [
  ['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone', 'tel'],
  ['location', 'Current location', 'text'], ['preferredRoles', 'Preferred job titles', 'text'],
  ['summary', 'Professional summary', 'textarea'], ['skills', 'Skills', 'textarea'],
  ['experience', 'Work experience', 'textarea'], ['achievements', 'Achievements with evidence or numbers', 'textarea'],
  ['education', 'Education and qualifications', 'textarea'],
  ['workAuthorization', 'Work authorization / sponsorship details', 'textarea'],
];

export default function ProfilePage({ profile, onChange }) {
  const [cvMessage, setCvMessage] = useState('');
  const [readingCv, setReadingCv] = useState(false);
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
  const uploadCv = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    setReadingCv(true); setCvMessage('Reading CV in this browser…');
    try {
      const text = await extractCvText(file);
      if (text.length < 80) throw new Error('No readable text was found. Scanned image-only PDFs need OCR and are not supported yet.');
      onChange({ ...profile, cvText: text, cvFileName: file.name });
      setCvMessage(`Extracted ${text.length.toLocaleString()} characters from ${file.name}. Review the text below.`);
    } catch (error) { setCvMessage(error.message || 'Could not read this CV.'); }
    finally { setReadingCv(false); event.target.value = ''; }
  };
  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow">Private to this browser</p><h1>My profile</h1>
      <p className="page-hero__lede">Add accurate details for matching and application drafts. This profile stays in this browser and is not uploaded.</p></div></section>
    <div className="container narrow"><form className="content-section profile-form" onSubmit={(e) => e.preventDefault()}>
      <div className="callout callout--warn"><strong>Privacy:</strong> profile data and extracted CV text are saved only in this browser’s local storage. Your uploaded file is parsed on this device and is not sent to the job sources or a server.</div>
      <section className="cv-upload" aria-labelledby="cv-upload-title">
        <h2 id="cv-upload-title">Upload your CV for UK recommendations</h2>
        <p className="muted">PDF, DOCX or TXT · 10 MB maximum · PDF up to 30 pages. Each person’s profile stays separate in their own browser.</p>
        <label className="btn btn--secondary">{readingCv ? 'Reading CV…' : 'Choose CV file'}<input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={uploadCv} disabled={readingCv} hidden /></label>
        {cvMessage && <p role="status" className="fine-print">{cvMessage}</p>}
        {profile.cvText && <>
          <p><strong>{profile.cvFileName || 'CV text'}</strong> <button type="button" className="link-btn" onClick={() => { onChange({ ...profile, cvText: '', cvFileName: '' }); setCvMessage('Removed saved CV text from this browser.'); }}>Remove CV</button></p>
          <label className="profile-form__field" htmlFor="profile-cvText"><span className="field__label">Extracted text used for matching</span><textarea id="profile-cvText" rows={8} value={profile.cvText} onChange={(e) => onChange({ ...profile, cvText: e.target.value })} /></label>
          <a className="btn btn--primary" href="#/uk-visa">See UK job recommendations</a>
        </>}
      </section>
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
