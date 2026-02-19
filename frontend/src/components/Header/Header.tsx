"use client";
import React from "react";
import Link from "next/link";
import { useThemeStore } from "../../Zustand_Store/ThemeStore";

const Header = () => {
  const { primaryColor } = useThemeStore();

  return (
    <nav className="fixed bg-black w-full z-50 top-0 start-0 py-6 px-12 transition-all duration-300">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span
            className="self-center text-2xl font-normal whitespace-nowrap select-none"
            style={{
              fontFamily: "Futurism",
              color: primaryColor,
              letterSpacing: "-0.1em",
            }}
          >
            R E P L A Y
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-16">
          {["Your Projects", "Pricing", "About Us"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(" ", "-")}`}
              className="text-lg font-medium hover:opacity-70 transition-opacity"
              style={{ fontFamily: "Futura", color: primaryColor }}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-10">
          <Link
            href="/register"
            className="text-lg font-medium hover:opacity-70 transition-opacity hidden md:block"
            style={{ fontFamily: "Futura", color: primaryColor }}
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="font-bold rounded-md text-lg px-5 py-2 text-center transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: primaryColor,
              color: "#000000",
              fontFamily: "Futura",
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
