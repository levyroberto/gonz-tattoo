import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <PortfolioGallery />
      <SiteFooter />
    </main>
  )
}
