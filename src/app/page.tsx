import { AboutSection } from "@/components/home/about-section"
import { ContactCTA } from "@/components/home/contact-cta"
import { FeaturedTattoos } from "@/components/home/featured-tattoos"
import { FlashDesignsPreview } from "@/components/home/flash-designs-preview"
import { HeroSection } from "@/components/home/hero-section"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getFeaturedFlashDesigns, getFeaturedPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [featuredTattoos, featuredFlashDesigns, settings] = await Promise.all([
    getFeaturedPortfolioItems(),
    getFeaturedFlashDesigns(),
    getSiteSettings(),
  ])

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <HeroSection />
      <FeaturedTattoos tattoos={featuredTattoos} />
      <FlashDesignsPreview designs={featuredFlashDesigns} />
      <AboutSection settings={settings} />
      <ContactCTA settings={settings} />
      <SiteFooter settings={settings} />
    </main>
  )
}
