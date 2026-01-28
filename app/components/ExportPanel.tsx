"use client";

import { useState } from "react";
import { Download, Code, Link as LinkIcon, Image as ImageIcon, Check, FileCode, FileImage, Loader2 } from "lucide-react";
import { ChessHeatmapData } from "@/app/lib/chess-data";

interface ExportPanelProps {
    chesscomUsername?: string;
    lichessUsername?: string;
    year: string;
    data: ChessHeatmapData;
    allYearsData?: Record<string, ChessHeatmapData>;
    disabled?: boolean;
    onExportPng: () => Promise<void>;
    onExportSvg: () => void;
    onCopyEmbed: (type: 'iframe' | 'markdown' | 'html' | 'url') => void;
    isExporting: boolean;
}

interface ButtonProps {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    statusKey: string;
    disabled?: boolean;
    loading?: boolean;
}

export function ExportPanel({
    chesscomUsername,
    lichessUsername,
    year,
    data,
    allYearsData,
    disabled = false,
    onExportPng,
    onExportSvg,
    onCopyEmbed,
    isExporting
}: ExportPanelProps) {
    const [copiedState, setCopiedState] = useState<string | null>(null);

    const handleAction = async (action: () => Promise<void> | void, key: string) => {
        try {
            await action();
            setCopiedState(key);
            setTimeout(() => setCopiedState(null), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopy = (type: 'iframe' | 'markdown' | 'html' | 'url', key: string) => {
        onCopyEmbed(type);
        setCopiedState(key);
        setTimeout(() => setCopiedState(null), 2000);
    };

    const Button = ({ onClick, icon: Icon, label, statusKey, disabled: btnDisabled, loading }: ButtonProps) => {
        const isSuccess = copiedState === statusKey;
        const isDisabled = btnDisabled || disabled || isExporting;

        return (
            <button
                onClick={onClick}
                disabled={isDisabled}
                className={`
                    group flex flex-row md:flex-col items-center justify-center gap-2.5 md:gap-2 
                    rounded-[16px] border bg-card p-3 md:p-4 transition-all duration-200
                    w-full
                    ${isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:-translate-y-0.5 md:hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95"
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${isSuccess
                        ? "border-green-500/50 text-green-500 bg-green-500/10"
                        : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }
                `}
                title={label}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                ) : isSuccess ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                )}
                <span className="text-xs font-semibold whitespace-nowrap">
                    {loading ? "Exporting..." : isSuccess ? "Done!" : label}
                </span>
            </button>
        );
    };

    return (
        <div className="mt-8 w-full border-t border-border/50 pt-10">
            <h3 className="mb-6 text-center text-lg font-bold tracking-tight text-foreground/80">Export & Share</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <Button
                    onClick={() => handleAction(onExportPng, "png")}
                    icon={ImageIcon}
                    label="Export PNG"
                    statusKey="png"
                    loading={isExporting}
                />
                <Button
                    onClick={() => handleAction(onExportSvg, "svg")}
                    icon={Download}
                    label="Export SVG"
                    statusKey="svg"
                />
                <Button
                    onClick={() => handleCopy('iframe', "Embed Code")}
                    icon={Code}
                    label="Copy Embed"
                    statusKey="Embed Code"
                />
                <Button
                    onClick={() => handleCopy('url', "Public URL")}
                    icon={LinkIcon}
                    label="Public URL"
                    statusKey="Public URL"
                />
                <Button
                    onClick={() => handleCopy('markdown', "Markdown")}
                    icon={FileCode}
                    label="Markdown"
                    statusKey="Markdown"
                />
                <Button
                    onClick={() => handleCopy('html', "HTML")}
                    icon={FileImage}
                    label="HTML <img>"
                    statusKey="HTML"
                />
            </div>
        </div>
    );
}
