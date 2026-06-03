/**
 * PrimaryButton — botón rojo sólido.
 * Uso: acción principal de una pantalla (header CTA, hero).
 */

import Link from "next/link"
import type { ReactNode } from "react"

const CLIP_PATH = "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)"

type Size = "sm" | "md" | "lg"

const sizeClasses: Record<Size, string> = {
  sm: "px-6 py-2 text-xs tracking-[4px]",
  md: "px-8 py-3 text-sm tracking-[5px]",
  lg: "px-8 py-4 text-lg tracking-widest",
}

const BASE =
  "inline-block font-sans uppercase transition-all duration-300 bg-primary text-primary-foreground hover:shadow-[0_0_20px_oklch(0.55_0.16_50/0.4),0_0_40px_oklch(0.45_0.18_25/0.2)]"

type PrimaryButtonProps = {
  children: ReactNode
  size?: Size
  className?: string
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
)

export function PrimaryButton({ children, size = "md", className = "", href, onClick }: PrimaryButtonProps) {
  const classes = [BASE, sizeClasses[size], className].filter(Boolean).join(" ")

  if (href) {
    return (
      <Link href={href} className={classes} style={{ clipPath: CLIP_PATH }}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} style={{ clipPath: CLIP_PATH }}>
      {children}
    </button>
  )
}
