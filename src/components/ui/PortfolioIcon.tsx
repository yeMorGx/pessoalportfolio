import type { CSSProperties } from "react";

const iconPaths = {
  link: "/icons/arrow-link.svg",
  up: "/icons/arrow-up.svg",
  down: "/icons/arrow-down.svg",
  left: "/icons/arrow-left.svg",
  right: "/icons/arrow-right.svg"
} as const;

type PortfolioIconProps = {
  name: keyof typeof iconPaths;
  className?: string;
};

export function PortfolioIcon({ name, className = "h-4 w-4" }: PortfolioIconProps) {
  const mask = `url(${iconPaths[name]}) center / contain no-repeat`;
  const style = {
    WebkitMask: mask,
    mask
  } satisfies CSSProperties;

  return <span aria-hidden="true" className={`inline-block shrink-0 bg-current ${className}`} style={style} />;
}
