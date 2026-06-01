import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AdminTattoosSection } from "@/components/admin/admin-content-sections"
import { AdminPageShell } from "@/components/admin/admin-page-shell"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminDashboardContent } from "@/lib/supabase/content"

export default async function AdminTatuajesPage() {
  await requireAdmin()
  const { portfolioItems, tattooStyles } = await getAdminDashboardContent()

  return (
    <AdminPageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contenido</p>
          <h1 className="text-4xl tracking-wide md:text-5xl">Tatuajes</h1>
          <p className="max-w-2xl text-muted-foreground">
            Cargá, editá, ordená y ocultá trabajos publicados en la web.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft aria-hidden="true" />
            Volver al admin
          </Link>
        </Button>
      </div>

      <AdminTattoosSection portfolioItems={portfolioItems} tattooStyles={tattooStyles} />
    </AdminPageShell>
  )
}
