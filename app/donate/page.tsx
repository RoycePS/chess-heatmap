"use client";

import { Navbar } from "@/app/components/Navbar";
import { Copy, Check, ExternalLink, Coffee, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";

export default function DonatePage() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("chochan@upi");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header>
                <Navbar />
            </header>
            <main className="flex flex-1 flex-col items-center justify-center p-4 text-center animate-in fade-in duration-700">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                            Support the Project
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                            If you find Chess Heatmap useful, consider supporting its development. Your contribution helps keep the servers running and coffee flowing!
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                        {}
                        <a
                            href="https://ko-fi.com/chochan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex items-center space-x-4 hover:border-primary/50 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-[#FF5E5B]/10 flex items-center justify-center text-[#FF5E5B] group-hover:scale-110 transition-transform">
                                <Coffee className="h-6 w-6" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-bold">Ko-fi</h3>
                                <p className="text-sm text-muted-foreground">Buy me a coffee</p>
                            </div>
                            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>

                        {}
                        <a
                            href="https://www.paypal.com/paypalme/chochan25"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex items-center space-x-4 hover:border-primary/50 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-[#003087]/10 flex items-center justify-center text-[#003087] group-hover:scale-110 transition-transform">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-bold">PayPal</h3>
                                <p className="text-sm text-muted-foreground">Support via PayPal</p>
                            </div>
                            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>

                        {}
                        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col items-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">UPI / Google Pay</h3>
                            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg w-full justify-between group">
                                <code className="text-sm font-mono text-foreground">chochan@upi</code>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                                    aria-label="Copy UPI ID"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
