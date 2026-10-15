# Job Desk

A personal job-search and application-assistance **website** with these sections:

1. **NGO Jobs in Kenya**
2. **UK Visa Sponsorship Jobs**
3. **Sweden & Finland Sponsorship Jobs**
4. **Search a URL**: search a public RSS, Atom or JSON job feed, rank by profile keywords and show at most 10 results
5. **My applications**: a tracker of every job you saved or gave a status

> Live search runs in GitHub Actions when its source secrets and Pages deployment are configured. Until then, the app clearly labels and shows fictional sample listings.

## What works

- Website layout: header navigation, a page per category, a full page per job, and a tracker page. Each page has its own address (for example `#/uk-visa` or `#/job/uk-001`), so the browser Back button and bookmarks work.
- Each category page shows up to 5 jobs, with a note when fewer than 5 are available. Each job shows title, employer, location, date posted, closing date (or "not stated"), source and an **Open job** link.
- UK sponsored listings are ranked with NHS roles first when the NHS is named in the employer or title. The search still covers the full UK, so other UK locations remain eligible.
- Nordic listings are searched in Sweden and Finland. They must mention sponsorship, work permits or relocation support; those signals are shown as unverified and must be confirmed with the employer.
- **Search a URL** accepts a public HTTPS RSS, Atom or JSON feed, ranks jobs by keyword overlap with your profile and caps each search at 10 results. The feed must allow browser access (CORS); ordinary job-board pages, login-protected pages and feeds that block browser access cannot be fetched by this static site.
- **Filters** (left sidebar): job title search, location, date posted, application status. Above the results: Active / Saved / Dismissed views and sorting by newest or closing soonest.
- **Deduplication:** the same job from two sources is merged. The sample data includes one deliberate duplicate, shown as "also on …".
- **Tracking:** Save, Dismiss (with Undo), Restore, and status: Interested, Preparing application, Applied, Rejected. Setting a status also saves the job.
- **Job page:** job description, listing requirements, "Why it matches your profile", and **visa sponsorship evidence** for UK roles, labelled *Stated in listing* or *Unverified*. A side panel shows key facts and actions.
- **Application helper:** editable profile-based cover letter and question-answer drafts, requirement evidence prompts, and a copyable Claude prompt for cover letters, CV edits, or answers. Claude output must be reviewed and pasted back by you; there is no model API key in the browser. Every text box is editable and has an approval checkbox. Editing approved text withdraws the approval.
- Designed for desktop browsers. It still adapts to smaller windows, has light and dark mode, and can be used from the keyboard.
- Your profile, saved jobs, statuses and drafts are stored **only in your browser** (localStorage). Profile backup can be exported or imported from My profile. Use **Clear data stored in this browser** in the footer to wipe them.
- The dashboard checks `jobs.json` for a daily batch and keeps sample listings if no live batch is available. UK job records are only included when the ad says sponsorship is available and the employer matches the GOV.UK Skilled Worker sponsor register. This check does not guarantee sponsorship for the vacancy.

The site never submits applications or contacts employers.

## Open the website (no installation)

After a build, open **`dist/index.html`** in a browser for the local sample experience, or use `npm run preview` to test the daily job feed. The deployed GitHub Pages site loads `jobs.json` beside the page.

## Work on the code

