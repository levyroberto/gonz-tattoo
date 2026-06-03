import type { FlashDesign } from "@/data/flash-designs"
import type { HomeSection } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"

function parseFilterTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

export function matchesTags(itemTags: string[] | undefined, filterTags: string) {
  const selectedTags = parseFilterTags(filterTags)

  if (selectedTags.length === 0) {
    return true
  }

  const normalizedTags = (itemTags ?? []).map((tag) => tag.toLowerCase())

  return selectedTags.some((tag) => normalizedTags.includes(tag))
}

function applySectionItemOrder<T extends { id: number }>(items: T[], itemOrder: number[] | undefined) {
  if (!itemOrder || itemOrder.length === 0) {
    return items
  }

  const orderIndex = new Map(itemOrder.map((id, index) => [id, index]))

  return items.toSorted((firstItem, secondItem) => {
    const firstIndex = orderIndex.get(firstItem.id)
    const secondIndex = orderIndex.get(secondItem.id)

    if (firstIndex === undefined && secondIndex === undefined) {
      return 0
    }

    if (firstIndex === undefined) {
      return 1
    }

    if (secondIndex === undefined) {
      return -1
    }

    return firstIndex - secondIndex
  })
}

type SectionFilterOptions = {
  applyLimit?: boolean
}

export function filterPortfolioItems(
  items: Tattoo[],
  section: Extract<HomeSection, { type: "featuredPortfolio" }>,
  options: SectionFilterOptions = {}
) {
  const shouldApplyLimit = options.applyLimit ?? true
  const filteredItems = items
    .filter((item) => !section.content.featuredOnly || item.isFeatured)
    .filter((item) => !section.content.filterStyle || (item.style ?? "").toLowerCase() === section.content.filterStyle.toLowerCase())
    .filter((item) => matchesTags(item.tags, section.content.filterTags))
    .filter((item) => !section.content.dateFrom || (item.publishedDate ?? "") >= section.content.dateFrom)
    .filter((item) => !section.content.dateTo || (item.publishedDate ?? "") <= section.content.dateTo)
    .toSorted((firstItem, secondItem) => {
      const dateCompare = (secondItem.publishedDate ?? "").localeCompare(firstItem.publishedDate ?? "")

      return dateCompare || (firstItem.displayOrder ?? 0) - (secondItem.displayOrder ?? 0)
    })

  const orderedItems = applySectionItemOrder(filteredItems, section.content.itemOrder)

  return shouldApplyLimit ? orderedItems.slice(0, section.content.limit) : orderedItems
}

export function filterFlashDesigns(
  items: FlashDesign[],
  section: Extract<HomeSection, { type: "flashPreview" }>,
  options: SectionFilterOptions = {}
) {
  const shouldApplyLimit = options.applyLimit ?? true
  const filteredItems = items
    .filter((item) => !section.content.filterStyle || (item.style ?? "").toLowerCase() === section.content.filterStyle.toLowerCase())
    .filter((item) => matchesTags(item.tags, section.content.filterTags))

  const orderedItems = applySectionItemOrder(filteredItems, section.content.itemOrder)

  return shouldApplyLimit ? orderedItems.slice(0, section.content.limit) : orderedItems
}
