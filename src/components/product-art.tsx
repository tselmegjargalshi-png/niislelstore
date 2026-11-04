/**
 * Бүтээгдэхүүний студи зураг: брэндийн өөрийн SVG урлал (гуравдагч этгээдийн зураггүй, холбоос эвдрэхгүй).
 * Бүтээгдэхүүн бүр өөрийн өнгөөрөө будагдаж, 4 өнцгөөс (view 0..3) харагдана.
 */
import type { ArtKind, ProductImage } from "@/lib/types";

function mix(hex: string, with_: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex);
  const b = p(with_);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}
const dark = (h: string, t = 0.22) => mix(h, "#000000", t);
const light = (h: string, t = 0.28) => mix(h, "#ffffff", t);

type Tone = { c: string; d: string; l: string };

const Fold = ({ d }: { d: string }) => <path d={d} fill="none" stroke="#000" strokeOpacity=".08" strokeWidth="3" strokeLinecap="round" />;

function Garment({ t, kind }: { t: Tone; kind: ArtKind }) {
  switch (kind) {
    case "sweater":
      return (
        <g>
          <path d="M120 150 L160 120 Q200 140 240 120 L280 150 L345 250 L300 275 L275 235 L275 400 L125 400 L125 235 L100 275 L55 250 Z" fill={t.c} />
          <path d="M160 120 Q200 160 240 120 Q200 138 160 120Z" fill={t.d} />
          <rect x="125" y="380" width="150" height="20" fill={t.d} />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${140 + i * 24} 160 V380`} stroke={t.d} strokeOpacity=".25" strokeWidth="2" />)}
          <Fold d="M60 250 L100 275 M340 250 L300 275" />
        </g>
      );
    case "coat":
      return (
        <g>
          <path d="M130 110 L170 95 L200 150 L230 95 L270 110 L310 160 L345 340 L310 350 L290 240 L285 440 L115 440 L110 240 L90 350 L55 340 L90 160 Z" fill={t.c} />
          <path d="M170 95 L200 150 L230 95 L250 125 L200 330 L150 125Z" fill={t.d} />
          <path d="M200 150 V440" stroke={t.l} strokeOpacity=".5" strokeWidth="2" />
          {[200, 250, 300].map((y) => <circle key={y} cx="212" cy={y} r="6" fill={t.l} />)}
          <rect x="130" y="320" width="45" height="6" rx="3" fill={t.d} />
          <rect x="225" y="320" width="45" height="6" rx="3" fill={t.d} />
        </g>
      );
    case "jacket":
      return (
        <g>
          <path d="M125 120 L165 100 L200 140 L235 100 L275 120 L330 170 L350 330 L310 340 L290 250 L285 400 L115 400 L110 250 L90 340 L50 330 L70 170 Z" fill={t.c} />
          <path d="M165 100 L200 140 L235 100 L225 90 Q200 105 175 90Z" fill={t.d} />
          <path d="M200 140 L240 400" stroke={t.d} strokeWidth="2" />
          <path d="M200 140 L175 260 L215 400" fill="none" stroke={t.l} strokeOpacity=".5" strokeWidth="2" />
          {[190, 235, 280, 325].map((y) => <rect key={y} x="186" y={y} width="22" height="5" rx="2.5" fill={t.l} transform={`rotate(10 197 ${y})`} />)}
          <rect x="130" y="290" width="48" height="36" rx="4" fill="none" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "shirt":
      return (
        <g>
          <path d="M130 120 L170 105 Q200 125 230 105 L270 120 L335 220 L295 245 L275 205 L275 410 L125 410 L125 205 L105 245 L65 220 Z" fill={t.c} />
          <path d="M170 105 Q200 140 230 105 L215 100 Q200 112 185 100Z" fill={t.d} />
          <path d="M200 125 V410" stroke={t.d} strokeOpacity=".35" strokeWidth="2" />
          {[160, 205, 250, 295, 340, 385].map((y) => <circle key={y} cx="208" cy={y} r="3.5" fill={t.l} />)}
          <rect x="140" y="215" width="42" height="40" rx="3" fill="none" stroke={t.d} strokeOpacity=".5" strokeWidth="2" />
        </g>
      );
    case "scarf":
      return (
        <g>
          <path d="M110 120 Q200 80 290 120 L300 175 Q200 140 100 175Z" fill={t.c} />
          <path d="M140 160 L200 150 L205 420 L135 420Z" fill={t.c} />
          <path d="M215 150 L270 165 L280 400 L215 410Z" fill={t.d} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={137 + i * 9} y="420" width="3" height="26" rx="1.5" fill={t.c} />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={217 + i * 10} y="408" width="3" height="26" rx="1.5" fill={t.d} />)}
          {[190, 240, 290, 340].map((y) => <path key={y} d={`M138 ${y} H203`} stroke={t.l} strokeOpacity=".6" strokeWidth="4" />)}
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M100 290 Q100 130 200 130 Q300 130 300 290Z" fill={t.c} />
          <rect x="92" y="270" width="216" height="64" rx="18" fill={t.d} />
          {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${108 + i * 17} 275 V330`} stroke={t.c} strokeOpacity=".5" strokeWidth="3" />)}
          <circle cx="200" cy="112" r="26" fill={t.l} />
          <Fold d="M150 160 Q140 220 150 260 M250 160 Q260 220 250 260" />
        </g>
      );
    case "blanket":
      return (
        <g>
          <path d="M70 130 L340 110 L350 390 L80 410Z" fill={t.c} />
          <path d="M90 150 L322 134 L330 370 L98 388Z" fill="none" stroke={t.l} strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${130 + i * 42} ${160 + i * -3} l 18 20 l -18 20 l -18 -20z`} fill={t.d} fillOpacity=".5" />)}
          {[0, 1, 2, 3, 4].map((i) => <path key={"b" + i} d={`M${130 + i * 42} ${310 + i * -3} l 18 20 l -18 20 l -18 -20z`} fill={t.d} fillOpacity=".5" />)}
          {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={74 + i * 12.5} y={i % 2 ? 404 : 408} width="3" height="20" rx="1.5" fill={t.c} />)}
        </g>
      );
    case "socks":
      return (
        <g>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 120} ${k * 14})`}>
              <path d="M95 90 H175 V270 Q175 300 205 320 Q235 345 215 385 Q190 410 150 395 Q95 385 95 330Z" fill={k ? t.d : t.c} />
              <rect x="95" y="90" width="80" height="34" fill={t.l} fillOpacity=".7" />
              <path d="M95 140 H175 M95 160 H175" stroke="#000" strokeOpacity=".1" strokeWidth="3" />
            </g>
          ))}
        </g>
      );
    case "gloves":
      return (
        <g>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 95 - 30} ${k * 18})`}>
              <path d="M110 250 V150 Q110 135 125 135 Q138 135 138 150 V210 V120 Q138 105 152 105 Q166 105 166 120 V205 V110 Q166 95 180 95 Q194 95 194 110 V210 V135 Q194 120 208 120 Q222 120 222 135 V260 Q245 255 250 240 Q262 250 252 285 L240 340 H125 Z" fill={k ? t.d : t.c} />
              <rect x="120" y="335" width="125" height="40" rx="8" fill={t.l} fillOpacity=".75" />
            </g>
          ))}
        </g>
      );
    case "tote":
      return (
        <g>
          <path d="M135 190 Q135 70 200 70 Q265 70 265 190" fill="none" stroke={t.d} strokeWidth="12" strokeLinecap="round" />
          <path d="M85 180 H315 L335 420 H65Z" fill={t.c} />
          <path d="M85 180 H315 L318 215 H82Z" fill={t.d} fillOpacity=".5" />
          <rect x="170" y="260" width="60" height="44" rx="6" fill="none" stroke={t.l} strokeWidth="3" />
          <circle cx="200" cy="282" r="5" fill={t.l} />
          {[0, 1, 2].map((i) => <path key={i} d={`M95 ${400 - i * 0} h210`} stroke={t.d} strokeOpacity=".3" strokeDasharray="6 6" />)}
        </g>
      );
    case "crossbody":
      return (
        <g>
          <path d="M120 170 Q200 -20 280 170" fill="none" stroke={t.d} strokeWidth="9" />
          <rect x="95" y="170" width="210" height="170" rx="26" fill={t.c} />
          <path d="M95 215 Q200 275 305 215 V196 Q305 170 279 170 H121 Q95 170 95 196Z" fill={t.d} />
          <circle cx="200" cy="255" r="11" fill={t.l} />
          <path d="M112 328 H288" stroke={t.l} strokeOpacity=".5" strokeDasharray="5 5" />
        </g>
      );
    case "wallet":
      return (
        <g>
          <rect x="70" y="150" width="260" height="190" rx="22" fill={t.c} />
          <path d="M70 200 H330" stroke={t.d} strokeWidth="3" />
          <rect x="260" y="235" width="70" height="46" rx="12" fill={t.d} />
          <circle cx="285" cy="258" r="6" fill={t.l} />
          <path d="M82 162 H318 M82 328 H318" stroke={t.l} strokeOpacity=".5" strokeDasharray="6 6" />
          <rect x="110" y="110" width="150" height="70" rx="8" fill={t.d} fillOpacity=".55" />
        </g>
      );
    case "belt":
      return (
        <g>
          <path d="M40 285 Q200 215 360 285 V325 Q200 255 40 325Z" fill={t.c} />
          <path d="M40 295 Q200 225 360 295" fill="none" stroke={t.l} strokeOpacity=".55" strokeDasharray="7 6" />
          <rect x="150" y="238" width="62" height="70" rx="8" fill="none" stroke="#C8A15A" strokeWidth="9" />
          <path d="M181 250 V300" stroke="#C8A15A" strokeWidth="6" />
          {[260, 285, 310].map((x, i) => <circle key={x} cx={x} cy={270 + i * 6} r="4" fill={t.d} />)}
        </g>
      );
    case "boots":
      return (
        <g>
          <path d="M120 70 H215 L220 250 Q300 270 335 330 Q350 360 330 385 H110 Q90 385 90 360Z" fill={t.c} />
          <path d="M90 360 H345 V400 Q345 415 330 415 H105 Q90 415 90 400Z" fill={t.d} />
          <path d="M120 70 H215 V105 H120Z" fill={t.d} />
          {[130, 160, 190, 220].map((y) => <path key={y} d={`M135 ${y} H205`} stroke={t.l} strokeOpacity=".6" strokeWidth="3" strokeDasharray="4 6" />)}
          <path d="M290 330 Q320 340 335 330" stroke={t.l} strokeOpacity=".5" strokeWidth="3" fill="none" />
        </g>
      );
    case "slippers":
      return (
        <g>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 60 - 20} ${k * 70})`}>
              <path d="M110 120 Q95 260 125 330 Q150 365 200 365 Q250 365 270 320 Q280 250 255 180 Q235 110 175 105 Q130 100 110 120Z" fill={k ? t.d : t.c} />
              <path d="M130 140 Q200 100 245 170 Q210 190 150 185Z" fill={t.l} fillOpacity=".7" />
            </g>
          ))}
        </g>
      );
    case "cup":
      return (
        <g>
          <path d="M110 160 H290 L275 340 Q270 375 235 375 H165 Q130 375 125 340Z" fill={t.c} />
          <path d="M290 195 Q345 195 340 255 Q335 305 280 305" fill="none" stroke={t.c} strokeWidth="18" strokeLinecap="round" />
          <ellipse cx="200" cy="160" rx="90" ry="16" fill={t.d} />
          <ellipse cx="200" cy="162" rx="76" ry="10" fill="#4a2c1b" fillOpacity=".85" />
          <path d="M135 230 Q200 250 265 230" fill="none" stroke={t.l} strokeOpacity=".7" strokeWidth="4" />
        </g>
      );
    case "vase":
      return (
        <g>
          <path d="M165 90 H235 V135 Q330 190 320 290 Q312 400 200 408 Q88 400 80 290 Q70 190 165 135Z" fill={t.c} />
          <ellipse cx="200" cy="90" rx="35" ry="8" fill={t.d} />
          <path d="M110 250 Q200 290 290 250" fill="none" stroke={t.l} strokeOpacity=".7" strokeWidth="5" />
          <path d="M200 90 Q190 30 160 10 M200 90 Q215 20 250 15 M200 90 Q205 40 205 0" stroke="#7A6A4F" strokeWidth="4" fill="none" />
        </g>
      );
    case "cushion":
      return (
        <g>
          <path d="M80 110 Q200 85 320 110 Q335 250 320 390 Q200 415 80 390 Q65 250 80 110Z" fill={t.c} />
          <path d="M200 160 l55 70 l-55 70 l-55 -70z" fill="none" stroke={t.l} strokeWidth="6" />
          <path d="M200 190 l28 40 l-28 40 l-28 -40z" fill={t.l} fillOpacity=".7" />
          {[[110, 140], [290, 140], [110, 360], [290, 360]].map(([x, y]) => <circle key={x + "" + y} cx={x} cy={y} r="5" fill={t.l} />)}
        </g>
      );
    case "candle":
      return (
        <g>
          <path d="M200 80 Q215 110 200 125 Q185 110 200 80Z" fill="#F4B23E" />
          <path d="M200 120 V145" stroke="#333" strokeWidth="3" />
          <path d="M115 150 H285 V380 Q285 405 260 405 H140 Q115 405 115 380Z" fill={t.c} />
          <rect x="115" y="150" width="170" height="40" fill="#fff" fillOpacity=".2" />
          <rect x="145" y="240" width="110" height="90" rx="4" fill={t.l} fillOpacity=".85" />
          <path d="M165 285 H235 M175 305 H225" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "bowl":
      return (
        <g>
          <path d="M60 190 H340 Q335 340 270 370 Q200 395 130 370 Q65 340 60 190Z" fill={t.c} />
          <ellipse cx="200" cy="190" rx="140" ry="26" fill={t.d} />
          <ellipse cx="200" cy="194" rx="124" ry="18" fill={t.l} />
          <path d="M150 395 H250" stroke={t.d} strokeWidth="10" strokeLinecap="round" />
        </g>
      );
    case "jar":
      return (
        <g>
          <rect x="100" y="140" width="200" height="40" rx="10" fill="#C8A15A" />
          <path d="M105 180 H295 V350 Q295 395 250 395 H150 Q105 395 105 350Z" fill={t.c} />
          <rect x="125" y="230" width="150" height="100" rx="6" fill="#fff" fillOpacity=".85" />
          <circle cx="200" cy="262" r="14" fill={t.d} fillOpacity=".7" />
          <path d="M148 305 H252 M160 320 H240" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "bottle":
      return (
        <g>
          <rect x="170" y="60" width="60" height="50" rx="8" fill="#333" />
          <path d="M175 110 H225 V150 Q285 175 285 250 V370 Q285 400 255 400 H145 Q115 400 115 370 V250 Q115 175 175 150Z" fill={t.c} fillOpacity=".95" />
          <rect x="140" y="230" width="120" height="110" rx="6" fill="#fff" fillOpacity=".85" />
          <path d="M160 270 H240 M160 292 H225" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "dropper":
      return (
        <g>
          <path d="M175 60 Q175 30 200 30 Q225 30 225 60 V120 H175Z" fill="#222" />
          <rect x="165" y="120" width="70" height="30" fill="#C8A15A" />
          <path d="M120 175 Q120 150 165 150 H235 Q280 150 280 175 V365 Q280 405 240 405 H160 Q120 405 120 365Z" fill={t.c} />
          <rect x="145" y="235" width="110" height="100" rx="6" fill="#fff" fillOpacity=".85" />
          <circle cx="200" cy="270" r="12" fill={t.c} />
          <path d="M160 308 H240" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "soap":
      return (
        <g>
          <rect x="85" y="170" width="230" height="170" rx="40" fill={t.c} transform="rotate(-6 200 255)" />
          <rect x="115" y="195" width="170" height="120" rx="26" fill="none" stroke={t.l} strokeWidth="4" transform="rotate(-6 200 255)" />
          <path d="M150 255 Q200 215 250 255 Q200 295 150 255Z" fill={t.l} fillOpacity=".8" transform="rotate(-6 200 255)" />
        </g>
      );
    case "tube":
      return (
        <g>
          <path d="M150 90 H250 L262 150 H138Z" fill={t.d} />
          <path d="M138 150 H262 V360 Q200 385 138 360Z" fill={t.c} />
          <path d="M138 360 Q200 385 262 360 V395 H138Z" fill={t.d} />
          <circle cx="200" cy="245" r="26" fill={t.l} fillOpacity=".85" />
          <path d="M160 310 H240" stroke={t.l} strokeWidth="4" />
        </g>
      );
    case "teabox":
      return (
        <g>
          <path d="M90 180 L200 140 L310 180 V370 L200 410 L90 370Z" fill={t.c} />
          <path d="M200 140 L310 180 V370 L200 410Z" fill={t.d} fillOpacity=".55" />
          <path d="M90 180 L200 220 L310 180" fill="none" stroke={t.l} strokeOpacity=".6" strokeWidth="3" />
          <circle cx="150" cy="300" r="26" fill={t.l} fillOpacity=".85" />
          <path d="M138 300 Q150 280 162 300 Q150 318 138 300Z" fill={t.d} />
        </g>
      );
    case "honey":
      return (
        <g>
          <rect x="125" y="100" width="150" height="40" rx="8" fill="#6A4B2A" />
          <path d="M120 140 H280 V360 Q280 400 240 400 H160 Q120 400 120 360Z" fill={t.c} />
          <path d="M120 140 H280 V190 Q240 215 200 195 Q160 215 120 190Z" fill={light(t.c, 0.35)} />
          <rect x="140" y="250" width="120" height="100" rx="6" fill="#fff" fillOpacity=".88" />
          <path d="M200 270 l17 10 v20 l-17 10 l-17 -10 v-20z" fill={t.d} />
          <path d="M160 335 H240" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "chocolate":
      return (
        <g>
          <rect x="95" y="100" width="210" height="300" rx="14" fill={t.c} />
          <rect x="95" y="100" width="210" height="300" rx="14" fill="#000" fillOpacity=".25" />
          {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={r + "" + c} x={120 + c * 90} y={130 + r * 90} width="70" height="70" rx="8" fill={light(t.c, 0.12)} />))}
          <rect x="95" y="100" width="210" height="64" rx="14" fill="#fff" fillOpacity=".92" />
          <path d="M140 132 H260" stroke={t.d} strokeWidth="5" />
        </g>
      );
    case "giftbox":
      return (
        <g>
          <rect x="85" y="190" width="230" height="200" rx="8" fill={t.c} />
          <rect x="70" y="150" width="260" height="62" rx="8" fill={t.d} />
          <rect x="185" y="150" width="30" height="240" fill="#C8A15A" />
          <path d="M200 150 Q150 80 120 120 Q110 150 200 150 Q290 150 280 120 Q250 80 200 150Z" fill="#C8A15A" />
        </g>
      );
    case "juice":
      return (
        <g>
          <rect x="165" y="55" width="70" height="55" rx="6" fill="#E08A2E" />
          <path d="M170 110 H230 V145 Q290 170 290 240 V380 Q290 405 265 405 H135 Q110 405 110 380 V240 Q110 170 170 145Z" fill={t.c} />
          <rect x="135" y="235" width="130" height="120" rx="8" fill="#fff" fillOpacity=".9" />
          {[0, 1, 2].map((i) => <circle key={i} cx={170 + i * 30} cy="275" r="10" fill={t.c} />)}
          <path d="M155 320 H245" stroke={t.d} strokeWidth="3" />
        </g>
      );
    case "bracelet":
      return (
        <g>
          <ellipse cx="200" cy="260" rx="125" ry="120" fill="none" stroke={t.c} strokeWidth="26" />
          <ellipse cx="200" cy="260" rx="125" ry="120" fill="none" stroke={t.l} strokeOpacity=".7" strokeWidth="5" strokeDasharray="2 18" strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${135 + i * 26} 150 l10 12 l-10 12 l-10 -12z`} fill={t.d} />)}
          <path d="M200 140 l16 20 l-16 20 l-16 -20z" fill="#fff" fillOpacity=".8" />
        </g>
      );
    case "earrings":
      return (
        <g>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 130 - 65} 0)`}>
              <circle cx="200" cy="120" r="14" fill="none" stroke={t.c} strokeWidth="5" />
              <path d="M200 135 V190" stroke={t.c} strokeWidth="4" />
              <path d="M200 190 L240 250 L200 340 L160 250Z" fill={t.c} />
              <path d="M200 190 L240 250 L200 250Z" fill={t.l} fillOpacity=".8" />
              <path d="M160 250 L200 250 L200 340Z" fill={t.d} fillOpacity=".6" />
              <circle cx="200" cy="360" r="14" fill={t.c} />
            </g>
          ))}
        </g>
      );
    case "notebook":
      return (
        <g>
          <rect x="100" y="70" width="210" height="340" rx="12" fill={t.c} transform="rotate(4 205 240)" />
          <rect x="100" y="70" width="34" height="340" rx="10" fill={t.d} transform="rotate(4 205 240)" />
          <rect x="165" y="130" width="100" height="70" rx="4" fill="none" stroke={t.l} strokeWidth="3" transform="rotate(4 205 240)" />
          <path d="M185 165 H245" stroke={t.l} strokeWidth="4" transform="rotate(4 205 240)" />
          <path d="M298 80 V400" stroke={t.d} strokeWidth="9" strokeLinecap="round" transform="rotate(4 205 240)" />
        </g>
      );
    default:
      return <rect x="100" y="100" width="200" height="300" rx="16" fill={t.c} />;
  }
}

