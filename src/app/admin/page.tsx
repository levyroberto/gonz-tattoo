import Link from "next/link"
import { ArrowRight, ImagePlus, Images, PanelsTopLeft } from "lucide-react"

import { AdminPageShell } from "@/components/admin/admin-page-shell"
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
  const activePortfolioCount = portfolioItems.filter((item) => item.isActive).length
  const activeFlashCount = flashItems.filter((item) => item.isActive).length

  type SummaryCardTone = "primary" | "cyan" | "violet"
  const summaryCards: Array<{
    title: string
    value: number
    activeCount: number
    inactiveCount: number
    description: string
    icon: typeof Images
    href: string
    action: string
    tone: SummaryCardTone
  }> = [
    {
      title: "Tatuajes",
      value: stats.portfolioCount,
      activeCount: activePortfolioCount,
      inactiveCount: Math.max(stats.portfolioCount - activePortfolioCount, 0),
      description: "Trabajos publicados en la galería y secciones filtrables.",
      icon: Images,
      href: "/admin/tatuajes",
      action: "Gestionar tatuajes",
      tone: "primary",
    },
    {
      title: "Diseños",
      value: stats.flashCount,
      activeCount: activeFlashCount,
      inactiveCount: Math.max(stats.flashCount - activeFlashCount, 0),
      description: "Flash, cuadros u objetos disponibles para mostrar o consultar.",
      icon: ImagePlus,
      href: "/admin/disenos",
      action: "Gestionar diseños",
      tone: "cyan",
    },
    {
      title: "Pantallas",
      value: 4,
      activeCount: 4,
      inactiveCount: 0,
      description: "Secciones principales de Trabajos, Diseños, Sobre mí y Contacto.",
      icon: PanelsTopLeft,
      href: "/admin/pantallas",
      action: "Gestionar pantallas",
      tone: "violet",
    },
  ]

  return (
    <AdminPageShell>
        <div className="grid gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Panel de edición</p>
          <h1 className="text-4xl tracking-wide md:text-5xl">Administrador</h1>
          <p className="max-w-2xl text-muted-foreground">
            Gestioná la home, los datos generales y entrá a las pantallas específicas de contenido.
          </p>
          <p className="text-sm text-muted-foreground">
            Estado DB: {stats.isConnected ? "Supabase conectado" : "sin respuesta de Supabase"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon
            const toneClassNames: Record<SummaryCardTone, { icon: string; title: string; button: string }> = {
              primary: {
                icon: "border-amber-500/40 bg-amber-500/10 text-amber-300",
                title: "text-amber-300",
                button: "border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-background",
              },
              cyan: {
                icon: "border-cyan-500/35 bg-cyan-500/10 text-cyan-300",
                title: "text-cyan-300",
                button: "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-background",
              },
              violet: {
                icon: "border-violet-500/35 bg-violet-500/10 text-violet-300",
                title: "text-violet-300",
                button: "border-violet-500/50 text-violet-300 hover:bg-violet-500 hover:text-background",
              },
            }
            const toneClassName = toneClassNames[item.tone]

            return (
              <Card key={item.title} className="rounded-lg border border-border/70">
                <CardHeader className="grid gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex size-12 items-center justify-center rounded-md border ${toneClassName.icon}`}>
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="rounded-sm border border-border bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Contenido
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <CardDescription className="text-sm uppercase tracking-[0.22em]">{item.action}</CardDescription>
                    <CardTitle className={`text-5xl tracking-wide md:text-6xl ${toneClassName.title}`}>
                      {item.title}
                    </CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="mt-1 text-2xl text-foreground">{item.value}</p>
                    </div>
                    <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-green-400">Activos</p>
                      <p className="mt-1 text-2xl text-green-400">{item.activeCount}</p>
                    </div>
                    <div className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-destructive">Ocultos</p>
                      <p className="mt-1 text-2xl text-destructive">{item.inactiveCount}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="lg" className={`w-full justify-between ${toneClassName.button}`}>
                    <Link href={item.href}>
                      {item.action}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
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
    </AdminPageShell>
  )
}
