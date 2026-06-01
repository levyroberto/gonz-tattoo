import Link from "next/link"
import { LogOut } from "lucide-react"
import type { ReactNode } from "react"

import { logoutAdmin } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type AdminPageShellProps = {
  children: ReactNode
}

export function AdminPageShell({ children }: AdminPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="text-2xl tracking-wider">
            <span>GONZ</span>
            <span className="text-primary"> TATTOO</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin">Admin</Link>
            </Button>
            <form action={logoutAdmin}>
              <Button variant="outline" type="submit">
                <LogOut aria-hidden="true" />
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8">{children}</section>
    </main>
  )
}
