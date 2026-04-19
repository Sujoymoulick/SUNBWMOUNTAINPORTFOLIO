"use client"
import React, { useEffect, useRef } from "react"

const COLORS = ["#ffffff", "#e0e0e0", "#c0c0c0", "#909090", "#707070"];
const PIXEL_SIZE = 12
const TRAIL_LENGTH = 40
const FADE_SPEED = 0.04

interface Pixel {
  x: number
  y: number
  opacity: number
  age: number
  color: string
}

export function PixelCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef<Pixel[]>([])
  const lastPositionRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY

      const dx = x - lastPositionRef.current.x
      const dy = y - lastPositionRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > PIXEL_SIZE) {
        const newPixel: Pixel = {
          x,
          y,
          opacity: 1,
          age: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }
        pixelsRef.current.push(newPixel)
        if (pixelsRef.current.length > TRAIL_LENGTH) {
          pixelsRef.current.shift()
        }
        lastPositionRef.current = { x, y }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      pixelsRef.current = pixelsRef.current.filter((pixel) => {
        pixel.opacity -= FADE_SPEED
        pixel.age += 1
        
        if (pixel.opacity <= 0) return false

        const sizeMultiplier = Math.max(0.3, 1 - pixel.age / 40)
        const currentSize = PIXEL_SIZE * sizeMultiplier

        ctx.globalAlpha = pixel.opacity
        ctx.fillStyle = pixel.color
        ctx.fillRect(
          pixel.x - currentSize / 2,
          pixel.y - currentSize / 2,
          currentSize,
          currentSize
        )

        return true
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)
    resize()
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
