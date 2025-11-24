import { clsx } from "clsx";
import React from "react";

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={clsx(
          "h-4 w-4 rounded border border-zinc-300 text-black focus:ring-0 dark:border-zinc-700",
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";