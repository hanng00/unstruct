"use client";

import type React from "react";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inset-0 min-h-screen overflow-hidden"
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter
            id="gooey-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
          isActive ? "scale-105 opacity-90" : "scale-100 opacity-100"
        }`}
        colors={[
          "#0d1f1b", // very dark green (almost black)
          "#1c4037", // deep forest green
          "#3d775f", // your primary mid green
          "#6fb199", // lighter sage
          "#d7eee9", // near-white misty green
        ]}
        speed={isActive ? 0.6 : 0.3}
      />
      <MeshGradient
        className={`absolute inset-0 w-full h-full transition-all duration-500 ease-out ${
          isActive ? "opacity-80 scale-110" : "opacity-60 scale-100"
        }`}
        colors={[
          "#0a1513", // almost black green
          "#2d5a4c", // muted mid green
          "#7db9a8", // pale fresh green
          "#eefaf7", // very light airy green
        ]}
        speed={isActive ? 0.4 : 0.2}
      />

      {/* Interactive Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out pointer-events-none ${
          isActive 
            ? "bg-gradient-to-br from-white/5 via-transparent to-white/10 backdrop-blur-[0.5px]" 
            : "bg-transparent"
        }`}
      />

      {children}
    </div>
  );
}
