"use client";

import { useState } from "react";
import Link from "next/link";
import { ContactModal } from "./ContactModal";

export function Footer() {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <footer className="py-8 text-center text-sm text-muted-foreground/60">
            <p className="flex items-center justify-center gap-3 flex-wrap">
                <span>&copy; <a href="https://royceps.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Royce</a></span>
                <span className="text-muted-foreground/30">|</span>
                <a href="https://github.com/royceps/chess-heatmap" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Source Code</a>
                <span className="text-muted-foreground/30">|</span>
                <Link href="/donate" className="hover:text-foreground transition-colors">Donate</Link>
                <span className="text-muted-foreground/30">|</span>
                <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                    title="Contact"
                >
                    Contact
                </button>
            </p>
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </footer>
    );
}
