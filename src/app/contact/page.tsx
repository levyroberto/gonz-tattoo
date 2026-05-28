import { ContactPageContent } from "@/components/contact/contact-page-content"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <ContactPageContent />
      <SiteFooter />
    </main>
  )
}
