import Link from "next/link"
import { ImagePlus, Images, LogOut, MessageSquareText } from "lucide-react"

import { logoutAdmin } from "@/app/admin/actions"
import { AdminContentSections } from "@/components/admin/admin-content-sections"
import { FooterSectionForm } from "@/components/admin/footer-section-form"
import { HomeSectionsManager } from "@/components/admin/home-sections-manager"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminDashboardContent } from "@/lib/supabase/content"

export default async function AdminPage() {
  await requireAdmin()
  const { flashItems, footer, homeSections, portfolioItems, settings, stats, tattooStyles } = await getAdminDashboardContent()
  const tattooStyleNames = tattooStyles.length > 0
    ? tattooStyles.map((style) => style.name)
    : Array.from(new Set(portfolioItems.map((item) => item.style).filter(Boolean)))
  const flashStyleNames = Array.from(new Set(flashItems.map((item) => item.style).filter(Boolean)))

  const summaryCards = [
    {
      title: "Tatuajes",
      value: stats.portfolioCount,
      description: "Trabajos cargados",
      icon: Images,
    },
    {
      title: "Diseños",
      value: stats.flashCount,
      description: "Diseños cargados",
      icon: ImagePlus,
    },
    /*{
      title: "Consultas",
      value: stats.contactRequestCount,
      description: "Pedidos recibidos",
      icon: MessageSquareText,
    }, 
    */
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-2xl tracking-wider">
            <span>GONZ</span>
            <span className="text-primary"> TATTOO</span>
          </Link>

          <form action={logoutAdmin}>
            <Button variant="outline" type="submit">
              <LogOut aria-hidden="true" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
        <div className="grid gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Panel de edición</p>
          <h1 className="text-4xl tracking-wide md:text-5xl">Administrador</h1>
          <p className="max-w-2xl text-muted-foreground">
            Gestioná tatuajes y diseños desde Supabase. Los items inactivos quedan guardados pero no se muestran en la web pública.
          </p>
          <p className="text-sm text-muted-foreground">
            Estado DB: {stats.isConnected ? "Supabase conectado" : "sin respuesta de Supabase"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {summaryCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="rounded-lg border border-border/70">
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardDescription>{item.title}</CardDescription>
                    <CardTitle className="mt-1 text-4xl">{item.value}</CardTitle>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground">{item.description}</CardContent>
              </Card>
            )
          })}
        </div>

        <SiteSettingsForm settings={settings} />

        <HomeSectionsManager
          sections={homeSections}
          flashPreviewItems={flashItems.filter((item) => item.isActive)}
          flashStyles={flashStyleNames}
          portfolioPreviewItems={portfolioItems.filter((item) => item.isActive)}
          tattooStyles={tattooStyleNames}
        />

        <FooterSectionForm footer={footer} />

        <AdminContentSections flashItems={flashItems} portfolioItems={portfolioItems} tattooStyles={tattooStyles} />
      </section>
    </main>
  )
}
