import { describe, expect, it } from "vitest"
import { getSectionDefinition, parseSectionContentFromForm, parseSectionLayoutFromForm } from "../../data/home-section-schema"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string | number | boolean>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, String(value))
  }
  return formData
}

// ─── hero ────────────────────────────────────────────────────────────────────

describe("parseSectionContentFromForm — hero", () => {
  const definition = getSectionDefinition("hero")!

  it("parsea todos los campos de texto", () => {
    const formData = makeFormData({
      eyebrow: "Tatuajes con carácter",
      brand_primary: "GONZ",
      brand_accent: "TATTOO",
      description: "Old school desde siempre.",
      primary_button_label: "Ver trabajos",
      primary_button_href: "/trabajos",
      secondary_button_label: "Diseños",
      secondary_button_href: "/disenos",
    })
    const content = parseSectionContentFromForm(formData, definition)

    expect(content.eyebrow).toBe("Tatuajes con carácter")
    expect(content.brandPrimary).toBe("GONZ")
    expect(content.brandAccent).toBe("TATTOO")
    expect(content.description).toBe("Old school desde siempre.")
    expect(content.primaryButtonLabel).toBe("Ver trabajos")
    expect(content.primaryButtonHref).toBe("/trabajos")
    expect(content.secondaryButtonLabel).toBe("Diseños")
    expect(content.secondaryButtonHref).toBe("/disenos")
  })

  it("recorta espacios en blanco", () => {
    const formData = makeFormData({ eyebrow: "  Hola  ", brand_primary: " GONZ " })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.eyebrow).toBe("Hola")
    expect(content.brandPrimary).toBe("GONZ")
  })

  it("devuelve string vacío para campos no enviados", () => {
    const content = parseSectionContentFromForm(new FormData(), definition)
    expect(content.eyebrow).toBe("")
    expect(content.brandPrimary).toBe("")
  })

  it("no incluye campos de imagen (target=style)", () => {
    const formData = makeFormData({ image_url: "https://example.com/img.jpg" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content).not.toHaveProperty("backgroundImage")
    expect(content).not.toHaveProperty("image_url")
  })
})

// ─── featuredPortfolio ────────────────────────────────────────────────────────

