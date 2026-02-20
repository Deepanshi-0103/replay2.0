"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useThemeStore } from "../../Zustand_Store/ThemeStore";
import Link from "next/link";
import gsap from "gsap";

const Hero = () => {
  const { primaryColor } = useThemeStore();
  const heroImageRef = useRef<HTMLDivElement>(null);

  // GSAP animation for hero image
  useEffect(() => {
    if (heroImageRef.current) {
      gsap.fromTo(
        heroImageRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.5,
        }
      );

      // Add a subtle floating animation
      gsap.to(heroImageRef.current, {
        y: -10,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2,
      });
    }
  }, []);

  useEffect(() => {
    const createStar = (isInitial = false) => {
      const star = document.createElement("div");
      star.className = "star";

      const space = document.getElementById("starBg");
      const spaceHeight = space?.clientHeight || 0;
      const spaceWidth = space?.clientWidth || 0;

      // Determine initial position and direction
      const dir = Math.floor(Math.random() * 4) + 1;
      let initialX, initialY;

      if (isInitial) {
        initialX = Math.floor(Math.random() * spaceWidth) + 1;
        initialY = Math.floor(Math.random() * spaceHeight) + 1;
      } else {
        // Spawn off-screen based on direction
        const offset = 10; // Distance off-screen
        const randomEdge = Math.random() > 0.5;

        // Dir 1: Down-Right (x+, y+) -> Start Top or Left
        if (dir === 1) {
          if (randomEdge) {
            initialX = Math.random() * spaceWidth;
            initialY = -offset; // Top
          } else {
            initialX = -offset; // Left
            initialY = Math.random() * spaceHeight;
          }
        }
        // Dir 2: Up-Right (x+, y-) -> Start Bottom or Left
        else if (dir === 2) {
          if (randomEdge) {
            initialX = Math.random() * spaceWidth;
            initialY = spaceHeight + offset; // Bottom
          } else {
            initialX = -offset; // Left
            initialY = Math.random() * spaceHeight;
          }
        }
        // Dir 3: Down-Left (x-, y+) -> Start Top or Right
        else if (dir === 3) {
          if (randomEdge) {
            initialX = Math.random() * spaceWidth;
            initialY = -offset; // Top
          } else {
            initialX = spaceWidth + offset; // Right
            initialY = Math.random() * spaceHeight;
          }
        }
        // Dir 4: Up-Left (x-, y-) -> Start Bottom or Right
        else {
          if (randomEdge) {
            initialX = Math.random() * spaceWidth;
            initialY = spaceHeight + offset; // Bottom
          } else {
            initialX = spaceWidth + offset; // Right
            initialY = Math.random() * spaceHeight;
          }
        }
      }

      star.style.top = `${initialY}px`;
      star.style.left = `${initialX}px`;

      // Use primary color for all stars as requested
      star.style.backgroundColor = `${primaryColor}80`;

      let animationFrameId: number;
      let lastTime = performance.now();
      const speed = 0.02; // pixels per millisecond

      const animate = (currentTime: number) => {
        // Stop animation if star is removed from DOM to prevent memory leaks
        if (!star.isConnected) {
          return;
        }

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        const distance = speed * deltaTime;

        if (dir === 1) {
          star.style.top = `${Number(star.style.top.slice(0, -2)) + distance}px`;
          star.style.left = `${Number(star.style.left.slice(0, -2)) + distance}px`;
        } else if (dir === 2) {
          star.style.top = `${Number(star.style.top.slice(0, -2)) - distance}px`;
          star.style.left = `${Number(star.style.left.slice(0, -2)) + distance}px`;
        } else if (dir === 3) {
          star.style.top = `${Number(star.style.top.slice(0, -2)) + distance}px`;
          star.style.left = `${Number(star.style.left.slice(0, -2)) - distance}px`;
        } else {
          star.style.top = `${Number(star.style.top.slice(0, -2)) - distance}px`;
          star.style.left = `${Number(star.style.left.slice(0, -2)) - distance}px`;
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      space?.append(star);
      animationFrameId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrameId);
        star.remove();
      };
    };

    const cleanupFunctions: (() => void)[] = [];

    // Create initial stars
    for (let i = 0; i <= 30; i++) {
      const cleanup = createStar(true);
      cleanupFunctions.push(cleanup);
    }

    const checkBoundaries = () => {
      const stars = document.querySelectorAll(".star");
      const space = document.querySelector("#starBg");

      stars.forEach((star) => {
        const htmlStar = star as HTMLElement;
        const top = Number(htmlStar.style.top.slice(0, -2));
        const left = Number(htmlStar.style.left.slice(0, -2));

        const height = space?.clientHeight || 0;
        const width = space?.clientWidth || 0;

        if (top < -100 || left < 0 || top > height || left > width) {
          htmlStar.remove();
          const cleanup = createStar();
          cleanupFunctions.push(cleanup);
        }
      });
    };

    const boundaryInterval = setInterval(checkBoundaries, 50);

    return () => {
      clearInterval(boundaryInterval);
      // Clean up all stars and their animations
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [primaryColor]);

  return (
    <section className="min-h-screen flex flex-col justify-start px-6 md:px-12 lg:px-24 pt-20 relative overflow-hidden h-screen">
      <div
        id="ray"
        className="absolute left-0 z-100 -top-[75vw] w-screen h-[100vw] pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #C28383 0%, rgba(134, 45, 45, 0.00) 94%)",
        }}
      />
      {/* Background particles/stars effect (optional, implied by screenshot) */}
      <div
        id="starBg"
        className="absolute inset-0 z-80 pointer-events-none"
      ></div>

      <div className="relative max-w-[1920px] mx-auto w-full flex flex-col items-center gap-4 z-10 pt-24">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto px-4">
          <h1
            className="text-5xl md:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ fontFamily: "Futura", color: primaryColor }}
          >
            Self-Healing Pipelines, Delivered.
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl opacity-80"
            style={{ fontFamily: "Futura", color: primaryColor }}
          >
            AI-powered DevOps agent that detects, fixes, and validates code
            failures automatically.
          </p>

          <div className="flex items-center justify-center gap-8 mt-4">
            <Link
              href="/heal"
              className="font-bold rounded-md text-lg px-8 py-2 text-center transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: primaryColor,
                color: "#000000",
                fontFamily: "Futura",
              }}
            >
              Heal Your Repo
            </Link>

            <button
              type="button"
              className="font-medium text-lg hover:opacity-70 transition-opacity border border-current rounded-md px-8 py-2"
              style={{
                color: primaryColor,
                fontFamily: "Futura",
              }}
            >
              Know Features
            </button>
          </div>
        </div>

        {/* Bottom Content - Hero Image simulating dashboard */}
        <div ref={heroImageRef} className="relative w-full max-w-6xl mt-8">
          <div className="relative w-full aspect-video md:aspect-2/1 lg:aspect-2.5/1">
            <Image
              src="/images/hero2.svg"
              alt="Hero Illustration - AI DevOps Agent"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>
          {/* Optional: Add a gradient overlay at the bottom if needed to fade into next section */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
