import { clsx } from "clsx";
import React from "react";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx("text-sm font-medium text-zinc-900 dark:text-zinc-100", className)}
      {...props}
    />
  );
}