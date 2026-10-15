import { Icon } from './Icon.jsx';

export default function SponsorshipBadge({ sponsorship }) {
  if (!sponsorship) return null;
  const verified = sponsorship.status === 'verified';
  return (
    <span className={`badge ${verified ? 'badge--ok' : 'badge--warn'}`}>
      <Icon name={verified ? 'check' : 'alert'} size={13} />
      {verified ? 'Sponsorship stated' : 'Sponsorship unverified'}
    </span>
  );
}
