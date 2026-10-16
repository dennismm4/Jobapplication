import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const MAX_PER_TAB = 5;
const today = new Date().toISOString().slice(0, 10);
const feedReport = [];

function text(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim();
}
function idFor(url) { return createHash('sha256').update(url).digest('hex').slice(0, 16); }
function parseCsvRow(line) {
  const cells = []; let cell = ''; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"' && quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { cells.push(cell); cell = ''; }
    else cell += ch;
  }
  cells.push(cell); return cells;
}
function plainDate(value) { return value ? new Date(value).toISOString().slice(0, 10) : null; }

async function reliefWebJobs() {
  const appname = process.env.RELIEFWEB_APPNAME;
  if (!appname) { feedReport.push('ReliefWeb skipped: RELIEFWEB_APPNAME secret is missing.'); return null; }
  const url = `https://api.reliefweb.int/v2/jobs?appname=${encodeURIComponent(appname)}`;
  const response = await fetch(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      filter: { field: 'country.name', value: 'Kenya' }, limit: 100,
      sort: ['date.created:desc'],
      fields: { include: ['id', 'title', 'url', 'date', 'country', 'city', 'career_categories', 'experience', 'type', 'description', 'body', 'source'] },
    }),
  });
  if (!response.ok) throw new Error(`ReliefWeb returned ${response.status}`);
  const payload = await response.json();
  const jobs = (payload.data || []).map(({ fields: f }) => {
    const description = text(f.description || f.body || '');
    const source = f.source?.map((s) => s.name).filter(Boolean).join(', ') || 'ReliefWeb';
    const place = [f.city?.[0]?.name, f.country?.[0]?.name].filter(Boolean).join(', ') || 'Kenya';
    const closing = f.date?.expiration || f.date?.expire || null;
    return {
      id: `rw-${idFor(f.url || String(f.id))}`, tab: 'ngo-kenya', title: text(f.title), employer: source,
      location: place, workMode: 'Not stated', contractType: f.type?.[0]?.name || 'Not stated', salary: 'Not stated',
      postedDate: plainDate(f.date?.created), closingDate: plainDate(closing), foundDate: today,
      source: 'ReliefWeb', url: f.url, summary: description.slice(0, 250),
      description: description ? [description.slice(0, 5000)] : [],
      requirements: (f.experience || []).map((x) => text(x.name)).filter(Boolean).slice(0, 8),
      listingSignals: (f.career_categories || []).map((x) => text(x.name)).filter(Boolean).slice(0, 8),
      applicationQuestions: [], isSample: false,
    };
  }).filter((job) => job.title && job.url && (!job.closingDate || job.closingDate >= today));
  feedReport.push(`ReliefWeb: ${jobs.length} Kenya listings received.`);
  return jobs;
}

