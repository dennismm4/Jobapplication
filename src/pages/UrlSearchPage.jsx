import { useState } from 'react';

const LIMIT = 10;
const clean = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const hostIsLocal = (host) => /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[::1\])/i.test(host);

function normalizeFeed(payload, contentType) {
  if (contentType.includes('xml') || /^\s*</.test(payload)) {
    const xml = new DOMParser().parseFromString(payload, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('The URL did not return valid RSS or Atom XML.');
    return [...xml.querySelectorAll('item, entry')].map((item) => ({
      title: item.querySelector('title')?.textContent,
      employer: item.querySelector('author name, author, creator, source')?.textContent || 'Not stated',
      url: item.querySelector('link')?.getAttribute('href') || item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent,
      summary: item.querySelector('description, summary, content')?.textContent || '',
      location: item.querySelector('location, city, region')?.textContent || 'Not stated',
      postedDate: item.querySelector('pubDate, published, updated')?.textContent || '',
    }));
  }
  const json = JSON.parse(payload);
  const rows = Array.isArray(json) ? json : json.jobs || json.results || json.items || json.data;
  if (!Array.isArray(rows)) throw new Error('JSON feed must contain an array named jobs, results, items or data.');
  return rows.map((job) => ({
    title: job.title || job.name,
    employer: job.employer || job.company || job.organization || 'Not stated',
    url: job.url || job.link || job.redirect_url || job.apply_url,
    summary: job.summary || job.description || job.content || '',
    location: job.location?.display_name || job.location || job.city || 'Not stated',
    postedDate: job.postedDate || job.created || job.date || '',
  }));
}

function profileScore(job, profile) {
  const haystack = `${job.title} ${job.employer} ${job.summary} ${job.location}`.toLowerCase();
  const terms = `${profile.preferredRoles || ''} ${profile.skills || ''} ${profile.experience || ''}`
    .toLowerCase().split(/[^a-z0-9+#.]+/).filter((word) => word.length > 2);
  const unique = [...new Set(terms)];
  const matches = unique.filter((term) => haystack.includes(term));
  return { matches, score: unique.length ? Math.round((matches.length / unique.length) * 100) : 0 };
}

export default function UrlSearchPage({ profile }) {
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function search(event) {
    event.preventDefault(); setError(''); setJobs([]);
    let parsed;
    try { parsed = new URL(url); } catch { setError('Enter a complete public RSS, Atom or JSON jobs feed URL.'); return; }
    if (parsed.protocol !== 'https:' || hostIsLocal(parsed.hostname)) {
      setError('For safety, use an HTTPS URL on a public host.'); return;
    }
    setBusy(true);
    try {
      const response = await fetch(parsed.href);
      if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`);
      if (Number(response.headers.get('content-length') || 0) > 5_000_000) throw new Error('Feed is larger than the 5 MB limit.');
      const found = normalizeFeed(await response.text(), response.headers.get('content-type') || '');
      const relevant = found.map((job) => ({ ...job, url: job.url ? new URL(job.url, parsed.href).href : '' }))
        .filter((job) => job.title && job.url && /^https:\/\//i.test(job.url))
        .map((job) => ({ ...job, ...profileScore(job, profile) }))
        .sort((a, b) => b.score - a.score).slice(0, LIMIT);
      setJobs(relevant);
      if (!relevant.length) setError('No usable jobs were found. The feed may be empty, unsupported, or blocked by its CORS policy.');
    } catch (cause) {
      setError(`${cause.message || 'Could not read the feed.'} The source must allow browser access (CORS).`);
    } finally { setBusy(false); }
  }

  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow">Custom job search</p><h1>Search a jobs URL</h1>
      <p className="page-hero__lede">Paste a public RSS, Atom or JSON jobs feed. We rank listings against your profile and show up to 10 results per search.</p></div></section>
    <div className="container narrow">
      <form className="content-section profile-form" onSubmit={search}>
        <label className="profile-form__field" htmlFor="jobs-url"><strong>Jobs feed URL</strong><input id="jobs-url" type="url" required placeholder="https://example.org/jobs.xml" value={url} onChange={(e) => setUrl(e.target.value)} /></label>
        <p className="fine-print">The URL must return RSS, Atom or JSON directly and allow browser access. Search pages that require login or block cross-origin requests are not supported. Your API keys and profile are never sent to the feed.</p>
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? 'Searching…' : 'Search up to 10 jobs'}</button>
      </form>
      {error && <p role="status" className="feed-error">{error}</p>}
      {jobs.length > 0 && <section className="content-section"><h2>Top matches ({jobs.length}, maximum {LIMIT})</h2><ol className="url-job-list">
        {jobs.map((job, index) => <li key={`${job.url}-${index}`}><h3><a href={job.url} target="_blank" rel="noreferrer">{clean(job.title)}</a></h3>
          <p>{clean(job.employer)} · {clean(job.location)}{job.postedDate ? ` · ${clean(job.postedDate)}` : ''}</p>
          <p>{clean(job.summary).slice(0, 360)}</p><p className="fine-print">Profile keyword match: {job.score}% ({job.matches.length} matching terms). Use this as a relevance hint, not an eligibility decision.</p>
        </li>)}
      </ol></section>}
    </div>
  </>;
}
