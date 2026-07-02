import type { LucideIcon } from 'lucide-react'

type ArcadeButtonProps = {
  label?: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  badge?: number
}

export function ArcadeButton({ icon: Icon, onClick, label, disabled, badge }: ArcadeButtonProps) {
  return (
    <button
      type="button"
      className="mb-2 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#995018]/80 bg-[#421607]/75 px-2 py-2 text-xs font-black text-[#ffc400] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-[#562008] disabled:cursor-not-allowed disabled:opacity-45 lg:min-h-[2.5rem] lg:px-3 lg:py-2 lg:text-[13px] xl:min-h-11 xl:px-3.5 xl:py-3 xl:text-sm"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative inline-flex shrink-0">
        <Icon className="h-4 w-4 lg:h-[1.125rem] lg:w-[1.125rem]" aria-hidden="true" />
        {badge !== undefined ? (
          <span className="absolute -right-4 -top-4 inline-flex min-w-4 items-center justify-center rounded-full bg-[#ffdd2f] px-1 text-[10px] text-[#3b1406]">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  )
}
