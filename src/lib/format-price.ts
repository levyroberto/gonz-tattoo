export function formatPrice(price: number) {
  const formattedPrice = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(price)

  return `$${formattedPrice}`
}