Requirements: [Node.js](https://nodejs.org/) 20 or newer.

```bash
cd job-desk
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. Changes to the code appear immediately.

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the site locally with live reload |
| `npm run build` | Builds the website into `dist/` |
| `npm run preview` | Serves the built site at a local address |
| `npm run fetch:jobs` | Fetches a batch using the configured source credentials |

For a manual fetch, set `RELIEFWEB_APPNAME`, `ADZUNA_APP_ID`, and `ADZUNA_APP_KEY` in your shell first. Never put real values in `.env.example` or commit a `.env` file.

## Daily job search and hosting

`.github/workflows/daily-jobs.yml` runs every day at 06:00 East Africa Time and can also be started manually from the Actions tab. It collects up to five Kenya NGO jobs from ReliefWeb, five UK sponsorship listings from Adzuna (NHS roles first, followed by other UK locations), and five Sweden/Finland listings from Adzuna. It does not pad a list when fewer qualify. ReliefWeb requires an approved app name; request one from ReliefWeb before using that connector. Adzuna requires an app ID and key.

Add the following under **Settings → Secrets and variables → Actions**. Do not send secret values in chat or commit them:

| Secret | Value |
| --- | --- |
| `RELIEFWEB_APPNAME` | Your approved ReliefWeb app name |
| `ADZUNA_APP_ID` | Your Adzuna application ID |
| `ADZUNA_APP_KEY` | Your Adzuna application key |

Then set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow deploys the static site. Profile data and application drafts remain in each browser and are not part of the deployed build. The UK sponsor register verifies that an employer appears on the official Skilled Worker list; the job listing must also mention sponsorship. Always confirm with the employer.

The app does not submit applications or contact employers. Drafts use profile text you entered or prompts you can paste into Claude. Direct Claude API generation needs a separate server-side service; never put an AI API key in the browser.

## Project structure

```
job-desk/
├─ index.html                   Page shell
├─ src/
│  ├─ main.jsx                  Entry point
│  ├─ App.jsx                   Shared state and page routing
│  ├─ styles.css                All styling (design tokens, layout, responsive rules)
│  ├─ data/sampleJobs.js        SAMPLE DATA (fictional fallback)
│  ├─ lib/
│  │  ├─ router.js              Page addresses (#/ngo-kenya, #/uk-visa, #/nordic-visa, #/search, #/job/…)
│  │  ├─ dates.js               Date formatting and "closes in" logic
│  │  ├─ jobs.js                Dedupe, filters, sorting, statuses
│  │  └─ storage.js             Browser-only persistence
│  ├─ pages/
│  │  ├─ JobsPage.jsx           Category page: filter sidebar + results
│  │  ├─ UrlSearchPage.jsx      RSS, Atom and JSON search, relevance ranking, 10-result cap
│  │  ├─ JobPage.jsx            Single job page with side panel
│  │  ├─ ApplicationsPage.jsx   My applications tracker table
│  │  └─ ProfilePage.jsx        Browser-local profile editor and backup
│  └─ components/
│     ├─ SiteHeader.jsx, SiteFooter.jsx
│     ├─ FilterBar.jsx          Filter sidebar and results toolbar
│     ├─ JobCard.jsx            Job in the results list
│     ├─ JobActions.jsx         Save / Dismiss / status controls
│     ├─ ApplicationHelper.jsx  Cover letter / CV / questions placeholders
│     └─ SponsorshipBadge.jsx, Toast.jsx, Icon.jsx
├─ .env.example                 Documented variables for later stages (no secrets)
└─ .gitignore                   Keeps secrets, CVs and personal data out of git
├─ scripts/fetch-jobs.mjs       ReliefWeb + Adzuna + sponsor-register ingestion
└─ .github/workflows/           Daily build and Pages deployment
```

## Job data shape

Each job in `src/data/sampleJobs.js` has:

`id, tab, title, employer, location, workMode, contractType, salary, postedDate, closingDate (or null), foundDate,
source, url, summary, description[], requirements[], listingSignals[], applicationQuestions[]`, and for UK jobs
`sponsorship { status: 'verified' | 'unverified', summary, evidence[] }`.

Live sources are mapped into the same shape and published as `public/jobs.json`, so the interface does not need to change.

## Privacy and safety rules (apply to all stages)

- Keep the GitHub repository **private**. Never commit `.env`, your CV or profile files. `.gitignore` excludes common document types and reserves `private/` for local files.
- API keys only ever live in server-side environment variables or a secret store, never in browser code.
- Drafts use only your profile and the job listing. Missing facts are flagged, never invented.
- Jobs come only from approved APIs, feeds or other permitted methods. No bypassing logins, CAPTCHAs, paywalls or site restrictions.
- The daily workflow publishes the app only after GitHub Pages is enabled. Job listings are public site content; the profile is not included.

## Current limits

- Daily job search needs the three Actions secrets above and Pages configured. Missing or failed feeds leave the previous job batch in place.
- The 5-job limit is per tab, not a promise that 5 suitable jobs will exist each day.
- Custom URL search only works for direct RSS, Atom or JSON feeds that permit browser CORS access; a normal job-board web page URL is not a machine-readable feed.
- Profile match indicators are keyword suggestions from your browser-local profile, not an eligibility decision.
- The GitHub Actions workflow deploys a GitHub Pages site. Pages is publicly viewable even when the source repository is private; private Pages availability depends on the GitHub plan. Do not add personal profile data to the published job feed.
- AI model integration, user accounts, a shared database, and automatic application submission are not implemented.
