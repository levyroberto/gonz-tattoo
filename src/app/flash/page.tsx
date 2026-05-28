import { FlashGallery } from "@/components/flash/flash-gallery"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"

export default function FlashPage() {
  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <FlashGallery />
      <SiteFooter />
    </main>
  )
}
