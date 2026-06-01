import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AdminDesignsSection } from "@/components/admin/admin-content-sections"
import { AdminPageShell } from "@/components/admin/admin-page-shell"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminDashboardContent } from "@/lib/supabase/content"

export default async function AdminDisenosPage() {
  await requireAdmin()
  const { flashItems } = await getAdminDashboardContent()

  return (
    <AdminPageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contenido</p>
          <h1 className="text-4xl tracking-wide md:text-5xl">Diseños</h1>
          <p className="max-w-2xl text-muted-foreground">
            Cargá, editá, ordená y ocultá diseños flash, cuadros u objetos disponibles.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft aria-hidden="true" />
            Volver al admin
          </Link>
        </Button>
      </div>

      <AdminDesignsSection flashItems={flashItems} />
    </AdminPageShell>
  )
}