describe("parseSectionContentFromForm — featuredPortfolio", () => {
  const definition = getSectionDefinition("featuredPortfolio")!

  it("parsea campos de texto y número", () => {
    const formData = makeFormData({
      title: "Mis trabajos",
      highlighted_title: "REALIZADOS",
      eyebrow: "Galería",
      button_label: "Ver todo",
      button_href: "/trabajos",
      limit: "6",
    })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.title).toBe("Mis trabajos")
    expect(content.highlightedTitle).toBe("REALIZADOS")
    expect(content.limit).toBe(6)
  })

  it("parsea checkbox featuredOnly cuando está activado", () => {
    const formData = makeFormData({ featured_only: "on" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.featuredOnly).toBe(true)
  })

  it("featuredOnly es false si no se envía", () => {
    const content = parseSectionContentFromForm(new FormData(), definition)
    expect(content.featuredOnly).toBe(false)
  })

  it("parsea itemOrder como array de números", () => {
    const formData = makeFormData({ item_order: "3,1,2" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.itemOrder).toEqual([3, 1, 2])
  })

  it("itemOrder vacío produce array vacío", () => {
    const content = parseSectionContentFromForm(new FormData(), definition)
    expect(content.itemOrder).toEqual([])
  })

  it("filtra ids inválidos de itemOrder", () => {
    const formData = makeFormData({ item_order: "1,,abc,2" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.itemOrder).toEqual([1, 2])
  })

  it("usa fallback para limit si el valor no es entero positivo", () => {
    const formData = makeFormData({ limit: "0" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.limit).toBe(4) // numberFallback de la definición
  })

  it("parsea columnas a mostrar como layout numérico", () => {
    const formData = makeFormData({ columns_desktop: "6", layout_style: "grid" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(6)
    expect(layout.layoutStyle).toBe("grid")
  })

  it("usa fallback si las columnas a mostrar están fuera de rango", () => {
    const formData = makeFormData({ columns_desktop: "9" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(3)
  })

  it("fija bento en 3 columnas", () => {
    const formData = makeFormData({ columns_desktop: "6", layout_style: "bento-grid" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(3)
    expect(layout.layoutStyle).toBe("bento-grid")
  })

  it("fija carrusel en 3 columnas", () => {
    const formData = makeFormData({ columns_desktop: "6", layout_style: "carousel" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(3)
    expect(layout.layoutStyle).toBe("carousel")
  })

  it("fija grid ancho en 4 columnas", () => {
    const formData = makeFormData({ columns_desktop: "6", layout_style: "wide-grid" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(4)
    expect(layout.layoutStyle).toBe("wide-grid")
  })

  it("fija grunge gallery en 1 columna", () => {
    const formData = makeFormData({ columns_desktop: "6", layout_style: "grunge-gallery" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(1)
    expect(layout.layoutStyle).toBe("grunge-gallery")
  })
})

// ─── flashPreview ────────────────────────────────────────────────────────────

describe("parseSectionContentFromForm — flashPreview", () => {
  const definition = getSectionDefinition("flashPreview")!

  it("parsea campos básicos", () => {
    const formData = makeFormData({
      highlighted_title: "DISEÑOS",
      eyebrow: "Listos para tatuar",
      description: "Elegí el tuyo.",
      button_label: "Ver diseños",
      button_href: "/disenos",
      limit: "6",
    })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.highlightedTitle).toBe("DISEÑOS")
    expect(content.limit).toBe(6)
  })

  it("parsea itemOrder", () => {
    const formData = makeFormData({ item_order: "5,2,8" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.itemOrder).toEqual([5, 2, 8])
  })

  it("usa fallback de 6 para limit inválido", () => {
    const formData = makeFormData({ limit: "-1" })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.limit).toBe(6)
  })

  it("parsea columnas a mostrar como layout numérico", () => {
    const formData = makeFormData({ columns_desktop: "2", layout_style: "framed-grid" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(2)
    expect(layout.layoutStyle).toBe("framed-grid")
  })

  it("limita grilla enmarcada a 3 columnas", () => {
    const formData = makeFormData({ columns_desktop: "6", layout_style: "framed-grid" })
    const layout = parseSectionLayoutFromForm(formData, definition)
    expect(layout.columnsDesktop).toBe(3)
    expect(layout.layoutStyle).toBe("framed-grid")
  })
})

// ─── about ────────────────────────────────────────────────────────────────────

describe("parseSectionContentFromForm — about", () => {
  const definition = getSectionDefinition("about")!

  it("parsea párrafos separados por saltos de línea", () => {
    const formData = new FormData()
    formData.set("paragraphs", "Primer párrafo\nSegundo párrafo\nTercer párrafo")
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.paragraphs).toEqual(["Primer párrafo", "Segundo párrafo", "Tercer párrafo"])
  })

  it("filtra líneas vacías en párrafos", () => {
    const formData = new FormData()
    formData.set("paragraphs", "Primer párrafo\n\n\nSegundo párrafo")
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.paragraphs).toEqual(["Primer párrafo", "Segundo párrafo"])
  })

  it("parsea quote", () => {
    const formData = makeFormData({ quote: "La tinta es para siempre." })
    const content = parseSectionContentFromForm(formData, definition)
    expect(content.quote).toBe("La tinta es para siempre.")
  })
})

// ─── getSectionDefinition ────────────────────────────────────────────────────

describe("getSectionDefinition", () => {
  it("devuelve la definición para tipos válidos", () => {
    expect(getSectionDefinition("hero")).toBeDefined()
    expect(getSectionDefinition("featuredPortfolio")).toBeDefined()
    expect(getSectionDefinition("flashPreview")).toBeDefined()
    expect(getSectionDefinition("about")).toBeDefined()
    expect(getSectionDefinition("contactCta")).toBeDefined()
  })

  it("devuelve undefined para tipos inválidos", () => {
    expect(getSectionDefinition("noExiste")).toBeUndefined()
    expect(getSectionDefinition("")).toBeUndefined()
  })
})
