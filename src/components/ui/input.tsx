import { clsx } from "clsx";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, icon, type = "text", ...props }, ref) => {
    const inputClasses = clsx(
      "w-full rounded-lg px-4 py-2.5 text-sm",
      "bg-white dark:bg-zinc-900",
      "border transition-all duration-200",
      "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
      "focus:outline-none focus:ring-2 focus:ring-offset-0",
      // 默认状态
      !error && !success && "border-zinc-300 dark:border-zinc-700",
      !error && !success && "focus:border-blue-500 focus:ring-blue-500/20",
      // 错误状态
      error && "border-red-500 dark:border-red-500",
      error && "focus:border-red-500 focus:ring-red-500/20 animate-shake",
      // 成功状态
      success && "border-green-500 dark:border-green-500",
      success && "focus:border-green-500 focus:ring-green-500/20",
      // 有图标时添加padding
      icon && "pl-10",
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// 密码强度指示器组件
export function PasswordStrengthIndicator({ strength }: { strength: number }) {
  const getColor = () => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-gradient-to-r from-green-500 to-emerald-500";
  };

  const getLabel = () => {
    if (strength < 30) return "弱";
    if (strength < 60) return "中等";
    if (strength < 80) return "强";
    return "非常强";
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">密码强度</span>
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{getLabel()}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={clsx("h-full transition-all duration-300", getColor())}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
}