"use client";

import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { ContactModal } from "./ContactModal";

export function Navbar() {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-border bg-card">
                <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:px-6 md:h-[72px] md:py-0">
                    <Link href="/" className="flex items-center gap-3 mb-3 md:mb-0">
                        <Image
                            src="/logo.png"
                            alt="Chess Heatmap"
                            width={38}
                            height={38}
                            className="rounded-lg h-8 w-8 md:h-[38px] md:w-[38px]"
                        />
                        <span className="text-lg md:text-xl font-bold tracking-tight">Chess Heatmap</span>
                    </Link>

                    <div className="flex items-center justify-between w-full md:w-auto gap-3 md:gap-4">
                        <Link
                            href="/donate"
                            className="rounded-lg md:rounded-xl bg-primary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                        >
                            Donate
                        </Link>

                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
                                title="Contact"
                            >
                                <span>Contact</span>
                            </button>
                            <a
                                href="https://github.com/royceps/chess-heatmap"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/80 transition-colors hover:text-foreground hover:translate-y-[-2px]"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5 md:h-6 md:w-6" />
                            </a>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    );
}
