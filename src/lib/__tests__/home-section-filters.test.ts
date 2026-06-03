import { describe, expect, it } from "vitest"

import { filterFlashDesigns, filterPortfolioItems, matchesTags } from "../../lib/home-section-filters"
import type { FlashDesign } from "../../data/flash-designs"
import type { Tattoo } from "../../data/tattoos"

// ─── Helpers de fixtures ────────────────────────────────────────────────────

function makeTattoo(overrides: Partial<Tattoo> = {}): Tattoo {
  return {
    id: 1,
    title: "Test tattoo",
    style: "Old school",
    image: "/img/test.jpg",
    isFeatured: false,
    isActive: true,
    displayOrder: 1,
    publishedDate: "2025-01-01",
    tags: [],
    ...overrides,
  }
}

function makeFlash(overrides: Partial<FlashDesign> = {}): FlashDesign {
  return {
    id: 1,
    name: "Test flash",
    price: 10000,
    image: "/img/flash.jpg",
    status: "Disponible",
    style: "Tradicional",
    size: "10x10",
    displayOrder: 1,
    isActive: true,
    tags: [],
    ...overrides,
  }
}

function makePortfolioSection(overrides: Record<string, unknown> = {}) {
  return {
    id: "home-featured-portfolio",
    type: "featuredPortfolio" as const,
    enabled: true,
    order: 20,
    content: {
      eyebrow: "",
      title: "",
      highlightedTitle: "",
      buttonLabel: "",
      buttonHref: "",
      dateFrom: "",
      dateTo: "",
      featuredOnly: false,
      filterStyle: "",
      filterTags: "",
      itemOrder: [] as number[],
      limit: 10,
      ...overrides,
    },
    layout: { variant: "carousel" as const, layoutStyle: "carousel" as const },
    style: { background: "card" as const },
  }
}

function makeFlashSection(overrides: Record<string, unknown> = {}) {
  return {
    id: "home-flash-preview",
    type: "flashPreview" as const,
    enabled: true,
    order: 30,
    content: {
      eyebrow: "",
      highlightedTitle: "",
      description: "",
      buttonLabel: "",
      buttonHref: "",
      filterStyle: "",
      filterTags: "",
      itemOrder: [] as number[],
      limit: 10,
      ...overrides,
    },
    layout: { columnsDesktop: 3 as const, columnsMobile: 2 as const, layoutStyle: "grid" as const },
    style: { background: "default" as const, frame: "paper" as const },
  }
}

// ─── matchesTags ────────────────────────────────────────────────────────────

describe("matchesTags", () => {
  it("devuelve true si no hay filtro de tags", () => {
    expect(matchesTags(["old", "color"], "")).toBe(true)
    expect(matchesTags(undefined, "")).toBe(true)
  })

  it("devuelve true si el item tiene al menos uno de los tags del filtro", () => {
    expect(matchesTags(["old school", "color"], "color, linea")).toBe(true)
  })

  it("devuelve false si el item no tiene ningún tag del filtro", () => {
    expect(matchesTags(["old school"], "linea, blackwork")).toBe(false)
  })

  it("es case-insensitive", () => {
    expect(matchesTags(["Old School"], "old school")).toBe(true)
    expect(matchesTags(["old school"], "Old School")).toBe(true)
  })

  it("ignora espacios alrededor de las comas en el filtro", () => {
    expect(matchesTags(["color"], "  color  ,  linea  ")).toBe(true)
  })

  it("devuelve true si el item no tiene tags y el filtro está vacío", () => {
    expect(matchesTags([], "")).toBe(true)
  })

  it("devuelve false si el item no tiene tags pero hay filtro", () => {
    expect(matchesTags([], "color")).toBe(false)
    expect(matchesTags(undefined, "color")).toBe(false)
  })
})

// ─── filterPortfolioItems ───────────────────────────────────────────────────

