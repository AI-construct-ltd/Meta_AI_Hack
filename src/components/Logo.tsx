import Link from "next/link";

/** Official brand logo mark for AIConstruct. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={"mark " + (className ?? "")}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" rx="6" fill="var(--ink)" />
      <path d="M16 7 L25 12 L16 17 L7 12 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 12 V22 L16 27 V17" fill="none" stroke="var(--line-2)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M25 12 V22 L16 27" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="14" y="15" width="4" height="4" rx="1" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={"wordmark " + (className ?? "")}>
      AIConstruct
    </span>
  );
}

export default function Logo({ href = "/", compact, size = 32 }: { href?: string; compact?: boolean; size?: number }) {
  return (
    <Link href={href} className="logo" aria-label="AIConstruct home">
      <LogoMark size={size} />
      {!compact && <Wordmark />}
    </Link>
  );
}
