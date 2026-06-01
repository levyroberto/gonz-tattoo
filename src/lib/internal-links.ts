export function normalizeInternalLink(value: string) {
  if (value === "/portfolio" || value === "/porfolio") {
    return "/trabajos"
  }

  return value
}
