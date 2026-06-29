import type { SVGProps } from 'react'

type LogoMarkProps = SVGProps<SVGSVGElement> & {
  title?: string
}

export function LogoMark({ title = 'Mindy OS', ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M31.986 5.6c12.237 0 22.134 6.774 22.134 15.168 0 6.367-5.716 11.812-13.82 14.066"
        stroke="currentColor"
        strokeWidth="5.4"
        strokeLinecap="round"
      />
      <path
        d="M31.986 58.4c-12.236 0-22.133-6.774-22.133-15.168 0-6.367 5.715-11.812 13.819-14.066"
        stroke="currentColor"
        strokeWidth="5.4"
        strokeLinecap="round"
        opacity=".56"
      />
      <path
        d="M30.91 19.275 47.064 35.43c1.419 1.418 1.419 3.731 0 5.15L40.58 47.064c-1.418 1.419-3.731 1.419-5.15 0L19.276 30.91c-1.419-1.418-1.419-3.731 0-5.15l6.484-6.484c1.418-1.419 3.731-1.419 5.15 0Z"
        fill="currentColor"
      />
      <path
        d="m29.768 21.332 12.9 12.9M23.822 27.282l12.896 12.896M29.391 35.982l6.591-6.591"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity=".9"
      />
      <path
        d="M20.198 42.566c3.31-2.824 7.335-4.34 11.822-4.34s8.512 1.516 11.822 4.34"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity=".95"
      />
      <path
        d="M16.233 32.53c8.775-3.78 22.759-3.78 31.534 0"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity=".82"
      />
    </svg>
  )
}