describe("filterPortfolioItems", () => {
  it("devuelve todos los items si no hay filtros", () => {
    const items = [makeTattoo({ id: 1 }), makeTattoo({ id: 2 }), makeTattoo({ id: 3 })]
    const result = filterPortfolioItems(items, makePortfolioSection())
    expect(result).toHaveLength(3)
  })

  it("respeta el límite", () => {
    const items = [1, 2, 3, 4, 5].map((id) => makeTattoo({ id }))
    const result = filterPortfolioItems(items, makePortfolioSection({ limit: 2 }))
    expect(result).toHaveLength(2)
  })

  it("filtra por featuredOnly", () => {
    const items = [
      makeTattoo({ id: 1, isFeatured: true }),
      makeTattoo({ id: 2, isFeatured: false }),
      makeTattoo({ id: 3, isFeatured: true }),
    ]
    const result = filterPortfolioItems(items, makePortfolioSection({ featuredOnly: true }))
    expect(result.map((t) => t.id)).toEqual(expect.arrayContaining([1, 3]))
    expect(result).toHaveLength(2)
  })

  it("filtra por estilo (case-insensitive)", () => {
    const items = [
      makeTattoo({ id: 1, style: "Old school" }),
      makeTattoo({ id: 2, style: "Blackwork" }),
      makeTattoo({ id: 3, style: "OLD SCHOOL" }),
    ]
    const result = filterPortfolioItems(items, makePortfolioSection({ filterStyle: "old school" }))
    expect(result.map((t) => t.id)).toEqual(expect.arrayContaining([1, 3]))
    expect(result).toHaveLength(2)
  })

  it("filtra por tags", () => {
    const items = [
      makeTattoo({ id: 1, tags: ["color", "grande"] }),
      makeTattoo({ id: 2, tags: ["blackwork"] }),
      makeTattoo({ id: 3, tags: ["color"] }),
    ]
    const result = filterPortfolioItems(items, makePortfolioSection({ filterTags: "color" }))
    expect(result.map((t) => t.id)).toEqual(expect.arrayContaining([1, 3]))
    expect(result).toHaveLength(2)
  })

  it("filtra por dateFrom", () => {
    const items = [
      makeTattoo({ id: 1, publishedDate: "2024-01-01" }),
      makeTattoo({ id: 2, publishedDate: "2025-06-01" }),
      makeTattoo({ id: 3, publishedDate: "2025-12-01" }),
    ]
    const result = filterPortfolioItems(items, makePortfolioSection({ dateFrom: "2025-01-01" }))
    expect(result.map((t) => t.id)).toEqual(expect.arrayContaining([2, 3]))
    expect(result).toHaveLength(2)
  })

  it("filtra por dateTo", () => {
    const items = [
      makeTattoo({ id: 1, publishedDate: "2024-01-01" }),
      makeTattoo({ id: 2, publishedDate: "2025-06-01" }),
      makeTattoo({ id: 3, publishedDate: "2025-12-01" }),
    ]
    const result = filterPortfolioItems(items, makePortfolioSection({ dateTo: "2025-06-01" }))
    expect(result.map((t) => t.id)).toEqual(expect.arrayContaining([1, 2]))
    expect(result).toHaveLength(2)
  })

  it("ordena por fecha descendente por defecto", () => {
    const items = [
      makeTattoo({ id: 1, publishedDate: "2024-01-01" }),
      makeTattoo({ id: 2, publishedDate: "2026-01-01" }),
      makeTattoo({ id: 3, publishedDate: "2025-01-01" }),
    ]
    const result = filterPortfolioItems(items, makePortfolioSection())
    expect(result.map((t) => t.id)).toEqual([2, 3, 1])
  })

  it("respeta itemOrder cuando está definido", () => {
    const items = [
      makeTattoo({ id: 1, publishedDate: "2026-01-01" }),
      makeTattoo({ id: 2, publishedDate: "2025-01-01" }),
      makeTattoo({ id: 3, publishedDate: "2024-01-01" }),
    ]
    // Sin itemOrder iría [1,2,3] por fecha desc; con itemOrder forzamos [3,1,2]
    const result = filterPortfolioItems(items, makePortfolioSection({ itemOrder: [3, 1, 2] }))
    expect(result.map((t) => t.id)).toEqual([3, 1, 2])
  })

  it("combina múltiples filtros", () => {
    const items = [
      makeTattoo({ id: 1, isFeatured: true, style: "Old school", tags: ["color"] }),
      makeTattoo({ id: 2, isFeatured: false, style: "Old school", tags: ["color"] }),
      makeTattoo({ id: 3, isFeatured: true, style: "Blackwork", tags: ["color"] }),
      makeTattoo({ id: 4, isFeatured: true, style: "Old school", tags: ["blackwork"] }),
    ]
    const result = filterPortfolioItems(
      items,
      makePortfolioSection({ featuredOnly: true, filterStyle: "old school", filterTags: "color" })
    )
    expect(result.map((t) => t.id)).toEqual([1])
  })

  it("devuelve array vacío si no hay coincidencias", () => {
    const items = [makeTattoo({ id: 1, style: "Blackwork" })]
    const result = filterPortfolioItems(items, makePortfolioSection({ filterStyle: "fineline" }))
    expect(result).toHaveLength(0)
  })
})

// ─── filterFlashDesigns ─────────────────────────────────────────────────────

describe("filterFlashDesigns", () => {
  it("devuelve todos los items si no hay filtros", () => {
    const items = [makeFlash({ id: 1 }), makeFlash({ id: 2 })]
    const result = filterFlashDesigns(items, makeFlashSection())
    expect(result).toHaveLength(2)
  })

  it("respeta el límite", () => {
    const items = [1, 2, 3, 4].map((id) => makeFlash({ id }))
    const result = filterFlashDesigns(items, makeFlashSection({ limit: 2 }))
    expect(result).toHaveLength(2)
  })

  it("filtra por estilo (case-insensitive)", () => {
    const items = [
      makeFlash({ id: 1, style: "Tradicional" }),
      makeFlash({ id: 2, style: "Old school" }),
      makeFlash({ id: 3, style: "TRADICIONAL" }),
    ]
    const result = filterFlashDesigns(items, makeFlashSection({ filterStyle: "tradicional" }))
    expect(result.map((f) => f.id)).toEqual(expect.arrayContaining([1, 3]))
    expect(result).toHaveLength(2)
  })

  it("filtra por tags", () => {
    const items = [
      makeFlash({ id: 1, tags: ["animal", "color"] }),
      makeFlash({ id: 2, tags: ["floral"] }),
      makeFlash({ id: 3, tags: ["animal"] }),
    ]
    const result = filterFlashDesigns(items, makeFlashSection({ filterTags: "animal" }))
    expect(result.map((f) => f.id)).toEqual(expect.arrayContaining([1, 3]))
    expect(result).toHaveLength(2)
  })

  it("respeta itemOrder", () => {
    const items = [makeFlash({ id: 1 }), makeFlash({ id: 2 }), makeFlash({ id: 3 })]
    const result = filterFlashDesigns(items, makeFlashSection({ itemOrder: [3, 1, 2] }))
    expect(result.map((f) => f.id)).toEqual([3, 1, 2])
  })

  it("items sin itemOrder mantienen el orden original", () => {
    const items = [makeFlash({ id: 10 }), makeFlash({ id: 5 }), makeFlash({ id: 8 })]
    const result = filterFlashDesigns(items, makeFlashSection())
    expect(result.map((f) => f.id)).toEqual([10, 5, 8])
  })
})
