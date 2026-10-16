// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA ONLY
// Every employer, listing and link below is fictional and exists only to show
// how the interface behaves. Links point to example.org on purpose. Dates are
// generated relative to today so the samples always look current.
// In Stage 2 this file is replaced by results from approved job APIs/feeds.
// ─────────────────────────────────────────────────────────────────────────────

import { addDays, startOfToday, toISODate } from '../lib/dates.js';

export const TABS = [
  {
    id: 'ngo-kenya',
    label: 'NGO Jobs in Kenya',
    shortLabel: 'NGO · Kenya',
    blurb: 'Non-profit, INGO and development roles based in Kenya.',
  },
  {
    id: 'uk-visa',
    label: 'UK Visa Sponsorship Jobs',
    shortLabel: 'UK · Visa',
    blurb: 'UK roles where sponsorship is stated or can be checked against the sponsor register.',
  },
  {
    id: 'nordic-visa',
    label: 'Sweden & Finland Sponsorship Jobs',
    shortLabel: 'Sweden & Finland',
    blurb: 'Roles in Sweden and Finland with work permit or relocation support stated in the listing.',
  },
];

const RAW = [
  // ── NGO · Kenya ────────────────────────────────────────────────────────────
  {
    id: 'ngo-001',
    tab: 'ngo-kenya',
    title: 'Programme Manager – Youth Livelihoods',
    employer: 'Harambee Futures Initiative',
    location: 'Nairobi',
    workMode: 'Hybrid',
    contractType: 'Fixed term · 24 months',
    salary: 'Not stated',
    postedDaysAgo: 0,
    closingInDays: 14,
    source: 'ReliefWeb',
    url: 'https://example.org/sample/ngo-001',
    summary:
      'Lead a multi-county youth employment programme covering skills training, enterprise support and market linkages.',
    description: [
      'Harambee Futures Initiative is seeking a Programme Manager to lead delivery of a donor-funded youth livelihoods programme across four counties.',
      'The postholder will manage implementing partners, oversee field teams, track results against the logframe, and report to the Country Director and donor.',
    ],
    requirements: [
      "Bachelor's degree in a relevant field; Master's an advantage",
      '7+ years managing multi-site programmes or field teams',
      'Experience managing budgets and implementing partners',
      'Strong donor reporting and stakeholder management skills',
      'Fluency in English and Kiswahili',
    ],
    listingSignals: ['Senior programme management', 'Field-team leadership', 'Nairobi-based, county travel'],
    applicationQuestions: [
      'Describe a programme you managed across multiple locations. What was your role and what were the results?',
      'How have you managed underperforming implementing partners?',
      'What is your current notice period?',
    ],
  },
  {
    // Deliberate duplicate of ngo-001 from a second source, to demonstrate deduplication.
    id: 'ngo-001-dup',
    tab: 'ngo-kenya',
    title: 'Programme Manager - Youth Livelihoods',
    employer: 'Harambee Futures Initiative',
    location: 'Nairobi',
    workMode: 'Hybrid',
    contractType: 'Fixed term · 24 months',
    salary: 'Not stated',
    postedDaysAgo: 1,
    closingInDays: 14,
    source: 'Employer careers page',
    url: 'https://example.org/sample/ngo-001-careers',
    summary: '',
    description: [],
    requirements: [],
    listingSignals: [],
    applicationQuestions: [],
  },
  {
    id: 'ngo-002',
    tab: 'ngo-kenya',
    title: 'Partnerships & Resource Mobilisation Lead',
    employer: 'Coastal Resilience Trust',
    location: 'Mombasa',
    workMode: 'Hybrid',
    contractType: 'Permanent',
    salary: 'Competitive, local terms',
    postedDaysAgo: 2,
    closingInDays: 5,
    source: 'ReliefWeb',
    url: 'https://example.org/sample/ngo-002',
    summary:
      'Build the funding pipeline and corporate partnerships for a coastal climate-adaptation organisation.',
    description: [
      'Coastal Resilience Trust works with fishing and farming communities on climate adaptation along the Kenyan coast.',
      'The Partnerships Lead will develop proposals, manage donor relationships and open new private-sector partnerships.',
    ],
    requirements: [
      '6+ years in business development, partnerships or resource mobilisation',
      'Track record of successful proposals or commercial pitches',
      'Experience building relationships with corporate partners',
      'Excellent written English',
    ],
    listingSignals: ['Business development focus', 'Proposal writing', 'Private-sector partnerships'],
    applicationQuestions: [
      'Give an example of a partnership or proposal you secured. What was the value and your specific contribution?',
      'What are your salary expectations?',
    ],
  },
  {
    id: 'ngo-003',
    tab: 'ngo-kenya',
    title: 'Communications & Advocacy Manager',
    employer: 'Afya Pamoja Network',
    location: 'Nairobi',
    workMode: 'On-site',
    contractType: 'Fixed term · 12 months, renewable',
    salary: 'Not stated',
    postedDaysAgo: 4,
    closingInDays: null,
    source: 'Fuzu',
    url: 'https://example.org/sample/ngo-003',
    summary:
      'Lead external communications, campaigns and advocacy for a community health network.',
    description: [
      'Afya Pamoja Network supports community health volunteers across Kenya.',
      'The Communications & Advocacy Manager will run campaigns, manage digital channels and media relations, and support policy advocacy.',
    ],
    requirements: [
      '5+ years in communications, marketing or campaigns',
      'Experience managing social media channels and content calendars',
      'Experience planning and running campaigns with measurable results',
      'Health sector experience an advantage',
    ],
    listingSignals: ['Campaign management', 'Digital and social media', 'Closing date not stated'],
    applicationQuestions: [
      'Describe a campaign you led. How did you measure its success?',
      'Share links to up to three pieces of work you produced or managed.',
    ],
  },
  {
    id: 'ngo-004',
    tab: 'ngo-kenya',
    title: 'Monitoring, Evaluation & Learning Officer',
    employer: 'Rift Valley Water Alliance',
    location: 'Nakuru',
    workMode: 'On-site',
    contractType: 'Fixed term · 18 months',
    salary: 'Not stated',
    postedDaysAgo: 6,
    closingInDays: 10,
    source: 'ReliefWeb',
    url: 'https://example.org/sample/ngo-004',
    summary:
      'Run data collection, indicator tracking and learning reviews for a WASH programme.',
    description: [
      'The MEL Officer will design data collection tools, manage field data quality and produce monthly dashboards for programme staff.',
    ],
    requirements: [
      '3+ years in monitoring and evaluation or data management',
      'Experience with mobile data collection tools',
      'Strong Excel or data visualisation skills',
    ],
    listingSignals: ['Data and reporting', 'Field data collection'],
    applicationQuestions: ['Which data collection tools have you used, and for what?'],
  },
  {
    id: 'ngo-005',
    tab: 'ngo-kenya',
    title: 'Market Systems Development Specialist',
    employer: 'Green Value Chains Kenya',
    location: 'Kisumu',
    workMode: 'Hybrid',
    contractType: 'Fixed term · 36 months',
    salary: 'Not stated',
    postedDaysAgo: 9,
    closingInDays: 21,
    source: 'Employer careers page',
    url: 'https://example.org/sample/ngo-005',
    summary:
      'Strengthen agricultural value chains by working with distributors, retailers and agro-dealers.',
    description: [
      'The Specialist will analyse distribution channels, design interventions with private-sector actors and track uptake by smallholder farmers.',
    ],
    requirements: [
      '5+ years in market systems, distribution or private-sector development',
      'Understanding of retail and distribution networks in East Africa',
      'Experience designing and monitoring market interventions',
    ],
    listingSignals: ['Distribution and retail networks', 'Private-sector engagement'],
    applicationQuestions: [
      'Describe your experience working with distributors or retail networks.',
    ],
  },

  // ── UK · Visa sponsorship ──────────────────────────────────────────────────
  {
    id: 'uk-001',
    tab: 'uk-visa',
    title: 'Field Marketing Manager',
    employer: 'Northbridge Consumer Brands Ltd',
    location: 'Manchester',
    workMode: 'Hybrid',
    contractType: 'Permanent',
    salary: '£48,000 – £55,000',
    postedDaysAgo: 0,
    closingInDays: 18,
    source: 'Reed',
    url: 'https://example.org/sample/uk-001',
    summary:
      'Own in-store activation and field marketing programmes for a portfolio of FMCG brands.',
    description: [
      'Northbridge Consumer Brands is hiring a Field Marketing Manager to plan and run retail activations, manage agency partners and report on campaign ROI.',
    ],
    requirements: [
      'Experience in field marketing, trade marketing or BTL activation',
      'Experience managing agencies and budgets',
      'Strong commercial reporting skills',
    ],
    listingSignals: ['BTL / field marketing', 'Agency management', 'Salary stated in listing'],
    applicationQuestions: [
      'Do you have the right to work in the UK, or will you require sponsorship?',
      'Describe a retail activation you planned. What were the commercial results?',
    ],
    sponsorship: {
      status: 'verified',
      summary: 'The listing explicitly states that Skilled Worker sponsorship is available.',
      evidence: [
        {
          kind: 'listing',
          label: 'Stated in listing',
          detail: 'Listing text: "We are able to offer Skilled Worker visa sponsorship for this role." (sample text)',
        },
        {
          kind: 'register',
          label: 'Sponsor register check',
          detail: 'Employer name matches an entry on the register of licensed sponsors (sample check).',
        },
      ],
    },
  },
  {
    id: 'uk-002',
    tab: 'uk-visa',
    title: 'Trade Marketing Manager',
    employer: 'Pennine Foods plc',
    location: 'Leeds',
    workMode: 'On-site',
    contractType: 'Permanent',
    salary: '£45,000 + bonus',
    postedDaysAgo: 3,
    closingInDays: 6,
    source: 'Adzuna',
    url: 'https://example.org/sample/uk-002',
    summary:
      'Lead shopper and trade marketing plans across major UK grocery retailers.',
    description: [
      'Pennine Foods is looking for a Trade Marketing Manager to build customer-specific activation plans and promotional calendars with key accounts.',
    ],
    requirements: [
      'Trade or shopper marketing experience in FMCG',
      'Experience working with modern trade / key accounts',
      'Strong analytical skills',
    ],
    listingSignals: ['Trade marketing', 'Modern trade / key accounts'],
    applicationQuestions: ['Why are you interested in Pennine Foods?'],
    sponsorship: {
      status: 'verified',
      summary: 'The listing states that sponsorship is available.',
      evidence: [
        {
          kind: 'listing',
          label: 'Stated in listing',
          detail: 'Listing text: "Visa sponsorship available for the right candidate." (sample text)',
        },
        {
          kind: 'register',
          label: 'Sponsor register check',
          detail: 'Employer name matches an entry on the register of licensed sponsors (sample check).',
        },
      ],
    },
  },
  {
    id: 'uk-003',
    tab: 'uk-visa',
    title: 'Partnerships Manager',
    employer: 'Thameside Development Charity',
    location: 'London',
    workMode: 'Hybrid',
    contractType: 'Permanent',
    salary: '£42,000 – £46,000',
    postedDaysAgo: 5,
    closingInDays: 12,
    source: 'Reed',
    url: 'https://example.org/sample/uk-003',
    summary:
      'Grow corporate and foundation partnerships for an international development charity.',
    description: [
      'The Partnerships Manager will manage a portfolio of corporate partners and lead new-business pitches.',
    ],
    requirements: [
      'Experience in partnerships, account management or business development',
      'Experience writing proposals and pitches',
    ],
    listingSignals: ['Partnerships', 'International development'],
    applicationQuestions: ['Describe a partnership you grew. What did you do and what changed?'],
    sponsorship: {
      status: 'unverified',
      summary:
        'The employer appears on the sponsor register, but the listing does not say sponsorship is offered for this role.',
      evidence: [
        {
          kind: 'register',
          label: 'Sponsor register check',
          detail: 'Employer name matches an entry on the register of licensed sponsors (sample check).',
        },
        {
          kind: 'gap',
          label: 'Not confirmed',
          detail: 'Listing is silent on sponsorship. A licensed sponsor may still decline to sponsor a specific role.',
        },
      ],
    },
  },
  {
    id: 'uk-004',
    tab: 'uk-visa',
    title: 'Business Development Manager',
    employer: 'Clyde Analytics Ltd',
    location: 'Glasgow',
    workMode: 'Hybrid',
    contractType: 'Permanent',
    salary: '£50,000 – £60,000',
    postedDaysAgo: 8,
    closingInDays: 25,
    source: 'Adzuna',
    url: 'https://example.org/sample/uk-004',
    summary:
      'Win new clients for a retail data and analytics consultancy.',
    description: [
      'Clyde Analytics is hiring a Business Development Manager to build a pipeline of retail and FMCG clients.',
    ],
    requirements: [
      'B2B sales or business development experience',
      'Experience selling to retail or FMCG clients an advantage',
    ],
    listingSignals: ['New business', 'Retail / FMCG clients'],
    applicationQuestions: ['What is your current notice period?'],
    sponsorship: {
      status: 'unverified',
      summary: 'The listing wording on sponsorship is conditional, and the register check found no match.',
      evidence: [
        {
          kind: 'listing',
          label: 'Ambiguous wording in listing',
          detail: 'Listing text: "Sponsorship may be considered for exceptional candidates." (sample text)',
        },
        {
          kind: 'gap',
          label: 'Sponsor register check',
          detail: 'No exact match found for this employer name on the register (sample check). Could be a different legal name.',
        },
      ],
    },
  },
  {
    id: 'uk-005',
    tab: 'uk-visa',
    title: 'Programme Officer – International Grants',
    employer: 'Avon Global Trust',
    location: 'Bristol',
    workMode: 'Hybrid',
    contractType: 'Fixed term · 24 months',
    salary: '£34,000',
    postedDaysAgo: 12,
    closingInDays: 3,
    source: 'Charity Job',
    url: 'https://example.org/sample/uk-005',
    summary:
      'Manage a portfolio of grants to partner organisations in East Africa.',
    description: [
      'The Programme Officer will manage grant agreements, monitor partner reporting and support learning visits.',
    ],
    requirements: [
      'Experience managing grants or partner relationships',
      'Knowledge of East African development context',
    ],
    listingSignals: ['East Africa focus', 'Grant management', 'Closing soon'],
    applicationQuestions: [
      'Why do you want to work in grant-making?',
      'Do you have the right to work in the UK?',
    ],
    sponsorship: {
      status: 'unverified',
      summary:
        'The listing mentions sponsorship, but the salary shown may fall below the usual Skilled Worker threshold. Check eligibility before applying.',
      evidence: [
        {
          kind: 'listing',
          label: 'Stated in listing',
          detail: 'Listing text: "We hold a sponsor licence." (sample text)',
        },
        {
          kind: 'gap',
          label: 'Salary eligibility not confirmed',
          detail: 'Stage 2 will check stated salaries against current official Skilled Worker thresholds.',
        },
      ],
    },
  },
];

/** Builds the sample job list with real dates relative to today. */
export function buildSampleJobs(today = startOfToday()) {
  return RAW.map((j) => ({
    ...j,
    isSample: true,
    postedDate: toISODate(addDays(today, -j.postedDaysAgo)),
    closingDate: j.closingInDays == null ? null : toISODate(addDays(today, j.closingInDays)),
    foundDate: toISODate(today),
  }));
}
