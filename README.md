# Job Desk

A personal job-search and application-assistance **website** with three sections:

1. **NGO Jobs in Kenya**
2. **UK Visa Sponsorship Jobs**
3. **My applications**: a tracker of every job you saved or gave a status

> **Stage 1 — interface only.** Every job, employer and link in this version is **fictional sample data**, clearly
> labelled on the site. There is no real job search, scheduling, login or deployment yet. Nothing is sent anywhere.

## What works in Stage 1

- Website layout: header navigation, a page per category, a full page per job, and a tracker page. Each page has its own address (for example `#/uk-visa` or `#/job/uk-001`), so the browser Back button and bookmarks work.
- Each category page shows up to 5 jobs, with a note when fewer than 5 are available. Each job shows title, employer, location, date posted, closing date (or "not stated"), source and an **Open job** link.
- **Filters** (left sidebar): job title search, location, date posted, application status. Above the results: Active / Saved / Dismissed views and sorting by newest or closing soonest.
- **Deduplication:** the same job from two sources is merged. The sample data includes one deliberate duplicate, shown as "also on …".
- **Tracking:** Save, Dismiss (with Undo), Restore, and status: Interested, Preparing application, Applied, Rejected. Setting a status also saves the job.
- **Job page:** job description, listing requirements, "Why it matches your profile", and **visa sponsorship evidence** for UK roles, labelled *Stated in listing* or *Unverified*. A side panel shows key facts and actions.
- **Application helper:** placeholder panels for cover letter, CV edits and application questions. Each lists missing information. The cover-letter skeleton contains only facts from the listing, and everything else is left in [brackets]. Every text box is editable and has an approval checkbox. Editing approved text withdraws the approval.
- Designed for desktop browsers. It still adapts to smaller windows, has light and dark mode, and can be used from the keyboard.
- Saved jobs, statuses and drafts are stored **only in your browser** (localStorage). Use **Clear data stored in this browser** in the footer to wipe them.

The site never submits applications or contacts employers.

## Open the website (no installation)

Double-click **`job-desk.html`**, or `dist/index.html` after a build. It opens in your web browser (Chrome, Edge,
Firefox or Safari). It is one self-contained file and needs no internet connection or server.

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
| `npm run build` | Builds the single-file website into `dist/index.html` |
| `npm run preview` | Serves the built site at a local address |

No `.env` file is needed for Stage 1.

## Project structure

```
job-desk/
├─ index.html                   Page shell
├─ src/
│  ├─ main.jsx                  Entry point
│  ├─ App.jsx                   Shared state and page routing
│  ├─ styles.css                All styling (design tokens, layout, responsive rules)
│  ├─ data/sampleJobs.js        SAMPLE DATA (fictional) — replaced in Stage 2
│  ├─ lib/
│  │  ├─ router.js              Page addresses (#/ngo-kenya, #/uk-visa, #/job/…, #/applications)
│  │  ├─ dates.js               Date formatting and "closes in" logic
│  │  ├─ jobs.js                Dedupe, filters, sorting, statuses
│  │  └─ storage.js             Browser-only persistence
│  ├─ pages/
│  │  ├─ JobsPage.jsx           Category page: filter sidebar + results
│  │  ├─ JobPage.jsx            Single job page with side panel
│  │  └─ ApplicationsPage.jsx   My applications tracker table
│  └─ components/
│     ├─ SiteHeader.jsx, SiteFooter.jsx
│     ├─ FilterBar.jsx          Filter sidebar and results toolbar
│     ├─ JobCard.jsx            Job in the results list
│     ├─ JobActions.jsx         Save / Dismiss / status controls
│     ├─ ApplicationHelper.jsx  Cover letter / CV / questions placeholders
│     └─ SponsorshipBadge.jsx, Toast.jsx, Icon.jsx
├─ .env.example                 Documented variables for later stages (no secrets)
└─ .gitignore                   Keeps secrets, CVs and personal data out of git
```

## Job data shape

Each job in `src/data/sampleJobs.js` has:

`id, tab, title, employer, location, workMode, contractType, salary, postedDate, closingDate (or null), foundDate,
source, url, summary, description[], requirements[], listingSignals[], applicationQuestions[]`, and for UK jobs
`sponsorship { status: 'verified' | 'unverified', summary, evidence[] }`.

Real sources in Stage 2 will be mapped into this same shape, so the interface does not need to change.

## Privacy and safety rules (apply to all stages)

- Keep the GitHub repository **private**. Never commit `.env`, your CV or profile files. `.gitignore` already excludes common names, and a `private/` folder is reserved for them.
- API keys only ever live in server-side environment variables or a secret store, never in browser code.
- Drafts use only your profile and the job listing. Missing facts are flagged, never invented.
- Jobs come only from approved APIs, feeds or other permitted methods. No bypassing logins, CAPTCHAs, paywalls or site restrictions.
- Nothing is published or deployed until you explicitly ask.

## Roadmap

- **Stage 2:** your profile; real job sources (approved APIs and feeds); a UK sponsor-register check; a database; a daily scheduled refresh; profile-based match reasons.
- **Stage 3:** AI-assisted drafting with your approval on every draft; export of approved drafts.
- **Stage 4:** private deployment with authentication, only when you ask.
