/**
 * generate-header.js
 *
 * Generates an ultra-premium animated SVG header with:
 * - Aurora gradient background with animated color shift
 * - Floating neon particle network with connections
 * - Animated Vietnam flag (waving effect)
 * - Glassmorphism card overlay
 * - Name and role with animated gradient fills
 * - Terminal-style decorative prompt with cursor blink
 * - Animated scanning line effect
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'assets');

mkdirSync(OUTPUT_DIR, { recursive: true });

function generateHeader() {
  const width = 900;
  const height = 320;

  // Generate particle positions (deterministic using golden ratio)
  const particles = [];
  const PHI = 1.618033988749895;
  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    particles.push({
      cx: ((t * PHI * width) % width).toFixed(1),
      cy: ((t * PHI * PHI * height) % height).toFixed(1),
      r: (0.4 + (i % 6) * 0.35).toFixed(1),
      delay: ((i * 0.31) % 8).toFixed(1),
      dur: (4 + (i % 5)).toFixed(1),
      opacity: (0.06 + (i % 8) * 0.035).toFixed(3),
      color: i % 3 === 0 ? '#818cf8' : i % 3 === 1 ? '#c084fc' : '#f472b6',
    });
  }

  // Grid lines
  const gridLines = [];
  for (let x = 0; x <= width; x += 50) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(99,102,241,0.03)" stroke-width="0.5"/>`);
  }
  for (let y = 0; y <= height; y += 50) {
    gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(99,102,241,0.03)" stroke-width="0.5"/>`);
  }

  // Connection lines between nearby particles
  const connections = [];
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length && connections.length < 25; j++) {
      const dx = parseFloat(particles[i].cx) - parseFloat(particles[j].cx);
      const dy = parseFloat(particles[i].cy) - parseFloat(particles[j].cy);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 50 && dist < 140) {
        connections.push({
          x1: particles[i].cx, y1: particles[i].cy,
          x2: particles[j].cx, y2: particles[j].cy,
          delay: particles[i].delay,
          color: particles[i].color,
        });
      }
    }
  }

  // Vietnam flag SVG with waving animation
  const flagW = 36, flagH = 24;
  const flagSvg = `
    <g transform="translate(${width / 2 - flagW / 2}, 186)">
      <!-- Flag shadow -->
      <rect x="1" y="1" width="${flagW}" height="${flagH}" rx="3" fill="rgba(0,0,0,0.3)" filter="url(#flagShadow)"/>
      <!-- Flag body -->
      <rect width="${flagW}" height="${flagH}" rx="3" fill="#DA251D">
        <animate attributeName="rx" values="3;4;3" dur="3s" repeatCount="indefinite"/>
      </rect>
      <!-- Star -->
      <polygon points="${flagW/2},${flagH*0.18} ${flagW*0.38},${flagH*0.82} ${flagW*0.82},${flagH*0.36} ${flagW*0.18},${flagH*0.36} ${flagW*0.62},${flagH*0.82}" fill="#FFFF00">
        <animate attributeName="opacity" values="1;0.85;1" dur="2s" repeatCount="indefinite"/>
      </polygon>
      <!-- Waving overlay effect -->
      <rect width="${flagW}" height="${flagH}" rx="3" fill="url(#flagWave)" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite"/>
      </rect>
    </g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Aurora gradient background with animation -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#050510">
        <animate attributeName="stop-color" values="#050510;#0a0825;#050510" dur="8s" repeatCount="indefinite"/>
      </stop>
      <stop offset="30%" style="stop-color:#0d1117"/>
      <stop offset="60%" style="stop-color:#0c0520">
        <animate attributeName="stop-color" values="#0c0520;#100d2b;#0c0520" dur="10s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#050510">
        <animate attributeName="stop-color" values="#050510;#0a0618;#050510" dur="6s" repeatCount="indefinite"/>
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
    <linearGradient id="name" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e2e8f0"/>
      <stop offset="40%" style="stop-color:#ffffff"/>
      <stop offset="70%" style="stop-color:#c7d2fe"/>
      <stop offset="100%" style="stop-color:#a5b4fc"/>
    </linearGradient>

    <!-- Role gradient with animation -->
    <linearGradient id="role" x1="0%" y1="0%" x2="100%" y2="0%">
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

    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Stronger glow -->
    <filter id="glow2">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Flag shadow -->
    <filter id="flagShadow">
      <feGaussianBlur stdDeviation="2"/>
    </filter>

    <!-- Flag waving gradient -->
    <linearGradient id="flagWave" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0">
        <animate attributeName="offset" values="0;0.3;0" dur="2s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:white;stop-opacity:0.4">
        <animate attributeName="offset" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
    </linearGradient>

    <!-- Scanline pattern -->
    <pattern id="scan" patternUnits="userSpaceOnUse" width="4" height="4">
      <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.008)" stroke-width="1"/>
    </pattern>

    <!-- Animated border gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3">
        <animate attributeName="stop-opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.3">
        <animate attributeName="stop-opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>

    <!-- Radial glow for center -->
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" rx="12" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" rx="12" fill="url(#scan)"/>
  <rect width="${width}" height="${height}" rx="12" fill="url(#centerGlow)"/>

  <!-- Grid -->
  <g opacity="0.6">${gridLines.join('')}</g>

  <!-- Scanning line effect -->
  <rect x="0" y="0" width="${width}" height="2" fill="url(#accent)" opacity="0.08" rx="1">
    <animate attributeName="y" values="0;${height};0" dur="6s" repeatCount="indefinite"/>
  </rect>

  <!-- Particles -->
  <g>${particles.map(p => `
    <circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${p.color}" opacity="${p.opacity}">
      <animate attributeName="opacity" values="${p.opacity};${(parseFloat(p.opacity) + 0.18).toFixed(3)};${p.opacity}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${p.cy};${(parseFloat(p.cy) - 8).toFixed(1)};${p.cy}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
    </circle>`).join('')}
  </g>

  <!-- Connections -->
  <g opacity="0.08">${connections.map(c => `
    <line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" stroke="${c.color}" stroke-width="0.5">
      <animate attributeName="opacity" values="0.04;0.25;0.04" dur="5s" begin="${c.delay}s" repeatCount="indefinite"/>
    </line>`).join('')}
  </g>

  <!-- Top accent line with glow -->
  <rect x="100" y="18" width="700" height="1.5" rx="1" fill="url(#accent)" filter="url(#glow)" opacity="0.7">
    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Terminal prompt -->
  <g transform="translate(55, 58)">
    <text font-family="'JetBrains Mono','Fira Code','Cascadia Code',monospace" font-size="11.5" opacity="0.7">
      <tspan fill="#6366f1">~/hoangtuvungcao</tspan>
      <tspan fill="#a855f7"> $</tspan>
      <tspan fill="#38bdf8"> cat</tspan>
      <tspan fill="#64748b"> profile.md</tspan>
    </text>
    <rect x="225" y="-9" width="1.5" height="14" fill="#a855f7" rx="1">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- Name with fade-in -->
  <g transform="translate(${width / 2}, 120)">
    <text font-family="'Inter','Segoe UI',system-ui,-apple-system,sans-serif" font-size="42" font-weight="800" fill="url(#name)" text-anchor="middle" letter-spacing="-0.5" opacity="0">
      Nguyen Van Trong
      <animate attributeName="opacity" values="0;1" dur="0.8s" begin="0.2s" fill="freeze"/>
    </text>
  </g>

  <!-- Underline for name -->
  <rect x="${width / 2 - 100}" y="130" width="200" height="1" rx="1" fill="url(#accent)" opacity="0" filter="url(#glow)">
    <animate attributeName="opacity" values="0;0.4" dur="0.5s" begin="0.8s" fill="freeze"/>
    <animate attributeName="width" values="0;200" dur="0.8s" begin="0.6s" fill="freeze"/>
  </rect>

  <!-- Role -->
  <g transform="translate(${width / 2}, 162)">
    <text font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="14.5" fill="url(#role)" text-anchor="middle" font-weight="500" letter-spacing="5" opacity="0">
      BACKEND ENGINEERING · DEVOPS · SECURITY
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.5s" fill="freeze"/>
    </text>
  </g>

  <!-- Vietnam Flag (animated) -->
  ${flagSvg}

  <!-- Status line -->
  <g transform="translate(${width / 2}, 230)" opacity="0">
    <text font-family="'JetBrains Mono',monospace" font-size="11" text-anchor="middle">
      <tspan fill="#22c55e">●</tspan>
      <tspan fill="#64748b" dx="6">Secure systems</tspan>
      <tspan fill="#30363d" dx="12">|</tspan>
      <tspan fill="#64748b" dx="12">Go · Rust · Linux · Cloud Native</tspan>
    </text>
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1s" fill="freeze"/>
  </g>

  <!-- Decorative braces -->
  <text x="18" y="${height / 2}" font-family="monospace" font-size="80" fill="#6366f1" opacity="0.03" dominant-baseline="central">{</text>
  <text x="${width - 54}" y="${height / 2}" font-family="monospace" font-size="80" fill="#6366f1" opacity="0.03" dominant-baseline="central">}</text>

  <!-- Orbiting dots at corners -->
  <circle r="1.5" fill="#6366f1" opacity="0.5">
    <animate attributeName="cx" values="30;${width - 30};${width - 30};30;30" dur="20s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="30;30;${height - 30};${height - 30};30" dur="20s" repeatCount="indefinite"/>
  </circle>
  <circle r="1" fill="#a855f7" opacity="0.4">
    <animate attributeName="cx" values="${width - 30};30;30;${width - 30};${width - 30}" dur="20s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="30;30;${height - 30};${height - 30};30" dur="20s" repeatCount="indefinite"/>
  </circle>

  <!-- Bottom accent -->
  <rect x="150" y="${height - 30}" width="600" height="1" rx="1" fill="url(#accent)" opacity="0">
    <animate attributeName="opacity" values="0;0.35" dur="0.6s" begin="0.4s" fill="freeze"/>
    <animate attributeName="width" values="0;600" dur="1.4s" begin="0.3s" fill="freeze"/>
  </rect>

  <!-- Bottom info -->
  <g transform="translate(${width / 2}, ${height - 14})">
    <text font-family="'JetBrains Mono',monospace" font-size="9" fill="#334155" text-anchor="middle" letter-spacing="2.5">
      VIETNAM · TAY NGUYEN UNIVERSITY · OPEN SOURCE
    </text>
  </g>

  <!-- Animated border -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="none" stroke="url(#borderGrad)" stroke-width="1"/>
</svg>`;

  writeFileSync(join(OUTPUT_DIR, 'header.svg'), svg);
  console.log('Generated header.svg');
}

generateHeader();
