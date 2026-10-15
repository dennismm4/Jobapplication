// Minimal hash-based router. Hash URLs (#/uk-visa, #/job/uk-001) work both on a
// web server and when the built file is opened directly from disk.

import { useEffect, useState } from 'react';

export const href = {
  tab: (tabId) => `#/${tabId}`,
  job: (id) => `#/job/${encodeURIComponent(id)}`,
  applications: () => '#/applications',
  profile: () => '#/profile',
};

export function parseHash(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'job' && parts[1]) return { name: 'job', id: decodeURIComponent(parts[1]), key: hash };
  if (parts[0] === 'applications') return { name: 'applications', key: hash };
  if (parts[0] === 'profile') return { name: 'profile', key: hash };
  if (parts[0] === 'uk-visa') return { name: 'list', tab: 'uk-visa', key: hash };
  return { name: 'list', tab: 'ngo-kenya', key: hash || '#/ngo-kenya' };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(to) {
  window.location.hash = to;
}
