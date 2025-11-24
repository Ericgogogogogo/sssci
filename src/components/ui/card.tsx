import { clsx } from "clsx";
import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "glass";
    hover?: boolean;
};

export function Card({
    className,
    variant = "default",
    hover = false,
    children,
    ...props
}: CardProps) {
    const variants = {
        default: clsx(
            "bg-white dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-sm"
        ),
        elevated: clsx(
            "bg-white dark:bg-zinc-900",
            "border border-zinc-200/50 dark:border-zinc-800/50",
            "shadow-lg shadow-zinc-900/5 dark:shadow-black/20"
        ),
        glass: clsx(
            "bg-white/50 dark:bg-zinc-900/50",
            "backdrop-blur-xl backdrop-saturate-150",
            "border border-white/20 dark:border-white/10",
            "shadow-xl shadow-zinc-900/10 dark:shadow-black/30"
        ),
    } as const;

    const hoverEffect = hover && clsx(
        "transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl",
        "hover:shadow-zinc-900/10 dark:hover:shadow-black/40",
        "cursor-pointer"
    );

    return (
        <div
            className={clsx(
                "rounded-xl overflow-hidden",
                variants[variant],
                hoverEffect,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx("px-6 py-4 border-b border-zinc-200 dark:border-zinc-800", className)} {...props}>
            {children}
        </div>
    );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx("px-6 py-4", className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx("px-6 py-4 border-t border-zinc-200 dark:border-zinc-800", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={clsx("text-lg font-semibold text-zinc-900 dark:text-zinc-100", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={clsx("text-sm text-zinc-600 dark:text-zinc-400", className)} {...props}>
            {children}
        </p>
    );
}
