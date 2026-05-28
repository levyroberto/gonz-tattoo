import { AboutSection } from "@/components/home/about-section"
import { ContactCTA } from "@/components/home/contact-cta"
import { FeaturedTattoos } from "@/components/home/featured-tattoos"
import { FlashDesignsPreview } from "@/components/home/flash-designs-preview"
import { HeroSection } from "@/components/home/hero-section"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"

export default function Home() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <HeroSection />
      <FeaturedTattoos />
      <FlashDesignsPreview />
      <AboutSection />
      <ContactCTA />
      <SiteFooter />
    </main>
  )
}
