// Barrel de re-exportación — sin "use server" porque cada módulo ya lo declara.
export { loginAdmin, logoutAdmin } from "@/app/admin/actions/auth"
export { updateSiteSettings } from "@/app/admin/actions/settings"
export {
  createTattoo,
  updateTattoo,
  deleteTattoo,
  reorderTattoos,
  createSaleableArtwork,
  updateSaleableArtwork,
  deleteSaleableArtwork,
  reorderSaleableArtworks,
} from "@/app/admin/actions/artworks"
export {
  updateHomeSectionEnabled,
  reorderHomeSections,
  createHomeSection,
  deleteHomeSection,
  updateHomeSectionContent,
  updateFooterSectionContent,
  updatePageSectionContent,
} from "@/app/admin/actions/sections"
