/**
 * generate-header.js
 * 
 * Generates an animated SVG header with:
 * - Cyberpunk gradient background
 * - Animated typing effect for name + tagline
 * - Floating particle grid animation
 * - Glowing accent lines
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

  // Generate particle positions
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      cx: Math.random() * width,
      cy: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      delay: (Math.random() * 6).toFixed(1),
      dur: (Math.random() * 4 + 3).toFixed(1),
      opacity: (Math.random() * 0.5 + 0.1).toFixed(2),
    });
  }

  // Generate grid lines
  const gridLines = [];
  for (let x = 0; x < width; x += 60) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>`);
  }
  for (let y = 0; y < height; y += 60) {
    gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>`);
  }

  // Connection lines between some particles
  const connections = [];
  for (let i = 0; i < 15; i++) {
    const p1 = particles[Math.floor(Math.random() * particles.length)];
    const p2 = particles[Math.floor(Math.random() * particles.length)];
    const dist = Math.sqrt(Math.pow(p1.cx - p2.cx, 2) + Math.pow(p1.cy - p2.cy, 2));
    if (dist < 200) {
      connections.push({
        x1: p1.cx.toFixed(1),
        y1: p1.cy.toFixed(1),
        x2: p2.cx.toFixed(1),
        y2: p2.cy.toFixed(1),
        delay: p1.delay,
      });
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="30%" style="stop-color:#0d1117"/>
      <stop offset="60%" style="stop-color:#0f0a2e"/>
      <stop offset="100%" style="stop-color:#0a0a1a"/>
    </linearGradient>
    
    <!-- Accent gradient for glow -->
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0"/>
      <stop offset="20%" style="stop-color:#6366f1;stop-opacity:1"/>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1"/>
      <stop offset="80%" style="stop-color:#ec4899;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0"/>
    </linearGradient>

    <linearGradient id="name-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e2e8f0"/>
      <stop offset="50%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#c7d2fe"/>
    </linearGradient>

    <linearGradient id="tag-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#818cf8"/>
      <stop offset="50%" style="stop-color:#a78bfa"/>
      <stop offset="100%" style="stop-color:#c084fc"/>
    </linearGradient>

    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="glow-strong">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Scan line pattern -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
      <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" rx="12" fill="url(#bg-grad)"/>
  
  <!-- Scan line overlay -->
  <rect width="${width}" height="${height}" rx="12" fill="url(#scanlines)"/>

  <!-- Grid -->
  <g opacity="0.4">
    ${gridLines.join('\n    ')}
  </g>

  <!-- Animated particles -->
  <g>
    ${particles.map(p => `
    <circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="${p.r.toFixed(1)}" fill="#818cf8" opacity="${p.opacity}">
      <animate attributeName="opacity" values="${p.opacity};${(parseFloat(p.opacity) + 0.3).toFixed(2)};${p.opacity}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${p.cy.toFixed(1)};${(p.cy - 8).toFixed(1)};${p.cy.toFixed(1)}" dur="${p.dur}s" begin="${p.delay}s" repeatCount="indefinite"/>
    </circle>`).join('')}
  </g>

  <!-- Connection lines -->
  <g opacity="0.15">
    ${connections.map(c => `
    <line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" stroke="#6366f1" stroke-width="0.5">
      <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" begin="${c.delay}s" repeatCount="indefinite"/>
    </line>`).join('')}
  </g>

  <!-- Top accent line -->
  <rect x="100" y="24" width="700" height="2" rx="1" fill="url(#accent-grad)" filter="url(#glow)" opacity="0.7">
    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite"/>
  </rect>

  <!-- Terminal prompt decoration -->
  <g transform="translate(50, 75)">
    <text font-family="'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" font-size="13" fill="#6366f1" opacity="0.7">
      <tspan>~/hoangtuvungcao</tspan>
      <tspan fill="#a855f7"> ❯</tspan>
      <tspan fill="#38bdf8"> cat</tspan>
      <tspan fill="#94a3b8"> profile.md</tspan>
    </text>
  </g>

  <!-- Name with typing animation -->
  <g transform="translate(${width / 2}, 140)">
    <text font-family="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="url(#name-grad)" text-anchor="middle" letter-spacing="-0.5">
      Nguyễn Văn Trọng
      <animate attributeName="opacity" values="0;1" dur="0.8s" fill="freeze"/>
    </text>
  </g>

  <!-- Tagline -->
  <g transform="translate(${width / 2}, 180)">
    <text font-family="'Inter', 'Segoe UI', system-ui, sans-serif" font-size="17" fill="url(#tag-grad)" text-anchor="middle" font-weight="500" letter-spacing="3">
      BACKEND ENGINEERING · DEVOPS · SECURITY
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.5s" fill="freeze"/>
    </text>
  </g>

  <!-- Animated cursor -->
  <rect x="${width / 2 + 195}" y="164" width="2" height="20" fill="#a855f7" rx="1">
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
  </rect>

  <!-- Status line -->
  <g transform="translate(${width / 2}, 225)">
    <text font-family="'JetBrains Mono', monospace" font-size="12" text-anchor="middle" opacity="0.5">
      <tspan fill="#22c55e">●</tspan>
      <tspan fill="#94a3b8" dx="6">Building secure &amp; reliable systems</tspan>
      <tspan fill="#94a3b8" dx="12">│</tspan>
      <tspan fill="#fbbf24" dx="12">⚡</tspan>
      <tspan fill="#94a3b8" dx="4">Go · Linux · Cloud Native</tspan>
    </text>
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1s" fill="freeze"/>
  </g>

  <!-- Decorative brackets -->
  <text x="30" y="${height / 2}" font-family="monospace" font-size="80" fill="#6366f1" opacity="0.08" dominant-baseline="central">{</text>
  <text x="${width - 55}" y="${height / 2}" font-family="monospace" font-size="80" fill="#6366f1" opacity="0.08" dominant-baseline="central">}</text>

  <!-- Bottom accent line -->
  <rect x="150" y="${height - 30}" width="600" height="1.5" rx="1" fill="url(#accent-grad)" opacity="0.4">
    <animate attributeName="width" values="0;600" dur="1.5s" begin="0.3s" fill="freeze"/>
  </rect>

  <!-- Bottom info -->
  <g transform="translate(${width / 2}, ${height - 16})">
    <text font-family="monospace" font-size="10" fill="#475569" text-anchor="middle" letter-spacing="2">
      📍 VIETNAM · 🎓 TAY NGUYEN UNIVERSITY · 💻 OPEN SOURCE
    </text>
  </g>

  <!-- Border glow -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="none" stroke="url(#accent-grad)" stroke-width="1" opacity="0.2"/>
</svg>`;

  writeFileSync(join(OUTPUT_DIR, 'header.svg'), svg);
  console.log('✅ Generated header.svg');
}

generateHeader();
