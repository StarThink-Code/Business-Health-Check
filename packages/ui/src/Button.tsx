import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-sm hover:bg-accent-600 focus-visible:outline-accent",
  secondary:
    "bg-surface text-ink ring-1 ring-inset ring-border-strong hover:bg-page focus-visible:outline-border-strong",
  ghost: "text-ink-secondary hover:bg-page focus-visible:outline-border-strong",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

/** Shared so non-<button> elements (e.g. router Links) can look like a Button. */
export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={buttonClassName(variant, size, className)} {...props} />;
}
