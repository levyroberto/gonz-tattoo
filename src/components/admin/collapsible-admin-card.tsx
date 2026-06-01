import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

type CollapsibleAdminCardProps = {
  title: string
  description: string
  children: ReactNode
}

export function CollapsibleAdminCard({ title, description, children }: CollapsibleAdminCardProps) {
  return (
    <Card className="rounded-lg border border-border/70 py-0">
      <details className="group/details">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
          <div className="grid gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <ChevronDown
            className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform group-open/details:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <CardContent className="pb-4">{children}</CardContent>
      </details>
    </Card>
  )
}
