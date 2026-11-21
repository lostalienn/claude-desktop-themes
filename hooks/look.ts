// The supported way to paint: a theme becomes a look for $.theme.set (colors from the design system, a scene behind
// the conversation). Claude Desktop builds that no longer load the REACT_PROFILE extension draw this.
import type { ThemeSetArgs } from 'claude-code'

import type { Theme } from '../types'
import { makeColors } from './make-colors.js'
import { honuAscii } from './ascii-honu'

const hex = (c: string) => /^#[0-9a-f]{6}$/i.test(c)
const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
const mix = (a: string, b: string, k: number) =>
  '#' + rgb(a).map((x, i) => Math.round(x + ((rgb(b)[i] ?? x) - x) * k).toString(16).padStart(2, '0')).join('')
const luma = (c: string) => {
  const [r, g, b] = rgb(c)
  return (.2126 * r + .7152 * g + .0722 * b) / 255
}

// the design system's colors from the theme's three, or undefined when they would not paint
const colorsOf = (t: Theme) => {
  if (!t.bg || !t.text || !hex(t.bg) || !hex(t.text)) return undefined
  const dark = luma(t.bg) < .5
  const lift = dark ? '#ffffff' : '#000000'
  const anchors = {
    'surface-0': t.bg,
    'surface-1': mix(t.bg, lift, dark ? .04 : .02),
    'surface-2': mix(t.bg, lift, dark ? .07 : .02),
    'surface-3': mix(t.bg, lift, dark ? .1 : .02),
    'text-primary': t.text,
    'text-secondary': mix(t.text, t.bg, .18),
    'text-muted': mix(t.text, t.bg, .3),
  }
  // (light mode: the cards sit lighter than the page, so they go toward white)
  if (!dark) {
    anchors['surface-1'] = mix(t.bg, '#ffffff', .25)
    anchors['surface-2'] = anchors['surface-3'] = mix(t.bg, '#ffffff', .45)
  }
  try {
    const { theme, problems } = makeColors({
      label: t.name, id: t.id, only: dark ? 'dark' : 'light',
      roles: t.accent && hex(t.accent) ? { accent: t.accent } : undefined,
      [dark ? 'dark' : 'light']: { gray: { anchors } },
    })
    return problems.some(p => p.startsWith("Desktop won't paint")) ? undefined : { theme, dark }
  } catch {
    return undefined
  }
}

// undefined: Claude's own look
export const lookOf = (t: Theme | undefined, veil: number): ThemeSetArgs | undefined => {
  if (!t?.bg) return undefined
  const colors = colorsOf(t)
  const look: ThemeSetArgs = {}
  if (colors) look.colors = colors.theme
  if (t.wallpaper) {
    look.backdrop = { scene: t.id, glass: { blur: 14, tint: t.bg as `#${string}`, opacity: Math.max(.25, Math.min(.9, veil + .25)) } }
    look.overrideColorScheme = colors?.dark === false ? 'light' : 'dark'
  } else if (hex(t.bg)) {
    look.backdrop = { color: t.bg as `#${string}` }
  }
  return look.colors || look.backdrop ? look : undefined
}

// ---- scenes: pure vector, slow CSS motion, a resting place for each moving part ----

// the same numbers each time for the same seed
const rand = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const W = 1600, H = 1000

