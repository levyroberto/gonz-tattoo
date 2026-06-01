"use client"

import { useCallback, useEffect, useRef } from "react"

const RECENT_SCROLL_WINDOW_MS = 250

export function useLightboxOpenGuard() {
  const lastScrollAtRef = useRef(0)

  useEffect(() => {
    function handleScroll() {
      lastScrollAtRef.current = Date.now()
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return useCallback(() => Date.now() - lastScrollAtRef.current > RECENT_SCROLL_WINDOW_MS, [])
}
