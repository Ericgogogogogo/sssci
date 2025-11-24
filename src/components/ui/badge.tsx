import { clsx } from "clsx";
import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md" | "lg";
    gradient?: boolean;
};

export function Badge({
    className,
    variant = "default",
    size = "md",
    gradient = false,
    children,
    ...props
}: BadgeProps) {
    const baseClasses = clsx(
        "inline-flex items-center justify-center",
        "rounded-full font-medium",
        "transition-all duration-200"
    );

    const variants = {
        default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        primary: gradient
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        success: gradient
            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        warning: gradient
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        danger: gradient
            ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/30"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        info: gradient
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
            : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    } as const;

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
    } as const;

    return (
        <span
            className={clsx(baseClasses, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </span>
    );
}
