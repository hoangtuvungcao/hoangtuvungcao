/**
 * generate-header.js
 *
 * Generates an animated SVG header with:
 * - Dark gradient background with grid overlay
 * - Floating particle network animation
 * - Name and role with gradient fills
 * - Terminal-style decorative prompt
 * - Animated accent lines
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'assets');

mkdirSync(OUTPUT_DIR, { recursive: true });

function generateHeader() {
  const width = 900;
  const height = 300;

  // Generate particle positions (deterministic seed-like using golden ratio)
  const particles = [];
  const PHI = 1.618033988749895;
  for (let i = 0; i < 45; i++) {
    const t = i / 45;
    particles.push({
      cx: ((t * PHI * width) % width).toFixed(1),
      cy: ((t * PHI * PHI * height) % height).toFixed(1),
      r: (0.5 + (i % 5) * 0.4).toFixed(1),
      delay: ((i * 0.37) % 6).toFixed(1),
      dur: (3 + (i % 4)).toFixed(1),
      opacity: (0.08 + (i % 6) * 0.04).toFixed(2),
    });
  }

  // Grid lines
  const gridLines = [];
  for (let x = 0; x <= width; x += 60) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(99,102,241,0.04)" stroke-width="0.5"/>`);
  }
  for (let y = 0; y <= height; y += 60) {
    gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(99,102,241,0.04)" stroke-width="0.5"/>`);
  }

  // Connection lines between nearby particles
  const connections = [];
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length && connections.length < 18; j++) {
      const dx = parseFloat(particles[i].cx) - parseFloat(particles[j].cx);
      const dy = parseFloat(particles[i].cy) - parseFloat(particles[j].cy);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 60 && dist < 160) {
        connections.push({
          x1: particles[i].cx, y1: particles[i].cy,
          x2: particles[j].cx, y2: particles[j].cy,
          delay: particles[i].delay,
        });
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="35%" style="stop-color:#0d1117"/>
      <stop offset="65%" style="stop-color:#0f0a2e"/>
      <stop offset="100%" style="stop-color:#0a0a1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0"/>
      <stop offset="20%" style="stop-color:#6366f1;stop-opacity:1"/>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1"/>
      <stop offset="80%" style="stop-color:#ec4899;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0"/>
    </linearGradient>
    <linearGradient id="name" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e2e8f0"/>
      <stop offset="50%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#c7d2fe"/>
    </linearGradient>
    <linearGradient id="role" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#818cf8"/>
      <stop offset="50%" style="stop-color:#a78bfa"/>
      <stop offset="100%" style="stop-color:#c084fc"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="scan" patternUnits="userSpaceOnUse" width="4" height="4">
      <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.012)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" rx="10" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" rx="10" fill="url(#scan)"/>

  <!-- Grid -->
  <g opacity="0.5">${gridLines.join('')}</g>

  <!-- Particles -->
  <g>${particles.map(p => `
    <circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="#818cf8" opacity="${p.opacity}">
      <animate attributeName="opacity" values="${p.opacity};${(parseFloat(p.opacity) + 0.2).toFixed(2)};${p.opacity}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${p.cy};${(parseFloat(p.cy) - 6).toFixed(1)};${p.cy}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
    </circle>`).join('')}
  </g>

  <!-- Connections -->
  <g opacity="0.1">${connections.map(c => `
    <line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" stroke="#6366f1" stroke-width="0.5">
      <animate attributeName="opacity" values="0.05;0.2;0.05" dur="5s" begin="${c.delay}s" repeatCount="indefinite"/>
    </line>`).join('')}
  </g>

  <!-- Top accent -->
  <rect x="120" y="20" width="660" height="1.5" rx="1" fill="url(#accent)" filter="url(#glow)" opacity="0.6">
    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Terminal prompt -->
  <g transform="translate(60, 68)">
    <text font-family="'JetBrains Mono','Fira Code','Cascadia Code',monospace" font-size="12" fill="#6366f1" opacity="0.6">
      <tspan>~/hoangtuvungcao</tspan>
      <tspan fill="#a855f7"> $</tspan>
      <tspan fill="#38bdf8"> cat</tspan>
      <tspan fill="#64748b"> profile.md</tspan>
    </text>
  </g>

  <!-- Name -->
  <g transform="translate(${width / 2}, 130)">
    <text font-family="'Inter','Segoe UI',system-ui,-apple-system,sans-serif" font-size="40" font-weight="800" fill="url(#name)" text-anchor="middle" letter-spacing="-0.5">
      Nguyen Van Trong
      <animate attributeName="opacity" values="0;1" dur="0.6s" fill="freeze"/>
    </text>
  </g>

  <!-- Role -->
  <g transform="translate(${width / 2}, 168)">
    <text font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="16" fill="url(#role)" text-anchor="middle" font-weight="500" letter-spacing="4">
      BACKEND ENGINEERING · DEVOPS · SECURITY
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.4s" fill="freeze"/>
    </text>
  </g>

  <!-- Cursor blink -->
  <rect x="${width / 2 + 210}" y="153" width="2" height="18" fill="#a855f7" rx="1">
    <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
  </rect>

  <!-- Status -->
  <g transform="translate(${width / 2}, 210)" opacity="0">
    <text font-family="'JetBrains Mono',monospace" font-size="11" text-anchor="middle">
      <tspan fill="#22c55e">●</tspan>
      <tspan fill="#64748b" dx="5">Secure &amp; reliable systems</tspan>
      <tspan fill="#334155" dx="10">|</tspan>
      <tspan fill="#64748b" dx="10">Go · Rust · Linux · Cloud Native</tspan>
    </text>
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.8s" fill="freeze"/>
  </g>

  <!-- Decorative braces -->
  <text x="24" y="${height / 2}" font-family="monospace" font-size="72" fill="#6366f1" opacity="0.05" dominant-baseline="central">{</text>
  <text x="${width - 48}" y="${height / 2}" font-family="monospace" font-size="72" fill="#6366f1" opacity="0.05" dominant-baseline="central">}</text>

  <!-- Bottom accent -->
  <rect x="180" y="${height - 28}" width="540" height="1" rx="1" fill="url(#accent)" opacity="0.3">
    <animate attributeName="width" values="0;540" dur="1.2s" begin="0.3s" fill="freeze"/>
  </rect>

  <!-- Bottom info -->
  <g transform="translate(${width / 2}, ${height - 14})">
    <text font-family="'JetBrains Mono',monospace" font-size="9" fill="#334155" text-anchor="middle" letter-spacing="2">
      VIETNAM · TAY NGUYEN UNIVERSITY · OPEN SOURCE
    </text>
  </g>

  <!-- Border -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="none" stroke="url(#accent)" stroke-width="0.8" opacity="0.15"/>
</svg>`;

  writeFileSync(join(OUTPUT_DIR, 'header.svg'), svg);
  console.log('Generated header.svg');
}

generateHeader();
