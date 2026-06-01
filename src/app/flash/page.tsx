import { redirect } from "next/navigation"

type FlashRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FlashRedirectPage({ searchParams }: FlashRedirectPageProps) {
  const params = await searchParams
  const nextParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => nextParams.append(key, item))
      return
    }

    if (value) {
      nextParams.set(key, value)
    }
  })

  const query = nextParams.toString()
  redirect(query ? `/disenos?${query}` : "/disenos")
}
