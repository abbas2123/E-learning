import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-white px-10 py-3.5 text-base font-semibold text-slate-900 shadow-[0_24px_60px_-28px_rgba(83,196,200,0.18)] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-100",
  secondary:
    "rounded-full border border-white/20 bg-white/10 px-9 py-3 text-base font-semibold text-white transition hover:bg-white/20",
  ghost:
    "rounded-full px-9 py-3 text-base font-semibold text-white/90 transition hover:text-white",
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