const skyOf = (t: Theme) => {
  const sky = t.vars?.['wall-sky'] ?? ''
  // the last gradient is the sky (bands() lays light bands over it)
  const last = sky.slice(Math.max(sky.lastIndexOf('linear-gradient(#'), sky.lastIndexOf('radial-gradient(')))
  const stops = [...last.matchAll(/(#[0-9a-f]{6})(?:\s+(\d+)%)?/gi)].map(m => ({ c: m[1] ?? '#000000', at: m[2] }))
  if (stops.length < 2) return [{ c: t.bg ?? '#111111', at: 0 }, { c: mix(t.bg ?? '#111111', '#000000', .3), at: 100 }]
  return stops.map((s, i) => ({ c: s.c, at: s.at !== undefined ? Number(s.at) : Math.round((i / (stops.length - 1)) * 100) }))
}

const grad = (id: string, stops: { c: string; at: number }[]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(s => `<stop offset="${s.at}%" stop-color="${s.c}"/>`).join('')}</linearGradient>`

const particles = (r: () => number, n: number, fill: string, cls: string) =>
  Array.from({ length: n }, (_, i) => {
    const x = Math.round(r() * W), y = Math.round(r() * H), s = 2 + Math.round(r() * 4), d = 18 + Math.round(r() * 30)
    return `<rect class="${cls}" x="${x}" y="${y}" width="${s}" height="${s}" rx="1" fill="${fill}" opacity="${(.25 + r() * .45).toFixed(2)}" style="animation-duration:${d}s;animation-delay:-${Math.round(r() * d)}s"/>`
  }).join('')

const honu = (t: Theme) => {
  const r = rand(7)
  const rays = Array.from({ length: 6 }, (_, i) => {
    const x = 120 + i * 260 + Math.round(r() * 80)
    return `<polygon class="ray" points="${x},0 ${x + 90},0 ${x + 260},${H} ${x + 120},${H}" fill="#ffffff" opacity=".07" style="animation-delay:-${i * 3}s"/>`
  }).join('')
  const bubbles = Array.from({ length: 26 }, () => {
    const x = Math.round(r() * W), rad = 3 + Math.round(r() * 7), d = 14 + Math.round(r() * 16)
    return `<circle class="bub" cx="${x}" cy="${H + 20}" r="${rad}" fill="none" stroke="#e3f6f2" stroke-width="1.5" opacity=".5" style="animation-duration:${d}s;animation-delay:-${Math.round(r() * d)}s"/>`
  }).join('')
  const weeds = Array.from({ length: 9 }, (_, i) => {
    const x = 40 + i * 190 + Math.round(r() * 60), h = 120 + Math.round(r() * 140)
    return `<path class="weed" d="M${x} ${H} q 30 -${h / 2} 0 -${h} q -20 ${h / 3} 10 ${h}" fill="#2f8f6a" opacity=".55" style="animation-delay:-${i}s"/>`
  }).join('')
  const fish = Array.from({ length: 5 }, (_, i) => {
    const y = 200 + Math.round(r() * 450), c = ['#f6cc38', '#ee7e3a', '#69ebfa', '#f3688c', '#97df4f'][i]
    return `<g class="fish" style="animation-duration:${40 + i * 9}s;animation-delay:-${i * 11}s"><g transform="translate(0 ${y})"><ellipse cx="0" cy="0" rx="18" ry="9" fill="${c}"/><polygon points="-16,0 -30,-9 -30,9" fill="${c}"/></g></g>`
  }).join('')
  return `<rect width="${W}" height="${H}" fill="url(#sky)"/>
${rays}
<path d="M0 ${H - 70} Q 400 ${H - 110} 800 ${H - 75} T ${W} ${H - 80} V ${H} H 0 Z" fill="#e5b77f" opacity=".55"/>
${weeds}
${fish}
<g class="turtle"><g transform="translate(0 420)">
<ellipse cx="-62" cy="-30" rx="38" ry="12" fill="#3b9662" transform="rotate(-28 -62 -30)" class="fl"/>
<ellipse cx="-62" cy="30" rx="38" ry="12" fill="#3b9662" transform="rotate(28 -62 30)" class="fl"/>
<ellipse cx="40" cy="-34" rx="44" ry="13" fill="#3b9662" transform="rotate(-38 40 -34)" class="fl"/>
<ellipse cx="40" cy="34" rx="44" ry="13" fill="#3b9662" transform="rotate(38 40 34)" class="fl"/>
<ellipse cx="102" cy="0" rx="24" ry="18" fill="#5fc04f"/>
<circle cx="112" cy="-6" r="3" fill="#101b29"/>
<ellipse cx="0" cy="0" rx="86" ry="58" fill="#7c4d36"/>
<ellipse cx="0" cy="0" rx="70" ry="45" fill="#946a62"/>
<path d="M-40 -30 L0 -12 L40 -30 M-40 30 L0 12 L40 30 M0 -12 V12 M-60 0 H60" stroke="#5a3a28" stroke-width="5" fill="none" opacity=".7"/>
</g></g>
${bubbles}
${particles(r, 30, '#e3f6f2', 'mote')}`
}

const generic = (t: Theme) => {
  const r = rand(t.id.length * 97 + 13)
  const accent = t.accent && hex(t.accent) ? t.accent : '#ffffff'
  const glows = Array.from({ length: 3 }, (_, i) =>
    `<circle class="glow" cx="${Math.round(200 + r() * 1200)}" cy="${Math.round(150 + r() * 600)}" r="${Math.round(160 + r() * 160)}" fill="${accent}" opacity=".12" style="animation-delay:-${i * 9}s"/>`).join('')
  return `<rect width="${W}" height="${H}" fill="url(#sky)"/>${glows}${particles(r, 46, t.text && hex(t.text) ? t.text : '#ffffff', 'mote')}`
}

const STYLE = `<style>
.ray{animation:sway 18s ease-in-out infinite alternate;transform-origin:50% 0}
.bub{animation:rise linear infinite}
.weed{animation:sway 7s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
.fish{animation:swim linear infinite}
.turtle{animation:glide 90s linear infinite}
.fl{animation:paddle 4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:100% 50%}
.mote{animation:drift linear infinite}
.glow{animation:breathe 26s ease-in-out infinite alternate}
@keyframes sway{from{transform:skewX(-4deg)}to{transform:skewX(4deg)}}
@keyframes rise{from{transform:translateY(0)}to{transform:translateY(-1060px)}}
@keyframes swim{from{transform:translateX(-80px)}to{transform:translateX(1700px)}}
@keyframes glide{from{transform:translate(-220px,0)}50%{transform:translate(800px,60px)}to{transform:translate(1820px,0)}}
@keyframes paddle{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@keyframes drift{from{transform:translateY(0)}to{transform:translateY(-120px)}}
@keyframes breathe{from{transform:scale(.9);opacity:.08}to{transform:scale(1.1);opacity:.16}}
</style>`

// the scene for a wallpaper theme: its sky, and for Honu Lagoon its turtle, fish, rays and bubbles
export const sceneOf = (t: Theme) => t.id === 'honu-lagoon' ? honuAscii() :
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${STYLE}<defs>${grad('sky', skyOf(t))}</defs>${t.id === 'honu-lagoon' ? honu(t) : generic(t)}</svg>`
