/**
 * Generates the default Open Graph / social sharing image (1200x630).
 * Run with: node scripts/generate-og.mjs
 *
 * Renders a brand-aligned SVG (navy blueprint background, cyan accent,
 * draughting motif) and composites the light logo on top, then exports an
 * optimised JPG to public/og/og-default.jpg.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const W = 1200;
const H = 630;

// Brand palette (from tailwind.config.ts / tokens.css)
const NAVY_1000 = '#050F25';
const NAVY_900 = '#071B3B';
const NAVY_700 = '#11315C';
const CYAN = '#3DD9D6';
const BLUE_400 = '#5A8CFF';

const FONT = 'DejaVu Sans';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY_1000}"/>
      <stop offset="0.55" stop-color="${NAVY_900}"/>
      <stop offset="1" stop-color="${NAVY_700}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.28" r="0.6">
      <stop offset="0" stop-color="${BLUE_400}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${BLUE_400}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0 H0 V48" fill="none" stroke="#FFFFFF" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Draughting motif: isometric wireframe + dimension lines (subtle, right side) -->
  <g stroke="${BLUE_400}" stroke-opacity="0.30" fill="none" stroke-width="2">
    <!-- isometric cube -->
    <path d="M905 165 L1010 205 L1010 320 L905 360 L800 320 L800 205 Z"/>
    <path d="M905 165 L905 280 M905 280 L1010 320 M905 280 L800 320"/>
    <path d="M800 205 L905 245 L1010 205 M905 245 L905 360"/>
  </g>
  <g stroke="${CYAN}" stroke-opacity="0.45" fill="none" stroke-width="2">
    <!-- dimension line with ticks -->
    <path d="M800 415 H1040"/>
    <path d="M800 408 V422 M1040 408 V422"/>
    <circle cx="920" cy="415" r="4" fill="${CYAN}" fill-opacity="0.5" stroke="none"/>
  </g>
  <!-- swoosh arcs echoing the logo emblem -->
  <g fill="none" stroke-linecap="round">
    <path d="M1015 470 A 150 150 0 0 1 760 520" stroke="${CYAN}" stroke-opacity="0.40" stroke-width="6"/>
    <path d="M1060 500 A 200 200 0 0 1 770 575" stroke="${BLUE_400}" stroke-opacity="0.25" stroke-width="4"/>
  </g>

  <!-- Eyebrow pill -->
  <g>
    <rect x="64" y="232" width="328" height="44" rx="22" fill="${CYAN}" fill-opacity="0.10" stroke="${CYAN}" stroke-opacity="0.45" stroke-width="1"/>
    <circle cx="92" cy="254" r="6" fill="${CYAN}"/>
    <text x="112" y="261" font-family="${FONT}" font-size="20" font-weight="bold" letter-spacing="2" fill="#BFF3F1">EST. 1981 · SOUTH AFRICA</text>
  </g>

  <!-- Headline -->
  <text x="62" y="372" font-family="${FONT}" font-size="86" font-weight="bold" fill="#FFFFFF">Engineering careers</text>
  <text x="62" y="466" font-family="${FONT}" font-size="86" font-weight="bold" fill="${CYAN}">start here.</text>

  <!-- Subtext -->
  <text x="64" y="526" font-family="${FONT}" font-size="29" fill="#C7D7FF">Specialist draughting &amp; CAD training — job-ready, industry-built.</text>

  <!-- Accreditation footer -->
  <text x="64" y="582" font-family="${FONT}" font-size="22" letter-spacing="1" fill="#6FE6E2">SAQA 66881  ·  DHET  ·  QCTO</text>
  <text x="${W - 64}" y="582" text-anchor="end" font-family="${FONT}" font-size="22" fill="#8693AC">academydraughting.com</text>
</svg>`;

const logoWidth = 300; // 641x232 → height ~108
const logo = await sharp(join(ROOT, 'public/assets/logo-light.png'))
  .resize({ width: logoWidth })
  .toBuffer();

const out = join(ROOT, 'public/og/og-default.jpg');
const info = await sharp(Buffer.from(svg))
  .composite([{ input: logo, top: 64, left: 64 }])
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:2:0' })
  .toFile(out);

console.log(`Wrote ${out} — ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB`);
