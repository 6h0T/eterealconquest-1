"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface ClassModalProps {
  title: string
  description: string
  imageSrc: string
  videoSrc?: string
  vimeoEmbed?: string
}

export default function ClassModal({ title, description, imageSrc, videoSrc, vimeoEmbed }: ClassModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Card that opens the modal */}
      <div
        className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl md:text-2xl font-bold gold-gradient-text mb-2">{title}</h3>
          <p className="text-gold-100 text-sm line-clamp-2">{description}</p>
        </div>

        {/* Play button indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border-2 border-gold-500/50 shadow-lg transform transition-transform hover:scale-110">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gold-400"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Modal with two columns */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[1000px] bg-black/90 border-gold-600/30 text-gold-100 p-0 overflow-hidden"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left Column: Description */}
            <div className="flex flex-col justify-center">
              <DialogTitle className="text-2xl font-bold gold-gradient-text mb-4">{title}</DialogTitle>
              <div className="prose prose-invert prose-gold">
                <p className="text-gold-100 leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Right Column: Video */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gold-500/20">
              {vimeoEmbed ? (
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: vimeoEmbed }} />
              ) : videoSrc ? (
                <video src={videoSrc} className="w-full h-full object-cover" controls autoPlay loop />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/50">
                  <p className="text-gold-300">Video no disponible</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
