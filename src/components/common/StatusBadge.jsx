import { Badge } from './Badge'

export function StatusBadge({ status }) {
  const tone = status?.is_closed
    ? 'neutral'
    : status?.system_key === 'new'
      ? 'blue'
      : status?.system_key === 'practice'
        ? 'violet'
        : 'success'

  return <Badge tone={tone}>{status?.name || status?.system_key || 'Senza stato'}</Badge>
}
