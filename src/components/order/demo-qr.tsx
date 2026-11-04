/** ДЕМО QR хэв: зөвхөн дүрслэл. Уншигдахгүй бөгөөд бодит төлбөр холбогдоогүй. */
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function DemoQR({ value, size = 200 }: { value: string; size?: number }) {
  const N = 25;
  let s = hash(value);
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (finder(x, y)) continue;
    if (rnd() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  const Finder = ({ x, y }: { x: number; y: number }) => (<g><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>);
  return (
    <div className="relative inline-block rounded-2xl bg-white p-3 shadow-[var(--shadow-sm)]">
      <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} fill="#111" role="img" aria-label="Демо QR дүрс, уншигдахгүй" shapeRendering="crispEdges">
        <rect width={N} height={N} fill="#fff" />{cells}<Finder x={0} y={0} /><Finder x={N - 7} y={0} /><Finder x={0} y={N - 7} />
      </svg>
      <span className="absolute inset-0 grid place-items-center"><span className="-rotate-12 rounded-md bg-[var(--accent)] px-3 py-1 text-sm font-bold tracking-widest text-white shadow-lg">ДЕМО</span></span>
    </div>
  );
}
