"use client";

import { useState } from "react";
import { Copy, Check, X, Mail } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText("hey@royceps.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-sm rounded-xl bg-card border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <Mail className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">Get in touch</h2>
                        <p className="text-sm text-muted-foreground">
                            Copy the email address below to contact me.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full mt-2">
                        <code className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm font-mono text-foreground">
                            hey@royceps.com
                        </code>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            title="Copy email"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {}
            <div className="fixed inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
