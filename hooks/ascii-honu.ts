// @ts-nocheck: generated art tables, indexed by known keys
// ASCII "Honu Lagoon" backdrop: one self-contained animated SVG string.
// Pure vector, CSS-only motion, deterministic (seeded), no external references.

const COLORS = ["#2b9ee6","#53ddf9","#06aceb","#69ebfa","#e1f6f5","#21bbef","#3074ee","#007cef","#0499eb","#05befa","#1ccaf9","#01b5fa","#0281e1","#7c4d36","#033a9a","#40b9cd","#e5b77f","#01adf9","#0188f4","#946a62","#cbd5ac","#2561a5","#101b29","#b7a976","#35d4f9","#043a78","#01a0f9","#f4e9bf","#0163da","#01a6f8","#0191f8","#874fe2","#0142a9","#6e7cc9","#015ad2","#016ce4","#0198f8","#f3688c","#0488b8","#116c66","#9bf4f7","#0155ca","#014ec1","#f6cc38","#373b95","#5fc04f","#08508b","#0148b7","#ee7e3a","#163b5d","#a8a7e3","#3b9662","#555cba","#f6e5ab","#97df4f","#1f2d89"];
const KEYS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const colorOf = (k: string): string => COLORS[KEYS.indexOf(k)] ?? '#e8fbff';

const ART: Record<string, string[]> = {
  turtle: ['.........................', '.......ppjMMNN.....pKpK..', '.....pMMjnddjdj..pRPmRPN.', '...NMdndjddd4dddNRPkmDDp.', '..jdgdk44ddjmDPSgRDkRRR..', '.jndddddNPDDJJSSRrRRkp...', '..ddpPRRSSDDNSRrnnpC.....', '.DnRRRRgkDDDNrrRkPSSC....', '..KnngDDDDDngggp.DDJRp...', '.....kDkDPk.......NJSR...', '....PDPjDR.........nDPN..', '...RPDnRK...........gDN..', '..P..Rp..............pC..', '.........................'],
  clownA: ['........', '..dmMP..', '.M4M44M.', '.ddM4dM.', '........'],
  clownB: ['.........', '....pM...', '.LlMM4MC.', '.mM4MM4M.', '.........'],
  tang: ['.........', '...pp....', '.y6eeeFP.', '.66666pH.', '.........'],
  yellow: ['............', '........HP..', '.......HHHH.', '...DH...Hj..', '..HHHH......', '...HH...lHH.', '........HHH.', '............'],
  crab: ['BmgjM.', '.MMMdg', 'M..jM.', 'j.....'],
  star: ['............', '.....M......', '............', '..MMMMMMM...', '..MMMMHM....', '....MMMM....', '...MM..MM...', '............', '............'],
  weedL: ['........', '........', '.P......', '.JN.....', '..J.....', '...J....', '...J.D..', '..J..J..', '.JD.JJ..', '.JD.P.DN', '..PPD..S', '..JJ..JS', '.JP..DS.', '.PD.DS..', '.P.DJJ.S', '...P.P.S', '....D.JJ', '......J.', '........'],
  weedM: ['..........', '..J.......', '..J..DJ...', '...J..S...', '..JJ.JP...', '..J.JP....', '..P.DD.D..', '...P.P.J..', '....D.PD..', '.....DP...'],
  weedR: ['......J.J.', '....J.PJJ.', '....J..JD.', '.....JJ.J.', '......J.J.', '......P...'],
};

const BODY = '#@%8$MWXo*+H';
const WEED = '|)(}{/\\|S';
const FONT = 'ui-monospace, Menlo, monospace';

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const r1 = (n: number) => Math.round(n * 10) / 10;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Render char art as one <text> per row, with absolute-x tspan runs per color.
const artRows = (art: string[], x: number, y: number, fs: number, glyphs: string, opacity = 1, mult = 1): string => {
  const cw = fs * 0.602 * mult, rh = fs;
  let out = '';
  art.forEach((row, ri) => {
    let runs = '', c = 0;
    while (c < row.length) {
      if (row[c] === '.') { c++; continue; }
      const k = row[c], start = c;
      let s = '';
      while (c < row.length && row[c] === k) { s += glyphs[(KEYS.indexOf(k) + c) % glyphs.length].repeat(mult); c++; }
      runs += `<tspan x="${r1(x + start * cw)}" fill="${colorOf(k)}">${esc(s)}</tspan>`;
    }
    if (runs) out += `<text y="${r1(y + (ri + 1) * rh)}"${opacity < 1 ? ` opacity="${opacity}"` : ''}>${runs}</text>`;
  });
  return out;
};

