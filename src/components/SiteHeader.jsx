import { formatDate, startOfToday, toISODate } from '../lib/dates.js';
import { href } from '../lib/router.js';

export default function SiteHeader({ tabs, active, counts, trackedCount }) {
  const today = startOfToday();
  const links = [
    ...tabs.map((t) => ({ id: t.id, label: t.label, to: href.tab(t.id), count: counts[t.id] })),
    { id: 'search', label: 'Search a URL', to: href.search() },
    { id: 'applications', label: 'My applications', to: href.applications(), count: trackedCount },
    { id: 'profile', label: 'My profile', to: href.profile() },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <a className="brand" href={href.tab(tabs[0].id)}>
          <span className="brand__mark" aria-hidden="true">JD</span>
          <span className="brand__name">Job Desk</span>
        </a>

        <nav className="site-nav" aria-label="Main">
          <ul>
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.to} className="site-nav__link" aria-current={active === l.id ? 'page' : undefined}>
                  {l.label}
                  {l.count !== undefined && <span className="site-nav__count">{l.count}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="site-header__date">
          <span className="muted">Daily shortlist</span>
          <time dateTime={toISODate(today)}>
            {today.toLocaleDateString('en-GB', { weekday: 'short' })} {formatDate(toISODate(today))}
          </time>
        </p>
      </div>
    </header>
  );
}
