"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, ChevronDown, Image as ImageIcon, Code, Link as LinkIcon, FileCode, FileImage, Loader2, Share2, Check } from "lucide-react";

interface ExportDropdownProps {
    onExportPng: () => Promise<void>;
    onExportSvg: () => void;
    onCopyEmbed: (type: 'iframe' | 'markdown' | 'html' | 'url') => void;
    isExporting: boolean;
}

export function ExportDropdown({ onExportPng, onExportSvg, onCopyEmbed, isExporting }: ExportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [position, setPosition] = useState({ top: 0, left: 0, align: 'right' as 'left' | 'right' });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const width = 224;  
            const gap = 8;

            const spaceRight = window.innerWidth - rect.left;
            const alignLeft = spaceRight < width;  



            let left = rect.left;
            if (left + width > window.innerWidth - 16) {
                left = window.innerWidth - width - 16;
            }

            let top = rect.bottom + gap;
            const height = 300;  
            if (top + height > window.innerHeight && rect.top > height) {
                top = rect.top - height + 100;  
            }

            setPosition({ top, left, align: 'left' });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleInteraction = (event: Event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleInteraction);
            document.addEventListener("touchstart", handleInteraction);  
            window.addEventListener("scroll", handleScroll, true);
            window.addEventListener("resize", handleScroll);
        }
        return () => {
            document.removeEventListener("mousedown", handleInteraction);
            document.removeEventListener("touchstart", handleInteraction);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleScroll);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) setCopiedItem(null);
    }, [isOpen]);

    const handleAction = async (action: () => void | Promise<void>) => {
        await action();
        setIsOpen(false);
    };

    const handleCopy = (type: 'iframe' | 'markdown' | 'html' | 'url', label: string) => {
        onCopyEmbed(type);
        setCopiedItem(label);
        setTimeout(() => {
            setIsOpen(false);  
        }, 1500);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-1.5 md:gap-2 rounded-lg bg-primary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-bold text-primary-foreground 
                    shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70 disabled:pointer-events-none
                `}
                disabled={isExporting}
            >
                {isExporting ? <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" /> : <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                <span>Export</span>
                <ChevronDown className={`h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        zIndex: 9999
                    }}
                    className="w-56 rounded-xl border border-border bg-popover p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="flex flex-col gap-0.5">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                            Download
                        </div>
                        <button
                            onClick={() => handleAction(onExportPng)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            Export PNG
                        </button>
                        <button
                            onClick={() => handleAction(onExportSvg)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Download className="h-4 w-4 text-orange-500" />
                            Export SVG
                        </button>

                        <div className="my-1 h-px bg-border/50" />

                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                            Share
                        </div>

                        {[
                            { type: 'url', label: 'Public URL', icon: LinkIcon },
                            { type: 'iframe', label: 'Embed Code', icon: Code },
                            { type: 'markdown', label: 'Markdown', icon: FileCode },
                            { type: 'html', label: 'HTML <img>', icon: FileImage }
                        ].map((item) => {
                            const isCopied = copiedItem === item.label;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleCopy(item.type as any, item.label)}
                                    className={`
                                        flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors
                                        ${isCopied ? "bg-green-500/10 text-green-600" : "text-foreground hover:bg-accent hover:text-accent-foreground"}
                                    `}
                                >
                                    {isCopied ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                    {isCopied ? `${item.label} Copied!` : item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