export const honuAscii = (): string => {
  const rnd = rng(20261121);
  let g = '';

  // light rays: slanted columns of '/', swaying slowly
  const rayX = [90, 330, 560, 800, 1040, 1290, 1500];
  rayX.forEach((rx, i) => {
    let t = '';
    for (let r = 0; r < 36; r++) {
      const w = 2 + ((r + i) % 2);
      t += `<tspan x="${r1(rx + r * 5)}" y="${20 + r * 17}">${'/'.repeat(w)}</tspan>`;
    }
    g += `<g class="ray r${i % 3}" style="animation-delay:-${i * 3}s"><text fill="#e8fbff" opacity="${0.07 + (i % 3) * 0.02}">${t}</text></g>`;
  });

  // surface shimmer
  let sh = '';
  for (let i = 0; i < 70; i++) sh += `<tspan x="${r1(rnd() * 1580)}" y="${r1(14 + rnd() * 230)}">${'~.-'[Math.floor(rnd() * 3)]}</tspan>`;
  g += `<g class="shim"><text fill="#cdeefa" opacity=".22">${sh}</text></g>`;

  // sand: bottom rows, low contrast
  g += '<rect x="0" y="925" width="1600" height="75" fill="url(#sand)"/>';
  const sandCols = ['#b7a976', '#e5b77f', '#946a62', '#cbd5ac'];
  let sand = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 166; ) {
      if (rnd() < 0.5) { c++; continue; }
      const col = sandCols[Math.floor(rnd() * sandCols.length)];
      const len = 1 + Math.floor(rnd() * 3);
      let s = '';
      for (let j = 0; j < len; j++) s += ".,:'`"[Math.floor(rnd() * 5)];
      sand += `<tspan x="${r1(c * 9.63)}" y="${948 + r * 16}" fill="${col}">${esc(s)}</tspan>`;
      c += len + 1;
    }
  }
  g += `<text font-size="16" opacity=".5">${sand}</text>`;

  // seaweed
  const weeds: [string, number, number, number][] = [['weedL', 14, 20, 0], ['weedM', 250, 22, 1], ['weedR', 1480, 22, 2], ['weedL', 1380, 18, 3]];
  weeds.forEach(([n, x, fs, i]) => {
    const a = ART[n], h = a.length * fs, top = 958 - h;
    g += `<g class="weed w${i % 3}" style="animation-delay:-${i * 2}s">${artRows(a, x, top, fs, WEED, 0.85)}</g>`;
  });

  // starfish and crab on the sand
  g += `<g>${artRows(ART.star, 40, 905, 14, BODY, 0.9)}</g>`;
  g += `<g class="crab">${artRows(ART.crab, 760, 928, 16, BODY, 0.9)}</g>`;

  // fish
  const fish = (art: string[], x: number, y: number, fs: number, cls: string, dur: number, delay: number, op = 0.95, mult = 1) =>
    `<g class="${cls}" style="animation-duration:${dur}s;animation-delay:-${delay}s"><g transform="translate(${x} ${y})">${artRows(art, 0, 0, fs, BODY, op, mult)}</g></g>`;
  g += fish(ART.yellow, 900, 150, 16, 'fl', 70, 20, 0.95, 2);
  g += fish(ART.tang, 400, 330, 16, 'fl', 58, 35, 0.95, 2);
  g += fish(ART.tang, 1100, 420, 18, 'fr', 80, 10, 0.8);
  g += fish(ART.clownA, 200, 700, 20, 'fr', 62, 5, 0.9);
  g += fish(ART.clownB, 1250, 760, 20, 'fr', 74, 40, 0.9);
  g += fish(ART.yellow, 500, 560, 16, 'fr', 90, 60, 0.7);

  // bubbles
  const bch = ['o', 'O', '.', '°', 'o', '.', 'O', '°'];
  for (let i = 0; i < 16; i++) {
    const x = r1(40 + rnd() * 1520), y = r1(560 + rnd() * 380), dur = 24 + Math.floor(rnd() * 22), del = Math.floor(rnd() * dur);
    g += `<g class="bub" style="animation-duration:${dur}s;animation-delay:-${del}s"><text x="${x}" y="${y}" font-size="${14 + (i % 3) * 4}" fill="#e8fbff" opacity=".6">${bch[i % bch.length]}</text></g>`;
  }

  // turtle: drifts across ~90s, bobs gently
  g += `<g class="tur"><g class="bob"><g transform="translate(420 250)">`
    + artRows(ART.turtle, 6, 8, 18, BODY, 0.18, 2).replace(/<text /g, '<text fill="#0b3d7a" ')
    + artRows(ART.turtle, 0, 0, 18, BODY, 1, 2)
    + '</g></g></g>';

  const css = `text{font-family:${FONT};white-space:pre}
.ray{animation:sway 18s ease-in-out infinite alternate}
.r1{animation-duration:23s}.r2{animation-duration:29s}
@keyframes sway{from{transform:translateX(-22px)}to{transform:translateX(22px)}}
.shim{animation:shim 9s ease-in-out infinite alternate}
@keyframes shim{from{opacity:.4}to{opacity:1}}
.weed{transform-box:fill-box;transform-origin:50% 100%;animation:wv 7s ease-in-out infinite alternate}
.w1{animation-duration:9s}.w2{animation-duration:11s}
@keyframes wv{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
.crab{animation:cr 16s ease-in-out infinite alternate}
@keyframes cr{from{transform:translateX(-60px)}to{transform:translateX(60px)}}
.fl{animation:fl linear infinite}
.fr{animation:fr linear infinite}
@keyframes fr{from{transform:translateX(-700px)}to{transform:translateX(1900px)}}
@keyframes fl{from{transform:translateX(700px)}to{transform:translateX(-1900px)}}
.bub{animation:bub linear infinite}
@keyframes bub{0%{transform:translateY(0);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateY(-900px);opacity:0}}
.tur{animation:tur 90s linear infinite}
@keyframes tur{from{transform:translateX(-800px)}to{transform:translateX(1300px)}}
.bob{animation:bob 7s ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(-14px)}to{transform:translateY(14px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#35a6f0"/><stop offset=".45" stop-color="#1d7ad8"/><stop offset="1" stop-color="#1650b2"/></linearGradient><linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7a976" stop-opacity="0"/><stop offset="1" stop-color="#7c4d36" stop-opacity=".35"/></linearGradient></defs><style>${css}</style><rect width="1600" height="1000" fill="url(#sky)"/>${g}</svg>`;
};
