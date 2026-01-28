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
            <nav className="sticky top-0 z-50 flex h-[72px] w-full items-center border-b border-border bg-card">
                <div className="container mx-auto flex items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="Chess Heatmap"
                            width={38}
                            height={38}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold tracking-tight">Chess Heatmap</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/donate"
                            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                        >
                            Donate
                        </Link>
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
                            <Github className="h-6 w-6" />
                        </a>
                        <ThemeToggle />
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