async function sponsorNames() {
  const pageUrl = 'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers';
  const page = await fetch(pageUrl);
  if (!page.ok) throw new Error(`GOV.UK sponsor register page returned ${page.status}`);
  const html = await page.text();
  const csvUrl = html.match(/https:\/\/assets\.publishing\.service\.gov\.uk\/[^"'\s<>]+\.csv/i)?.[0];
  if (!csvUrl) throw new Error('Could not find the official sponsor-register CSV link on GOV.UK.');
  const response = await fetch(csvUrl);
  if (!response.ok) throw new Error(`Sponsor register CSV returned ${response.status}`);
  const rows = (await response.text()).split(/\r?\n/).filter(Boolean);
  const header = parseCsvRow(rows.shift() || '').map((h) => h.toLowerCase());
  const nameIndex = header.findIndex((h) => /organisation name|organization name|organisation|organization/.test(h));
  const routeIndex = header.findIndex((h) => h === 'route');
  if (nameIndex < 0) throw new Error('Sponsor-register CSV has an unexpected format.');
  const names = new Set();
  for (const row of rows) {
    const cells = parseCsvRow(row);
    if (routeIndex >= 0 && !/skilled worker|health and care worker/i.test(cells[routeIndex] || '')) continue;
    names.add(normalizeEmployer(cells[nameIndex] || ''));
  }
  feedReport.push(`GOV.UK sponsor register loaded: ${names.size} Skilled Worker organisations.`);
  return { names, url: pageUrl, registerDate: csvUrl.match(/\d{4}-\d{2}-\d{2}/)?.[0] || null };
}

function normalizeEmployer(value) {
  return text(value).toLowerCase().replace(/\b(limited|ltd|plc|incorporated|inc|llp|uk)\b/g, '').replace(/[^a-z0-9]/g, '');
}
function sponsorMatch(employer, names) {
  const target = normalizeEmployer(employer);
  if (target.length < 4) return false;
  for (const registered of names) {
    if (registered.length >= 5 && (registered === target || registered.includes(target) || target.includes(registered))) return true;
  }
  return false;
}

async function adzunaSearch(country, query, perPage = 100) {
  const { ADZUNA_APP_ID: appId, ADZUNA_APP_KEY: appKey } = process.env;
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  for (const [key, value] of Object.entries({ app_id: appId, app_key: appKey, results_per_page: String(perPage), what: query, 'content-type': 'application/json' })) url.searchParams.set(key, value);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Adzuna ${country.toUpperCase()} returned ${response.status}`);
  return (await response.json()).results || [];
}

async function adzunaUkJobs(register) {
  const [generalResults, nhsResults] = await Promise.all([
    adzunaSearch('gb', 'visa sponsorship'),
    adzunaSearch('gb', 'NHS visa sponsorship'),
  ]);
  const items = new Map([...generalResults, ...nhsResults].map((item) => [item.redirect_url, item]));
  const jobs = [...items.values()].flatMap((item) => {
    const description = text(item.description || '');
    const evidence = `${item.title || ''} ${description}`;
    const statesSponsorship = /visa sponsorship|sponsorship available|skilled worker (?:visa )?sponsorship|certificate of sponsorship|will sponsor (?:the )?(?:right )?candidate/i.test(evidence);
    const disclaims = /no sponsorship|cannot sponsor|unable to sponsor|not able to sponsor|no visa sponsorship/i.test(evidence);
    const registered = sponsorMatch(item.company?.display_name || '', register.names);
    if (!statesSponsorship || disclaims || !registered || !item.redirect_url) return [];
    const employer = text(item.company?.display_name || 'Employer not stated');
    return [{
      id: `adz-${idFor(item.redirect_url)}`, tab: 'uk-visa', title: text(item.title), employer,
      location: text(item.location?.display_name || 'United Kingdom'), workMode: 'Not stated',
      contractType: text(item.contract_type || 'Not stated'),
      salary: item.salary_min && item.salary_max ? `${Math.round(item.salary_min)}–${Math.round(item.salary_max)} ${item.salary_is_predicted ? '(estimated)' : ''}`.trim() : 'Not stated',
      postedDate: plainDate(item.created), closingDate: null, foundDate: today, source: 'Adzuna', url: item.redirect_url,
      summary: description.slice(0, 250), description: description ? [description.slice(0, 5000)] : [],
      requirements: [], listingSignals: ['Listing explicitly mentions visa sponsorship', ...( /\bNHS\b|National Health Service|NHS (?:Trust|Foundation Trust)/i.test(`${item.company?.display_name || ''} ${item.title || ''}`) ? ['NHS role prioritised'] : [])], applicationQuestions: [], isSample: false,
      sponsorship: { status: 'verified', summary: 'The listing mentions sponsorship and the employer name matches the current GOV.UK Skilled Worker sponsor register. This does not guarantee sponsorship for this vacancy; verify with the employer.', evidence: [
        { label: 'Job listing', detail: 'Sponsorship wording found in the Adzuna listing description.', url: item.redirect_url },
        { label: 'GOV.UK register', detail: `Employer name matched an entry in the published worker sponsor register${register.registerDate ? ` (file dated ${register.registerDate})` : ''}.`, url: register.url },
      ] },
    }];
  });
  jobs.sort((a, b) => Number(b.listingSignals.includes('NHS role prioritised')) - Number(a.listingSignals.includes('NHS role prioritised')) || (b.postedDate || '').localeCompare(a.postedDate || ''));
  feedReport.push(`Adzuna UK: ${jobs.length} listings passed sponsorship wording and register checks; NHS roles ranked first, with other UK locations retained.`);
  return jobs;
}

async function adzunaNordicJobs() {
  const [sweden, finland] = await Promise.all([
    Promise.all([adzunaSearch('se', 'visa sponsorship'), adzunaSearch('se', 'work permit relocation')]),
    Promise.all([adzunaSearch('fi', 'visa sponsorship'), adzunaSearch('fi', 'work permit relocation')]),
  ]);
  const seen = new Set();
  const jobs = [
    ...sweden.flat().map((item) => ({ item, country: 'Sweden' })),
    ...finland.flat().map((item) => ({ item, country: 'Finland' })),
  ]
    .flatMap(({ item, country }) => {
      const description = text(item.description || '');
      const evidence = `${item.title || ''} ${description}`;
      const explicit = /visa sponsorship|work[- ]permit sponsorship|relocation (?:support|assistance)|will sponsor (?:the )?(?:right )?candidate/i.test(evidence);
      const disclaims = /no sponsorship|cannot sponsor|unable to sponsor|not able to sponsor/i.test(evidence);
      if (!explicit || disclaims || !item.redirect_url || seen.has(item.redirect_url)) return [];
      seen.add(item.redirect_url);
      return [{
        id: `adz-${idFor(item.redirect_url)}`, tab: 'nordic-visa', title: text(item.title), employer: text(item.company?.display_name || 'Employer not stated'),
        location: text(item.location?.display_name || country).toLowerCase().includes(country.toLowerCase()) ? text(item.location.display_name) : `${text(item.location?.display_name || 'Location not stated')}, ${country}`, workMode: 'Not stated', contractType: text(item.contract_type || 'Not stated'),
        salary: item.salary_min && item.salary_max ? `${Math.round(item.salary_min)}–${Math.round(item.salary_max)} ${item.salary_is_predicted ? '(estimated)' : ''}`.trim() : 'Not stated',
        postedDate: plainDate(item.created), closingDate: null, foundDate: today, source: 'Adzuna', url: item.redirect_url,
        summary: description.slice(0, 250), description: description ? [description.slice(0, 5000)] : [], requirements: [],
        listingSignals: ['Listing mentions work permit, visa sponsorship or relocation support'], applicationQuestions: [], isSample: false,
        sponsorship: { status: 'unverified', summary: 'The listing mentions immigration or relocation support. No Nordic government sponsor-register verification was performed; confirm the permit route and support directly with the employer.', evidence: [{ label: 'Job listing', detail: 'Relevant sponsorship or relocation wording found in the listing.', url: item.redirect_url }] },
      }];
    });
  feedReport.push(`Adzuna Sweden and Finland: ${jobs.length} listings with explicit work-permit or relocation wording.`);
  const byCountry = {
    Sweden: jobs.filter((job) => /Sweden$/i.test(job.location)).sort((a, b) => (b.postedDate || '').localeCompare(a.postedDate || '')),
    Finland: jobs.filter((job) => /Finland$/i.test(job.location)).sort((a, b) => (b.postedDate || '').localeCompare(a.postedDate || '')),
  };
  const balanced = [];
  while (balanced.length < MAX_PER_TAB && (byCountry.Sweden.length || byCountry.Finland.length)) {
    for (const country of ['Sweden', 'Finland']) {
      if (byCountry[country].length && balanced.length < MAX_PER_TAB) balanced.push(byCountry[country].shift());
    }
  }
  return balanced;
}

async function main() {
  let relief = [];
  let uk = [];
  let nordic = [];
  let sourceSucceeded = false;
  if (process.env.RELIEFWEB_APPNAME) {
    try { relief = await reliefWebJobs() || []; sourceSucceeded = true; }
    catch (error) { feedReport.push(`ReliefWeb failed: ${error.message}`); }
  } else feedReport.push('ReliefWeb skipped: RELIEFWEB_APPNAME secret is missing.');

  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
    try {
      nordic = await adzunaNordicJobs() || [];
      sourceSucceeded = true;
    } catch (error) { feedReport.push(`Adzuna Nordic search failed: ${error.message}`); }
    try {
      const register = await sponsorNames();
      uk = await adzunaUkJobs(register) || [];
      sourceSucceeded = true;
    } catch (error) { feedReport.push(`Adzuna UK or GOV.UK sponsor check failed: ${error.message}`); }
  } else feedReport.push('Adzuna UK skipped: ADZUNA_APP_ID or ADZUNA_APP_KEY is missing.');

  if (!sourceSucceeded) {
    console.warn('No configured job source completed successfully. Keeping the existing published jobs file unchanged.');
    console.log(feedReport.join('\n'));
    process.exitCode = 1;
    return;
  }
  const jobs = [...relief.slice(0, MAX_PER_TAB), ...uk.slice(0, MAX_PER_TAB), ...nordic.slice(0, MAX_PER_TAB)];
  const payload = { generatedAt: new Date().toISOString(), jobs, report: feedReport };
  await mkdir('public', { recursive: true });
  await writeFile('public/jobs.json', `${JSON.stringify(payload, null, 2)}\n`);
  console.log(feedReport.join('\n'));
  console.log(`Wrote ${jobs.length} jobs to public/jobs.json.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
