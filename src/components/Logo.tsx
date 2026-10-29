import Link from "next/link";
import Image from "next/image";

/** Official brand logo mark for AIConstruct. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      width={size}
      height={size}
      alt="AIConstruct logo"
      className={"mark logo-img " + (className ?? "")}
      priority
      style={{ width: size, height: size, objectFit: "contain", borderRadius: 0 }}
    />
  );
}

export function Wordmark() {
  return null;
}

export default function Logo({ href = "/", size = 34 }: { href?: string; compact?: boolean; size?: number }) {
  return (
    <Link href={href} className="logo" aria-label="AIConstruct home">
      <LogoMark size={size} />
    </Link>
  );
}
