import { describe, expect, it } from "vitest"
import { formatPrice } from "@/lib/format-price"

describe("formatPrice", () => {
  it("formatea precios enteros con separador de miles argentino", () => {
    expect(formatPrice(10000)).toBe("$10.000")
  })

  it("formatea precios pequeños sin separador", () => {
    expect(formatPrice(500)).toBe("$500")
  })

  it("formatea cero", () => {
    expect(formatPrice(0)).toBe("$0")
  })

  it("no incluye decimales", () => {
    // El precio es integer en la DB, pero por si acaso
    expect(formatPrice(1500)).not.toContain(",")
  })

  it("formatea precios grandes", () => {
    expect(formatPrice(1000000)).toBe("$1.000.000")
  })
})
