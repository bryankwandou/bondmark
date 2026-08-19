/**
 * The Bondmark mark.
 *
 * A crimped seal ring with one segment missing, wrapped around a geometric B.
 * The missing segment is the point: a bond can always be withdrawn, and the mark
 * says so rather than pretending the money is trapped forever. The upper bowl
 * carries the seal gold, the stem and lower bowl carry the bond teal, so the two
 * halves of the product read at a glance even at sixteen pixels.
 */

type LogoProps = {
  size?: number;
  className?: string;
  /** Renders the ring gap sealed shut, used on the badge for a healthy seller. */
  closed?: boolean;
  title?: string;
};

export function LogoMark({ size = 32, className, closed = false, title }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {/* Seal ring. pathLength normalises the dash maths regardless of radius. */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="var(--seal)"
        strokeWidth="2.4"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={closed ? "100 0" : "78 22"}
        strokeDashoffset={closed ? 0 : 61}
      />

      {/* The bead that terminates the open ring, so the gap reads as deliberate. */}
      {!closed && <circle cx="33.6" cy="31.6" r="2.1" fill="var(--seal)" />}

      {/* Stem */}
      <rect x="13" y="10.5" width="4.2" height="19" rx="1.3" fill="var(--bond)" />

      {/* Upper bowl, in seal gold */}
      <path
        d="M17.2 10.5H20.6a4.3 4.3 0 0 1 0 8.6H17.2Z"
        fill="var(--seal)"
      />

      {/* Lower bowl, in bond teal */}
      <path
        d="M17.2 20.9H21.4a4.3 4.3 0 0 1 0 8.6H17.2Z"
        fill="var(--bond)"
      />
    </svg>
  );
}

export function Wordmark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} title="Bondmark" />
      <span
        className="display text-ink"
        style={{ fontSize: size * 0.72, letterSpacing: "-0.02em" }}
      >
        Bondmark
      </span>
    </span>
  );
}
