// Barrel de re-exportación — sin "use server" porque cada módulo ya lo declara.
export { loginAdmin, logoutAdmin } from "@/app/admin/actions/auth"
export { updateSiteSettings } from "@/app/admin/actions/settings"
export {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
} from "@/app/admin/actions/portfolio"
export {
  createFlashDesign,
  updateFlashDesign,
  deleteFlashDesign,
  reorderFlashDesigns,
} from "@/app/admin/actions/flash"
export {
  updateHomeSectionEnabled,
  reorderHomeSections,
  createHomeSection,
  deleteHomeSection,
  updateHomeSectionContent,
  updateFooterSectionContent,
  updatePageSectionContent,
} from "@/app/admin/actions/sections"
