import { describe, expect, it } from "vitest"
import { normalizeInternalLink } from "@/lib/internal-links"

describe("normalizeInternalLink", () => {
  it("convierte /portfolio a /trabajos", () => {
    expect(normalizeInternalLink("/portfolio")).toBe("/trabajos")
  })

  it("convierte /porfolio (typo) a /trabajos", () => {
    expect(normalizeInternalLink("/porfolio")).toBe("/trabajos")
  })

  it("deja pasar /trabajos sin cambios", () => {
    expect(normalizeInternalLink("/trabajos")).toBe("/trabajos")
  })

  it("deja pasar /disenos sin cambios", () => {
    expect(normalizeInternalLink("/disenos")).toBe("/disenos")
  })

  it("deja pasar /contact sin cambios", () => {
    expect(normalizeInternalLink("/contact")).toBe("/contact")
  })

  it("deja pasar /#about sin cambios", () => {
    expect(normalizeInternalLink("/#about")).toBe("/#about")
  })

  it("deja pasar strings vacíos sin cambios", () => {
    expect(normalizeInternalLink("")).toBe("")
  })
})
