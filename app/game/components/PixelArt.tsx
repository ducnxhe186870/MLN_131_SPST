"use client";

/* ═══════════════════════════════════════════════════════════════════ */
/*  PIXEL ART COMPONENTS (SVG)                                         */
/* ═══════════════════════════════════════════════════════════════════ */

export function PixelHeart({ filled }: { filled: boolean }) {
  return (
    <div
      className="inline-block w-5 h-5 relative"
      style={{ imageRendering: "pixelated" }}
    >
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {filled ? (
          <>
            <rect x="2" y="1" width="4" height="2" fill="#ff2222" />
            <rect x="8" y="1" width="4" height="2" fill="#ff2222" />
            <rect x="1" y="3" width="6" height="2" fill="#ff2222" />
            <rect x="7" y="3" width="6" height="2" fill="#ff2222" />
            <rect x="0" y="5" width="14" height="2" fill="#ff2222" />
            <rect x="1" y="7" width="12" height="2" fill="#cc0000" />
            <rect x="2" y="9" width="10" height="2" fill="#cc0000" />
            <rect x="3" y="11" width="8" height="2" fill="#990000" />
            <rect x="4" y="13" width="6" height="1" fill="#990000" />
            <rect x="5" y="14" width="4" height="1" fill="#660000" />
          </>
        ) : (
          <>
            <rect x="2" y="1" width="4" height="2" fill="#333" />
            <rect x="8" y="1" width="4" height="2" fill="#333" />
            <rect x="1" y="3" width="6" height="2" fill="#222" />
            <rect x="7" y="3" width="6" height="2" fill="#222" />
            <rect x="0" y="5" width="14" height="2" fill="#222" />
            <rect x="1" y="7" width="12" height="2" fill="#1a1a1a" />
            <rect x="2" y="9" width="10" height="2" fill="#1a1a1a" />
            <rect x="3" y="11" width="8" height="2" fill="#111" />
            <rect x="4" y="13" width="6" height="1" fill="#111" />
            <rect x="5" y="14" width="4" height="1" fill="#0a0a0a" />
          </>
        )}
      </svg>
    </div>
  );
}

export function PixelStar({
  filled,
  size = 28,
}: {
  filled: boolean;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="7" y="0" width="2" height="2" fill={filled ? "#FFD700" : "#333"} />
      <rect x="6" y="2" width="4" height="2" fill={filled ? "#FFD700" : "#333"} />
      <rect x="0" y="4" width="16" height="2" fill={filled ? "#FFC107" : "#2a2a2a"} />
      <rect x="2" y="6" width="12" height="2" fill={filled ? "#FFD700" : "#333"} />
      <rect x="3" y="8" width="10" height="2" fill={filled ? "#FFA000" : "#2a2a2a"} />
      <rect x="2" y="10" width="4" height="2" fill={filled ? "#FF8F00" : "#222"} />
      <rect x="10" y="10" width="4" height="2" fill={filled ? "#FF8F00" : "#222"} />
      <rect x="1" y="12" width="3" height="2" fill={filled ? "#E65100" : "#1a1a1a"} />
      <rect x="12" y="12" width="3" height="2" fill={filled ? "#E65100" : "#1a1a1a"} />
      <rect x="0" y="14" width="2" height="2" fill={filled ? "#BF360C" : "#111"} />
      <rect x="14" y="14" width="2" height="2" fill={filled ? "#BF360C" : "#111"} />
    </svg>
  );
}

export function PixelCharacter({
  state,
}: {
  state: "idle" | "happy" | "hurt" | "victory";
}) {
  const uniformColor = state === "hurt" ? "#ff4444" : "#4A5D23";
  const uniformDark = state === "hurt" ? "#cc3333" : "#3a4d18";
  const helmetColor = state === "hurt" ? "#cc3333" : "#5A6D33";
  const faceColor = "#FFD5A0";
  const eyeColor = "#1a1a2e";

  return (
    <div
      className={`relative ${
        state === "idle"
          ? "pixel-idle"
          : state === "hurt"
          ? "pixel-shake"
          : ""
      }`}
      style={{ imageRendering: "pixelated", width: 64, height: 80 }}
    >
      <svg viewBox="0 0 16 20" width="64" height="80">
        {/* Pith helmet (mũ cối) */}
        <rect x="4" y="0" width="8" height="1" fill={helmetColor} />
        <rect x="3" y="1" width="10" height="2" fill={helmetColor} />
        <rect x="2" y="3" width="12" height="1" fill={uniformDark} />
        {/* Red star on helmet */}
        <rect x="7" y="1" width="2" height="2" fill="#DA251D" />

        {/* Face */}
        <rect x="4" y="4" width="8" height="4" fill={faceColor} />
        {/* Eyes */}
        {state === "happy" || state === "victory" ? (
          <>
            <rect x="5" y="5" width="2" height="1" fill={eyeColor} />
            <rect x="9" y="5" width="2" height="1" fill={eyeColor} />
          </>
        ) : (
          <>
            <rect x="6" y="5" width="1" height="2" fill={eyeColor} />
            <rect x="9" y="5" width="1" height="2" fill={eyeColor} />
          </>
        )}
        {/* Mouth */}
        {state === "happy" || state === "victory" ? (
          <rect x="6" y="7" width="4" height="1" fill="#c0392b" />
        ) : state === "hurt" ? (
          <>
            <rect x="7" y="7" width="2" height="1" fill="#333" />
          </>
        ) : (
          <rect x="7" y="7" width="2" height="1" fill="#8B6914" />
        )}

        {/* Collar */}
        <rect x="4" y="8" width="8" height="1" fill={uniformDark} />
        {/* Body (olive uniform) */}
        <rect x="3" y="9" width="10" height="4" fill={uniformColor} />
        {/* Pockets */}
        <rect x="4" y="10" width="2" height="2" fill={uniformDark} />
        <rect x="10" y="10" width="2" height="2" fill={uniformDark} />
        {/* Belt */}
        <rect x="3" y="12" width="10" height="1" fill="#5C4033" />
        <rect x="7" y="12" width="2" height="1" fill="#8B7355" />

        {/* Arms */}
        {state === "victory" ? (
          <>
            <rect x="1" y="7" width="2" height="2" fill={faceColor} />
            <rect x="13" y="7" width="2" height="2" fill={faceColor} />
          </>
        ) : (
          <>
            <rect x="1" y="9" width="2" height="4" fill={uniformColor} />
            <rect x="13" y="9" width="2" height="4" fill={uniformColor} />
            <rect x="1" y="12" width="2" height="1" fill={faceColor} />
            <rect x="13" y="12" width="2" height="1" fill={faceColor} />
          </>
        )}

        {/* Legs (olive pants) */}
        <rect x="4" y="13" width="3" height="4" fill={uniformDark} />
        <rect x="9" y="13" width="3" height="4" fill={uniformDark} />
        {/* Boots */}
        <rect x="3" y="17" width="4" height="2" fill="#2a1a0a" />
        <rect x="9" y="17" width="4" height="2" fill="#2a1a0a" />

        {/* Victory: flag */}
        {state === "victory" && (
          <>
            <rect x="14" y="3" width="1" height="6" fill="#663300" />
            <rect x="10" y="1" width="5" height="3" fill="#DA251D" />
            <rect x="12" y="2" width="1" height="1" fill="#FFD700" />
          </>
        )}
      </svg>
    </div>
  );
}
