"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"

interface CircularGalleryProps {
  items: { image: string; text: string }[]
  radius?: number
  itemSize?: number
  bend?: number
  textColor?: string
  font?: string
}

const itemVariants = {
  enter: (props: { index: number }) => ({
    x: 0,
    y: 0,
    opacity: 1,
    zIndex: props.index,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
  active: {
    zIndex: 10,
    scale: 1.2,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
  exit: {
    x: 0,
    y: 0,
    opacity: 0,
    zIndex: 0,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
}

const CircularGallery = ({
  items,
  radius = 150,
  itemSize = 100,
  bend = 0.3,
  textColor = "#fff",
  font = "bold 16px sans-serif",
}: CircularGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

  const itemAngle = 360 / items.length
  const adjustedBend = Math.min(Math.abs(bend), 1) * 100

  const getItemStyle = useCallback(
    (i: number) => {
      const angle = (i * itemAngle + dragOffset) * (Math.PI / 180)
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      const rotate = bend * Math.cos(angle) * 30

      return {
        x: `${x}px`,
        y: `${y}px`,
        rotate: `${rotate}deg`,
        zIndex: 5 - Math.abs(i),
        scale: 1 - Math.abs(bend * Math.cos(angle) * 0.2),
        opacity: 1 - Math.abs(bend * Math.cos(angle) * 0.5),
      }
    },
    [radius, itemAngle, dragOffset, bend],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dragDistance = e.clientX - dragStart
    setDragOffset((prevOffset) => prevOffset + dragDistance * 0.1)
    setDragStart(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const element = galleryRef.current
    if (!element) return

    element.addEventListener("mousedown", handleMouseDown)
    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseup", handleMouseUp)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousedown", handleMouseDown)
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseup", handleMouseUp)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div className="circular-gallery-container">
      <div className="circular-gallery" ref={galleryRef}>
        {items.map((item, i) => {
          const style = getItemStyle(i)
          return (
            <motion.div
              key={i}
              className="circular-gallery-item"
              style={{
                width: itemSize,
                height: itemSize,
                left: `calc(50% - ${itemSize / 2}px)`,
                top: `calc(50% - ${itemSize / 2}px)`,
                ...style,
              }}
            >
              <img src={item.image || "/placeholder.svg"} alt={item.text} />
              <span style={{ color: textColor, font: font }}>{item.text}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default CircularGallery
