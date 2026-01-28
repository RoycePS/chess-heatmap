"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [disabled, setDisabled] = React.useState(false);

    const toggleTheme = () => {
        if (disabled) return;
        setDisabled(true);
        setTheme(theme === "dark" ? "light" : "dark");
        setTimeout(() => setDisabled(false), 500);
    };

    return (
        <button
            onClick={toggleTheme}
            disabled={disabled}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all hover:border-primary hover:shadow-[0_0_10px_var(--primary-glow)] focus:outline-none disabled:opacity-50"
            aria-label="Toggle Theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
    );
}
