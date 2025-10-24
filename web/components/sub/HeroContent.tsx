"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MenuItem = { label: string; href?: string; hint?: string };

const MENU: MenuItem[] = [
  { label: "New Account", hint: "Start fresh", href: "/signup" },
  { label: "Load Account", hint: "Resume progress", href: "/signin" },
  { label: "Settings", hint: "Video • Audio • Keys", href: "/settings" },
  { label: "Credits", hint: "Makers & Mentors", href: "/credits" },
  { label: "Quit", hint: "Back to site", href: "/" },
];

const HeroContent = () => {
  const [index, setIndex] = useState(0);
  const [blink, setBlink] = useState(true);

  const onSelect = (item: MenuItem) => {
    if (item.href) window.location.assign(item.href);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowdown" || k === "s") setIndex((i) => (i + 1) % MENU.length);
      else if (k === "arrowup" || k === "w") setIndex((i) => (i - 1 + MENU.length) % MENU.length);
      else if (k === "enter") onSelect(MENU[index]);
    };
    const ticker = setInterval(() => setBlink((b) => !b), 700);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearInterval(ticker);
    };
  }, [index]);

  const Bg = useMemo(
      () => (
          <>
            {/* deep vignette + magenta PCB ghosting */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background:
                      "radial-gradient(1200px 900px at 70% 45%, rgba(255,0,128,0.18), rgba(0,0,0,0) 60%), radial-gradient(900px 700px at 55% 65%, rgba(0,255,255,0.12), rgba(0,0,0,0) 55%), linear-gradient(180deg, #06070a 0%, #040508 100%)",
                }}
            />
            {/* scanlines */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 mix-blend-overlay opacity-20"
                style={{
                  backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 2px, transparent 3px)",
                }}
            />
            {/* subtle noise */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.06]"
                style={{
                  backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
                }}
            />
          </>
      ),
      []
  );

  return (
      <div className="relative w-screen h-screen overflow-hidden text-white">
        {Bg}

        {/* RED SIDE PANEL */}
        <aside
            className="absolute left-0 top-0 h-full w-[380px] md:w-[460px] backdrop-blur-sm"
            style={{
              background:
                  "linear-gradient(180deg, rgba(255,0,0,0.10) 0%, rgba(255,0,0,0.05) 40%, rgba(255,0,0,0.03) 70%, rgba(255,0,0,0.02) 100%)",
              boxShadow:
                  "inset -1px 0 0 rgba(255,0,0,0.35), inset 0 1px 0 rgba(255,0,0,0.25), inset 0 -1px 0 rgba(255,0,0,0.15)",
            }}
        >
          {/* empty logo space */}
          <div className="px-8 pt-10 pb-6">
            <div className="h-16 md:h-20 w-[72%] border-2 border-red-500/30 rounded-sm" />
            <p className="mt-2 text-[10px] tracking-widest text-red-300/70">— LOGO AREA —</p>
          </div>

          {/* menu list */}
          <nav className="px-8">
            <ul className="space-y-3">
              {MENU.map((item, i) => {
                const active = i === index;
                return (
                    <li key={item.label}>
                      <button
                          onMouseEnter={() => setIndex(i)}
                          onClick={() => onSelect(item)}
                          className={`group relative w-full select-none text-left`}
                      >
                        {/* cyan focus frame */}
                        <AnimatePresence>
                          {active && (
                              <motion.span
                                  layoutId="cp2077-focus"
                                  className="absolute -inset-1 rounded-sm"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  style={{
                                    boxShadow:
                                        "0 0 0 1px rgba(0,255,255,0.9), inset 0 0 0 1px rgba(0,255,255,0.35), 0 0 16px rgba(0,255,255,0.50)",
                                    background:
                                        "linear-gradient(90deg, rgba(0,255,255,0.10), rgba(0,255,255,0.05))",
                                  }}
                              />
                          )}
                        </AnimatePresence>

                        <div
                            className={`relative z-10 flex items-center justify-between border border-red-500/20 bg-black/30 px-5 py-4 ${
                                active ? "text-cyan-100" : "text-red-200/80 hover:text-red-100"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                        <span
                            className={`text-sm tracking-wider ${
                                active ? "text-cyan-300" : "text-red-400/80"
                            }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                            <span className="text-xl font-semibold tracking-wide">{item.label}</span>
                          </div>
                          <span className="text-[11px] tracking-widest uppercase">
                        {active ? "Selected" : item.hint}
                      </span>
                        </div>
                      </button>
                    </li>
                );
              })}
            </ul>

            {/* footer meta */}
            <div className="mt-10 flex items-center justify-between text-[10px] tracking-widest text-red-300/80">
              <span>UI_VERSION 1.0.3</span>
              <span>BUILD: NIGHTCITY-STACKS</span>
            </div>
          </nav>

          {/* thin baseline */}
          <div className="absolute left-0 bottom-16 h-px w-full bg-red-500/30" />
        </aside>

        {/* RIGHT SIDE background chrome/hud */}
        <div className="absolute inset-0 left-[380px] md:left-[460px] p-6">
          {/* magenta PCB slabs */}
          <div
              aria-hidden
              className="absolute right-8 top-10 h-2/3 w-[58%] rotate-6 opacity-60"
              style={{
                background:
                    "linear-gradient(180deg, rgba(255,0,128,0.25) 0%, rgba(255,0,128,0.06) 70%, transparent 100%)",
                maskImage:
                    "repeating-linear-gradient(0deg, black 0 5px, transparent 6px 8px)",
                filter: "blur(0.4px)",
              }}
          />
          {/* cyan beam */}
          <div
              aria-hidden
              className="absolute right-0 bottom-28 h-1 w-[40%] opacity-70"
              style={{
                background:
                    "linear-gradient(90deg, rgba(0,255,255,0), rgba(0,255,255,0.8), rgba(0,255,255,0))",
                boxShadow: "0 0 24px rgba(0,255,255,0.4)",
              }}
          />

          {/* bottom-right help HUD */}
          <div className="absolute right-8 bottom-8 flex items-center gap-4">
            <div className="rounded-sm border border-red-500/40 bg-black/40 px-3 py-2 text-[11px] tracking-widest text-red-200/90">
              ↑/↓ or W/S — Navigate • Enter — Select
            </div>
            <div className="rounded-sm border border-cyan-500/40 bg-black/40 px-3 py-2 text-[11px] tracking-widest text-cyan-200/90">
              {blink ? "Select" : "\u00A0"}
            </div>
          </div>
        </div>
      </div>
  );
};

export default HeroContent;