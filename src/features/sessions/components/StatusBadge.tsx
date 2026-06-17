import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { SessionStatus } from '../types'
import { SESSION_STATUS_LABELS, SESSION_STATUS_TONES } from '../utils/format'

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        SESSION_STATUS_TONES[status],
      )}
    >
      {SESSION_STATUS_LABELS[status]}
    </Badge>
  )
}
