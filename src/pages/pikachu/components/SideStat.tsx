type SideStatProps = {
  label: string
  value: string
}

export function SideStat({ label, value }: SideStatProps) {
  return (
    <div className="flex justify-between gap-2 text-center">
      <div className="text-sm font-semibold leading-tight text-[#ffdd2f]">{label}</div>
      <div className="mt-1 font-black leading-none text-[#ffdd2f]">{value}</div>
    </div>
  )
}
