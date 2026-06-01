import { HomeSectionRenderer } from "@/components/home/home-section-renderer"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getFeaturedFlashDesigns, getFeaturedPortfolioItems, getGlobalFooterSection, getHomeSections, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [featuredTattoos, featuredFlashDesigns, settings, sections, footer] = await Promise.all([
    getFeaturedPortfolioItems(),
    getFeaturedFlashDesigns(),
    getSiteSettings(),
    getHomeSections(),
    getGlobalFooterSection(),
  ])

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
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
