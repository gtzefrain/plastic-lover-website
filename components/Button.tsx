import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  href: string;
  variant?: "solid" | "outline";
  children: React.ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Button({ href, variant = "solid", children, className, ...rest }: ButtonProps) {
  const cls = `${styles.base} ${variant === "solid" ? styles.solid : styles.outline} ${className ?? ""}`;
  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}
