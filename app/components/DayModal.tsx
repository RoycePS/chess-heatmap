"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";

interface DayModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        date: string;
        total: number;
        chesscom: number;
        lichess: number;
    } | null;
}

export function DayModal({ isOpen, onClose, data }: DayModalProps) {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{data.date}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Games</span>
                        <span className="text-xl font-bold text-primary">{data.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-[#7FA650]" />
                            Chess.com
                        </span>
                        <span className="text-lg font-bold text-foreground">
                            {data.chesscom}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-[#3D85C6]" />
                            Lichess
                        </span>
                        <span className="text-lg font-bold text-foreground">
                            {data.lichess}
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
