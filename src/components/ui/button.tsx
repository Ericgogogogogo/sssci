import { clsx } from "clsx";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = clsx(
    "inline-flex items-center justify-center rounded-lg font-medium",
    "transition-all duration-200 ease-out",
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "active:scale-[0.98]"
  );

  const variants = {
    primary: clsx(
      "bg-gradient-to-r from-blue-600 to-purple-600",
      "text-white shadow-lg shadow-blue-500/30",
      "hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5",
      "focus-visible:ring-blue-500"
    ),
    secondary: clsx(
      "bg-white/10 backdrop-blur-sm",
      "text-white border border-white/20",
      "hover:bg-white/20 hover:border-white/30",
      "dark:bg-white/5 dark:border-white/10",
      "dark:hover:bg-white/10 dark:hover:border-white/20"
    ),
    outline: clsx(
      "border border-zinc-300 bg-transparent",
      "text-zinc-900 hover:bg-zinc-100",
      "dark:border-zinc-700 dark:text-zinc-100",
      "dark:hover:bg-zinc-800/50",
      "focus-visible:ring-zinc-500"
    ),
    ghost: clsx(
      "bg-transparent hover:bg-zinc-100",
      "text-zinc-700 dark:text-zinc-300",
      "dark:hover:bg-zinc-800/50"
    ),
    danger: clsx(
      "bg-gradient-to-r from-red-600 to-pink-600",
      "text-white shadow-lg shadow-red-500/30",
      "hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5",
      "focus-visible:ring-red-500"
    ),
  } as const;

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  } as const;

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}