import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "destructive" | "link" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: Partial<ButtonProps> = {}): string => {
  return cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    {
      "bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4": variant === "default",
      "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 h-10 py-2 px-4": variant === "outline",
      "bg-gray-200 text-gray-800 hover:bg-gray-300 h-10 py-2 px-4": variant === "secondary",
      "bg-red-500 text-white hover:bg-red-600 h-10 py-2 px-4": variant === "destructive",
      "text-indigo-600 hover:text-indigo-700 p-0 underline-offset-4 hover:underline": variant === "link",
      "hover:bg-gray-100 hover:text-gray-900 h-10 py-2 px-4": variant === "ghost",
      "h-10 py-2 px-4 text-sm": size === "default",
      "h-8 py-1 px-3 text-xs": size === "sm",
      "h-12 py-3 px-6 text-base": size === "lg",
      "h-10 w-10 p-0": size === "icon",
    },
    className
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button }; 