/** Монгол өлзий хээний давтагдсан тэмдэг: арын чимэглэл. */
function Ornament({ color, opacity = 0.1 }: { color: string; opacity?: number }) {
  return (
    <g opacity={opacity} fill="none" stroke={color} strokeWidth="2">
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <path key={r + "-" + c} transform={`translate(${c * 120 + (r % 2) * 60} ${r * 110})`} d="M20 10 h30 v30 h-30 v-20 h20 v10 h-10" />
        )),
      )}
    </g>
  );
}

const BACKDROPS = ["#F4EFE7", "#E9ECEF", "#EFE7DC", "#E6EAE3"];

export function ProductArt({
  kind, color = "#B98A5A", view = 0, className, title,
}: { kind: ArtKind; color?: string; view?: number; className?: string; title?: string }) {
  const t: Tone = { c: color, d: dark(color), l: light(color) };
  const bg = BACKDROPS[view % 4];
  const transform =
    view === 1 ? "translate(-110 -140) scale(1.55)" : view === 2 ? "rotate(-7 200 250) translate(8 6)" : view === 3 ? "translate(40 70) scale(.8)" : "";
  return (
    <svg viewBox="0 0 400 500" className={className} role="img" aria-label={title ?? "Бүтээгдэхүүний зураг"} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`g${view}`} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor={bg} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={bg} />
      <rect width="400" height="500" fill={`url(#g${view})`} />
      <Ornament color={dark(bg, 0.45)} opacity={view === 2 ? 0.22 : 0.09} />
      <ellipse cx="200" cy={view === 3 ? 418 : 440} rx={view === 1 ? 0 : 130} ry="12" fill="#000" opacity=".12" />
      <g transform={transform}>
        <Garment t={t} kind={kind} />
      </g>
    </svg>
  );
}

/** ProductImage (урлал эсвэл байршуулсан зураг)-ыг нэгдсэн байдлаар харуулна. */
export function ProductPicture({
  image, kind, color, className, alt,
}: { image?: ProductImage; kind: ArtKind; color?: string; className?: string; alt?: string }) {
  if (image?.kind === "upload") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image.src} alt={image.alt ?? alt ?? ""} className={className} style={{ objectFit: "cover" }} />;
  }
  return <ProductArt kind={kind} color={color} view={image?.kind === "art" ? image.view : 0} className={className} title={alt} />;
}
