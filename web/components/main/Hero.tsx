"use client";

import React from "react";
import HeroContent from "@/components/sub/HeroContent";
import BitcoinWebCanvas from "@/components/main/StarBackground"; // ✅ background

export default function Hero() {
    return (
        <div className="relative h-screen w-full overflow-hidden" id="about-me">
            {/* Fixed network background at z-0 */}
            <BitcoinWebCanvas />

            {/* Foreground UI layer */}
            <div className="relative z-[30] flex h-full w-full flex-col">
                <HeroContent />
            </div>
        </div>
    );
}