interface AltSectionDividerProps {
  className?: string
  inverted?: boolean
}

export function AltSectionDivider({ className = "", inverted = false }: AltSectionDividerProps) {
  return (
    <div
      className={`${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "65px", // Reduced height
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        overflow: "visible",
        background: "transparent",
        margin: 0,
        padding: 0,
        zIndex: 20,
        marginTop: "-32.5px", // Position exactly half above
        marginBottom: "-32.5px", // Position exactly half below
      }}
    >
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIVISORMU123-gggpDZZbKBBPQ6LpioUQkzgfgtift6.png"
        alt="Section divider"
        className={`${inverted ? "rotate-180" : ""}`}
        style={{
          width: "100%",
          maxWidth: "2400px",
          height: "auto",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0px 0px 5px rgba(255, 215, 0, 0.3))",
          background: "transparent",
        }}
      />
    </div>
  )
}
