import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AdminPageShell } from "@/components/admin/admin-page-shell"
import { PageSectionsManager } from "@/components/admin/page-sections-manager"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminDashboardContent } from "@/lib/supabase/content"

export default async function AdminPantallasPage() {
  await requireAdmin()
  const { pageSections } = await getAdminDashboardContent()

  return (
    <AdminPageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Configuracion</p>
          <h1 className="text-4xl tracking-wide md:text-5xl">Pantallas internas</h1>
          <p className="max-w-2xl text-muted-foreground">
            Edita la seccion principal de Trabajos, Disenos, Sobre mi y Contacto.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft aria-hidden="true" />
            Volver al admin
          </Link>
        </Button>
      </div>

      <PageSectionsManager sections={pageSections} />
    </AdminPageShell>
  )
}
