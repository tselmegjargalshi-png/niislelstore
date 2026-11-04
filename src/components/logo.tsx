/** Нийслэл Стор лого: өлзий хээний "Н" үсэг. Өөрийн SVG. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="var(--ink)" />
      <path d="M13 35V13h5v8.5h12V13h5v22h-5v-9H18v9z" fill="var(--on-ink)" />
      <path d="M24 5.5l2.2 2.3-2.2 2.3-2.2-2.3z" fill="var(--gold)" />
      <path d="M8 40h9M31 40h9" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="leading-none">
          <span className="display block text-[1.1rem] font-semibold tracking-tight">Нийслэл</span>
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.32em] text-[var(--gold)]">Стор</span>
        </span>
      )}
    </span>
  );
}
