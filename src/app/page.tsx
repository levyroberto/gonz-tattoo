import { HomeSectionRenderer } from "@/components/home/home-section-renderer"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getEnabledHomeSections } from "@/data/home-sections"
import { getFeaturedFlashDesigns, getFeaturedPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [featuredTattoos, featuredFlashDesigns, settings] = await Promise.all([
    getFeaturedPortfolioItems(),
    getFeaturedFlashDesigns(),
    getSiteSettings(),
  ])
  const sections = getEnabledHomeSections()

  return (
    <main className="min-h-screen">
      <SiteHeader />
      {sections.map((section) => (
        <HomeSectionRenderer
          key={section.id}
          section={section}
          featuredTattoos={featuredTattoos}
          featuredFlashDesigns={featuredFlashDesigns}
          settings={settings}
        />
      ))}
      <SiteFooter settings={settings} />
    </main>
  )
}
