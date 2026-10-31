import Link from "next/link";

/** Official brand logo mark for AIConstruct using assets from public/aiconstruct logos+favicons. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/aiconstruct%20logos+favicons/android-chrome-192x192.png"
      alt="AIConstruct Logo"
      width={size}
      height={size}
      className={"mark " + (className ?? "")}
      style={{ width: size, height: size, objectFit: "contain", borderRadius: Math.round(size * 0.2) }}
      draggable={false}
    />
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
