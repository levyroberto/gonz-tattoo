"use client"

import { X } from "lucide-react"
import { type PointerEvent, type WheelEvent, useEffect, useRef, useState } from "react"

type LightboxImage = {
  image: string
  title: string
}

type TattooImageLightboxProps = {
  tattoo: LightboxImage | null
  onClose: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const DOUBLE_TAP_MS = 280
const TAP_MOVE_TOLERANCE = 8

type PointerPoint = {
  clientX: number
  clientY: number
  pointerType: string
}

function getDistance(first: PointerPoint, second: PointerPoint) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
}

export function TattooImageLightbox({ tattoo, onClose }: TattooImageLightboxProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [renderedTattoo, setRenderedTattoo] = useState<LightboxImage | null>(tattoo)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, PointerPoint>())
  const lastDragPointRef = useRef<{ x: number; y: number } | null>(null)
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null)
  const pointerStartRef = useRef<PointerPoint | null>(null)
  const didMoveRef = useRef(false)
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null)
  const scrollPositionRef = useRef(0)

  useEffect(() => {
    let frame = 0

    if (!tattoo) {
      frame = window.requestAnimationFrame(() => setIsVisible(false))
      return () => window.cancelAnimationFrame(frame)
    }

    const timeout = window.setTimeout(() => {
      setRenderedTattoo(tattoo)
      frame = window.requestAnimationFrame(() => setIsVisible(true))
    }, 80)

    return () => {
      window.clearTimeout(timeout)
      window.cancelAnimationFrame(frame)
    }
  }, [tattoo])

  useEffect(() => {
    if (tattoo || !renderedTattoo) {
      return
    }

    const timeout = window.setTimeout(() => setRenderedTattoo(null), 220)

    return () => window.clearTimeout(timeout)
  }, [renderedTattoo, tattoo])

  useEffect(() => {
    if (!renderedTattoo) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      pointersRef.current.clear()
      lastDragPointRef.current = null
      pinchStartRef.current = null
    })

    return () => window.cancelAnimationFrame(frame)
  }, [renderedTattoo])

  useEffect(() => {
    if (!renderedTattoo) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    scrollPositionRef.current = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollPositionRef.current}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.width = "100%"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollPositionRef.current)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, renderedTattoo])

  if (!renderedTattoo) {
    return null
  }

  function clampZoom(nextZoom: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom))
  }

  function clampPan(nextPan: { x: number; y: number }, nextZoom = zoom) {
    const image = imageRef.current
    const stage = stageRef.current

    if (!image || !stage || nextZoom === MIN_ZOOM) {
      return { x: 0, y: 0 }
    }

    const maxX = Math.max(0, (image.offsetWidth * nextZoom - stage.clientWidth) / 2)
    const maxY = Math.max(0, (image.offsetHeight * nextZoom - stage.clientHeight) / 2)

    return {
      x: Math.min(maxX, Math.max(-maxX, nextPan.x)),
      y: Math.min(maxY, Math.max(-maxY, nextPan.y)),
    }
  }

  function setClampedZoom(nextZoom: number) {
    const clampedZoom = clampZoom(nextZoom)

    setZoom(clampedZoom)
    setPan((currentPan) => clampPan(currentPan, clampedZoom))
  }

  function toggleZoom() {
    setClampedZoom(zoom > MIN_ZOOM ? MIN_ZOOM : 2)
  }

  function handleWheel(event: WheelEvent<HTMLImageElement>) {
    event.preventDefault()
    event.stopPropagation()

    setZoom((currentZoom) => {
      const nextZoom = clampZoom(currentZoom + (event.deltaY < 0 ? 0.18 : -0.18))

      setPan((currentPan) => clampPan(currentPan, nextZoom))

      return nextZoom
    })
  }

  function handlePointerDown(event: PointerEvent<HTMLImageElement>) {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = { clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType }

    pointersRef.current.set(event.pointerId, point)
    pointerStartRef.current = point
    didMoveRef.current = false

    const pointers = Array.from(pointersRef.current.values())

    if (pointers.length === 1) {
      lastDragPointRef.current = { x: event.clientX, y: event.clientY }
    }

    if (pointers.length === 2) {
      pinchStartRef.current = {
        distance: getDistance(pointers[0], pointers[1]),
        zoom,
      }
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLImageElement>) {
    if (!pointersRef.current.has(event.pointerId)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    const point = { clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType }

    pointersRef.current.set(event.pointerId, point)

    const pointers = Array.from(pointersRef.current.values())

    if (pointers.length === 2 && pinchStartRef.current) {
      const nextZoom = clampZoom((getDistance(pointers[0], pointers[1]) / pinchStartRef.current.distance) * pinchStartRef.current.zoom)

      setZoom(nextZoom)
      setPan((currentPan) => clampPan(currentPan, nextZoom))

      return
    }

    if (pointerStartRef.current && getDistance(pointerStartRef.current, point) > TAP_MOVE_TOLERANCE) {
      didMoveRef.current = true
    }

    if (zoom <= MIN_ZOOM) {
      return
    }

    const lastDragPoint = lastDragPointRef.current

    if (zoom > MIN_ZOOM && lastDragPoint) {
      setPan((currentPan) =>
        clampPan({
          x: currentPan.x + event.clientX - lastDragPoint.x,
          y: currentPan.y + event.clientY - lastDragPoint.y,
        })
      )
      lastDragPointRef.current = { x: event.clientX, y: event.clientY }
    }
  }

  function handlePointerEnd(event: PointerEvent<HTMLImageElement>) {
    const pointerStart = pointerStartRef.current

    event.stopPropagation()
    pointersRef.current.delete(event.pointerId)

    if (pointerStart && !didMoveRef.current && pointersRef.current.size === 0) {
      if (event.pointerType === "mouse") {
        toggleZoom()
      } else {
        const now = Date.now()
        const lastTap = lastTapRef.current
        const isDoubleTap =
          lastTap &&
          now - lastTap.time < DOUBLE_TAP_MS &&
          Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 32

        if (isDoubleTap) {
          toggleZoom()
          lastTapRef.current = null
        } else {
          lastTapRef.current = { time: now, x: event.clientX, y: event.clientY }
        }
      }
    }

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null
    }

    const remainingPointer = Array.from(pointersRef.current.values())[0]
    lastDragPointRef.current = remainingPointer ? { x: remainingPointer.clientX, y: remainingPointer.clientY } : null
    pointerStartRef.current = remainingPointer ?? null
    didMoveRef.current = false
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={renderedTattoo.title}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Cerrar imagen ampliada"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div
        ref={stageRef}
        className={`flex max-h-[86vh] w-full max-w-5xl items-center justify-center transition-all duration-200 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={renderedTattoo.image}
          alt={renderedTattoo.title}
          className={`max-h-[86vh] max-w-full touch-none object-contain drop-shadow-2xl ${
            zoom > MIN_ZOOM ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          }`}
          style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
          onClick={(event) => event.stopPropagation()}
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onWheel={handleWheel}
        />
      </div>
    </div>
  )
}
