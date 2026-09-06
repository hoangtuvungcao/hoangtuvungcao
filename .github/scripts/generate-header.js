/**
 * generate-header.js
 *
 * Generates an ultra-premium animated SVG header with:
 * - Aurora gradient background with color shift animation
 * - Floating neon particle network with dynamic connections
 * - Precision mathematical animated Vietnam flag with silk wave effect & cyber badge
 * - Name and role with animated gradient fills & typing cursor
 * - Terminal-style decorative prompt
 * - Scanning beam & orbiting corner dots
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'assets');

mkdirSync(OUTPUT_DIR, { recursive: true });

function generateHeader() {
  const width = 900;
  const height = 310;

  // Generate particle positions (deterministic using golden ratio)
  const particles = [];
  const PHI = 1.618033988749895;
  for (let i = 0; i < 55; i++) {
    const t = i / 55;
    particles.push({
      cx: ((t * PHI * width) % width).toFixed(1),
      cy: ((t * PHI * PHI * height) % height).toFixed(1),
      r: (0.5 + (i % 5) * 0.35).toFixed(1),
      delay: ((i * 0.33) % 7).toFixed(1),
      dur: (4 + (i % 4)).toFixed(1),
      opacity: (0.07 + (i % 7) * 0.03).toFixed(3),
      color: i % 3 === 0 ? '#818cf8' : i % 3 === 1 ? '#c084fc' : '#f472b6',
    });
  }

  // Grid lines
  const gridLines = [];
  for (let x = 0; x <= width; x += 50) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(99,102,241,0.025)" stroke-width="0.5"/>`);
  }
  for (let y = 0; y <= height; y += 50) {
    gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(99,102,241,0.025)" stroke-width="0.5"/>`);
  }

  // Connection lines between nearby particles
  const connections = [];
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length && connections.length < 22; j++) {
      const dx = parseFloat(particles[i].cx) - parseFloat(particles[j].cx);
      const dy = parseFloat(particles[i].cy) - parseFloat(particles[j].cy);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 50 && dist < 135) {
        connections.push({
          x1: particles[i].cx, y1: particles[i].cy,
          x2: particles[j].cx, y2: particles[j].cy,
          delay: particles[i].delay,
          color: particles[i].color,
        });
      }
    }
  }

  // Mathematical 10-point star for Vietnam flag
  const flagW = 38, flagH = 25;
  const cx = flagW / 2, cy = flagH / 2;
  const R = 7.8, r = R * 0.381966;
  const starPoints = [];
  for (let k = 0; k < 10; k++) {
    const angle = -Math.PI / 2 + (k * Math.PI) / 5;
    const rad = k % 2 === 0 ? R : r;
    starPoints.push(`${(cx + rad * Math.cos(angle)).toFixed(2)},${(cy + rad * Math.sin(angle)).toFixed(2)}`);
  }

  const badgeTotalW = flagW + 8 + 84; // ~130px
  const badgeX = (width - badgeTotalW) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Aurora background gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#050510">
        <animate attributeName="stop-color" values="#050510;#090724;#050510" dur="8s" repeatCount="indefinite"/>
      </stop>
      <stop offset="35%" style="stop-color:#0d1117"/>
      <stop offset="65%" style="stop-color:#0b061e">
        <animate attributeName="stop-color" values="#0b061e;#110d2d;#0b061e" dur="10s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#050510">
        <animate attributeName="stop-color" values="#050510;#0a0618;#050510" dur="7s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>

    <!-- Neon accent gradient -->
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0"/>
      <stop offset="15%" style="stop-color:#6366f1;stop-opacity:1">
        <animate attributeName="stop-color" values="#6366f1;#818cf8;#6366f1" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1">
        <animate attributeName="stop-color" values="#a855f7;#c084fc;#a855f7" dur="5s" repeatCount="indefinite"/>
      </stop>
      <stop offset="85%" style="stop-color:#ec4899;stop-opacity:1">
        <animate attributeName="stop-color" values="#ec4899;#f472b6;#ec4899" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0"/>
    </linearGradient>

    <!-- Name gradient -->
    <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f1f5f9"/>
      <stop offset="45%" style="stop-color:#ffffff"/>
      <stop offset="75%" style="stop-color:#c7d2fe"/>
      <stop offset="100%" style="stop-color:#a5b4fc"/>
    </linearGradient>

    <!-- Role gradient -->
    <linearGradient id="roleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#818cf8">
        <animate attributeName="stop-color" values="#818cf8;#a78bfa;#818cf8" dur="6s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#a78bfa">
        <animate attributeName="stop-color" values="#a78bfa;#c084fc;#a78bfa" dur="5s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#c084fc">
        <animate attributeName="stop-color" values="#c084fc;#e879f9;#c084fc" dur="7s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>

    <!-- Silk waving gradient for flag -->
    <linearGradient id="flagWave" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0"/>
      <stop offset="35%" style="stop-color:white;stop-opacity:0.35">
        <animate attributeName="offset" values="0.1;0.7;0.1" dur="2.5s" repeatCount="indefinite"/>
      </stop>
      <stop offset="70%" style="stop-color:black;stop-opacity:0.2">
        <animate attributeName="offset" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
    </linearGradient>

    <!-- Border gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3">
        <animate attributeName="stop-opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.3">
        <animate attributeName="stop-opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>

    <!-- Glow filters -->
    <filter id="glow"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="starGlow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

    <!-- Scan pattern -->
    <pattern id="scan" patternUnits="userSpaceOnUse" width="4" height="4">
      <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.007)" stroke-width="1"/>
    </pattern>

    <!-- Radial center glow -->
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- Base background -->
  <rect width="${width}" height="${height}" rx="12" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" rx="12" fill="url(#scan)"/>
  <rect width="${width}" height="${height}" rx="12" fill="url(#centerGlow)"/>

  <!-- Grid overlay -->
  <g opacity="0.6">${gridLines.join('')}</g>

  <!-- Scanning beam -->
  <rect x="0" y="0" width="${width}" height="2" fill="url(#accent)" opacity="0.07" rx="1">
    <animate attributeName="y" values="0;${height};0" dur="7s" repeatCount="indefinite"/>
  </rect>

  <!-- Floating particles -->
  <g>${particles.map(p => `
    <circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${p.color}" opacity="${p.opacity}">
      <animate attributeName="opacity" values="${p.opacity};${(parseFloat(p.opacity) + 0.18).toFixed(3)};${p.opacity}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${p.cy};${(parseFloat(p.cy) - 7).toFixed(1)};${p.cy}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
    </circle>`).join('')}
  </g>

  <!-- Connections -->
  <g opacity="0.08">${connections.map(c => `
    <line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" stroke="${c.color}" stroke-width="0.5">
      <animate attributeName="opacity" values="0.03;0.22;0.03" dur="5s" begin="${c.delay}s" repeatCount="indefinite"/>
    </line>`).join('')}
  </g>

  <!-- Top accent line -->
  <rect x="120" y="16" width="660" height="1.5" rx="1" fill="url(#accent)" filter="url(#glow)" opacity="0.7">
    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Terminal prompt on top-left -->
  <g transform="translate(50, 54)">
    <text font-family="'JetBrains Mono','Fira Code',monospace" font-size="11" opacity="0.75">
      <tspan fill="#6366f1">~/hoangtuvungcao</tspan>
      <tspan fill="#a855f7"> $</tspan>
      <tspan fill="#38bdf8"> cat</tspan>
      <tspan fill="#64748b"> profile.md</tspan>
    </text>
    <rect x="220" y="-9" width="1.5" height="13" fill="#a855f7" rx="1">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- Name -->
  <g transform="translate(${width / 2}, 116)">
    <text font-family="'Inter',-apple-system,sans-serif" font-size="40" font-weight="800" fill="url(#nameGrad)" text-anchor="middle" letter-spacing="-0.5" opacity="0">
      Nguyen Van Trong
      <animate attributeName="opacity" values="0;1" dur="0.8s" begin="0.15s" fill="freeze"/>
    </text>
  </g>

  <!-- Underline accent -->
  <rect x="${width / 2 - 90}" y="126" width="180" height="1" rx="1" fill="url(#accent)" opacity="0" filter="url(#glow)">
    <animate attributeName="opacity" values="0;0.45" dur="0.5s" begin="0.7s" fill="freeze"/>
    <animate attributeName="width" values="0;180" dur="0.8s" begin="0.5s" fill="freeze"/>
  </rect>

  <!-- Role -->
  <g transform="translate(${width / 2}, 156)">
    <text font-family="'Inter',-apple-system,sans-serif" font-size="13.5" fill="url(#roleGrad)" text-anchor="middle" font-weight="600" letter-spacing="4.5" opacity="0">
      BACKEND ENGINEERING · DEVOPS · SECURITY
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.4s" fill="freeze"/>
    </text>
  </g>

  <!-- Vietnam Flag & Cyber Badge -->
  <g transform="translate(${badgeX}, 176)">
    <!-- Flag background with slight wave -->
    <rect width="${flagW}" height="${flagH}" rx="3.5" fill="#DA251D">
      <animate attributeName="rx" values="3.5;4.5;3.5" dur="3s" repeatCount="indefinite"/>
    </rect>
    <!-- Perfect 10-point gold star -->
    <polygon points="${starPoints.join(' ')}" fill="#FFFF00" filter="url(#starGlow)">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
    </polygon>
    <!-- Silk wave overlay -->
    <rect width="${flagW}" height="${flagH}" rx="3.5" fill="url(#flagWave)" opacity="0.3"/>
    <!-- Flag outline -->
    <rect width="${flagW}" height="${flagH}" rx="3.5" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.7"/>

    <!-- Vietnam text badge -->
    <rect x="${flagW + 8}" y="2" width="76" height="21" rx="10.5" fill="rgba(218,37,29,0.1)" stroke="rgba(218,37,29,0.3)" stroke-width="0.8"/>
    <circle cx="${flagW + 20}" cy="12.5" r="2.5" fill="#f87171">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="${flagW + 50}" y="16" font-family="'JetBrains Mono',monospace" font-size="9.5" fill="#fca5a5" font-weight="600" text-anchor="middle">VIETNAM</text>
  </g>

  <!-- Status line -->
  <g transform="translate(${width / 2}, 232)" opacity="0">
    <text font-family="'JetBrains Mono',monospace" font-size="11" text-anchor="middle">
      <tspan fill="#22c55e">●</tspan>
      <tspan fill="#64748b" dx="6">Defensive Security &amp; Kernel Ops</tspan>
      <tspan fill="#30363d" dx="12">|</tspan>
      <tspan fill="#64748b" dx="12">Go · Rust · eBPF/XDP · Linux</tspan>
    </text>
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.9s" fill="freeze"/>
  </g>

  <!-- Decorative braces -->
  <text x="18" y="${height / 2}" font-family="monospace" font-size="80" fill="#6366f1" opacity="0.025" dominant-baseline="central">{</text>
  <text x="${width - 54}" y="${height / 2}" font-family="monospace" font-size="80" fill="#6366f1" opacity="0.025" dominant-baseline="central">}</text>

  <!-- Bottom accent line -->
  <rect x="160" y="${height - 28}" width="580" height="1" rx="1" fill="url(#accent)" opacity="0">
    <animate attributeName="opacity" values="0;0.35" dur="0.6s" begin="0.3s" fill="freeze"/>
    <animate attributeName="width" values="0;580" dur="1.2s" begin="0.2s" fill="freeze"/>
  </rect>

  <!-- Bottom info -->
  <g transform="translate(${width / 2}, ${height - 12})">
    <text font-family="'JetBrains Mono',monospace" font-size="8.5" fill="#334155" text-anchor="middle" letter-spacing="2.5">
      TAY NGUYEN, VIETNAM · DEFENSIVE SECURITY &amp; KERNEL SYSTEMS
    </text>
  </g>

  <!-- Outer border with animated gradient -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="none" stroke="url(#borderGrad)" stroke-width="1"/>
</svg>`;

  writeFileSync(join(OUTPUT_DIR, 'header.svg'), svg);
  console.log('Generated header.svg');
}

generateHeader();
