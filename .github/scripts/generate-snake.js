/**
 * generate-snake.js
 *
 * Generates an ultra-premium animated SVG contribution grid with a
 * neon-glowing snake traversal. Fetches contribution data via GraphQL.
 * Falls back to deterministic sample data if no token is provided.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'assets');
mkdirSync(OUTPUT_DIR, { recursive: true });

const USERNAME = 'hoangtuvungcao';
const TOKEN = process.env.GITHUB_TOKEN || '';

const COLS = 53;
const ROWS = 7;
const CELL = 13;
const GAP = 3;
const PAD = 32;

const COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const EATEN = 'rgba(99,102,241,0.1)';

async function fetchContributions() {
  if (!TOKEN) {
    console.log('  No GITHUB_TOKEN — using generated data');
    return generateSampleData();
  }

  try {
    const query = `query {
      user(login: "${USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            weeks { contributionDays { contributionCount date } }
          }
        }
      }
    }`;

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'profile-snake',
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`GraphQL ${res.status}`);
    const data = await res.json();
    const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;

    const grid = [];
    for (let w = 0; w < Math.min(weeks.length, COLS); w++) {
      for (let d = 0; d < weeks[w].contributionDays.length; d++) {
        const count = weeks[w].contributionDays[d].contributionCount;
        const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;
        grid.push({ col: w, row: d, level });
      }
    }
    return grid;
  } catch (e) {
    console.log(`  GraphQL failed (${e.message}) — using generated data`);
    return generateSampleData();
  }
}

function generateSampleData() {
  const grid = [];
  for (let w = 0; w < COLS; w++) {
    for (let d = 0; d < ROWS; d++) {
      const isWeekday = d >= 1 && d <= 5;
      const season = Math.sin((w / COLS) * Math.PI * 2) * 0.3 + 0.5;
      const r = Math.abs(Math.sin(w * 13.37 + d * 7.91));
      let level;
      if (r < 0.28) level = 0;
      else if (r < 0.52 + (isWeekday ? 0.08 : 0)) level = 1;
      else if (r < 0.72 + season * 0.08) level = 2;
      else if (r < 0.88) level = 3;
      else level = 4;
      grid.push({ col: w, row: d, level });
    }
  }
  return grid;
}

function generateSnakeSVG(grid) {
  const totalW = PAD * 2 + COLS * (CELL + GAP);
  const totalH = PAD * 2 + ROWS * (CELL + GAP) + 50;
  const dur = 14;

  const snakePath = grid.filter(c => c.level > 0)
    .sort((a, b) => a.col !== b.col ? a.col - b.col : (a.col % 2 === 0 ? a.row - b.row : b.row - a.row));

  const cells = grid.map(cell => {
    const x = PAD + cell.col * (CELL + GAP);
    const y = PAD + 32 + cell.row * (CELL + GAP);
    const color = COLORS[cell.level];
    const si = snakePath.findIndex(s => s.col === cell.col && s.row === cell.row);

    if (si >= 0) {
      const t = ((si / snakePath.length) * dur).toFixed(2);
      return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${color}">
      <animate attributeName="fill" values="${color};${EATEN};${color}" dur="${dur}s" begin="${t}s" repeatCount="indefinite"/>
    </rect>`;
    }
    return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${color}"/>`;
  }).join('\n  ');

  // Snake keyframes (sampled)
  const step = Math.max(1, Math.floor(snakePath.length / 80));
  const kx = [], ky = [];
  for (let i = 0; i < snakePath.length; i += step) {
    kx.push((PAD + snakePath[i].col * (CELL + GAP) + CELL / 2).toFixed(1));
    ky.push((PAD + 32 + snakePath[i].row * (CELL + GAP) + CELL / 2).toFixed(1));
  }

  const snakeBody = [0, 1, 2, 3, 4].map(offset => {
    const size = 9 - offset * 1.4;
    const op = (0.95 - offset * 0.12).toFixed(2);
    const delay = (offset * 0.1).toFixed(2);
    const color = offset === 0 ? '#39d353' : offset <= 1 ? '#26a641' : '#006d32';
    return `<circle r="${size}" fill="${color}" opacity="${op}">
      <animate attributeName="cx" values="${kx.join(';')}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${ky.join(';')}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('\n    ');

  const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const dayLabels = days.map((d, i) => {
    if (!d) return '';
    const y = PAD + 32 + i * (CELL + GAP) + CELL / 2;
    return `<text x="12" y="${y}" font-family="'Inter',sans-serif" font-size="9" fill="#484f58" dominant-baseline="central">${d}</text>`;
  }).filter(Boolean).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <defs>
    <linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="50%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#0f0a20"/>
    </linearGradient>
    <filter id="sg"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="st" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#39d353"/>
      <stop offset="50%" style="stop-color:#26a641"/>
      <stop offset="100%" style="stop-color:#006d32"/>
    </linearGradient>
    <linearGradient id="sborder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#39d353;stop-opacity:0.3">
        <animate attributeName="stop-opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#26a641;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#006d32;stop-opacity:0.3">
        <animate attributeName="stop-opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="titleGlow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Background -->
  <rect width="${totalW}" height="${totalH}" rx="12" fill="url(#sbg)"/>
  <!-- Border -->
  <rect x="0.5" y="0.5" width="${totalW - 1}" height="${totalH - 1}" rx="12" fill="none" stroke="url(#sborder)" stroke-width="1"/>

  <!-- Title -->
  <text x="${PAD}" y="24" font-family="'Inter',sans-serif" font-size="14" font-weight="700" fill="url(#st)" filter="url(#titleGlow)">Contribution Activity</text>

  ${dayLabels}
  ${cells}

  <!-- Snake with neon glow -->
  <g filter="url(#sg)">
    ${snakeBody}
  </g>

  <!-- Legend -->
  <g transform="translate(${totalW - 200}, ${totalH - 18})">
    <text font-family="'Inter',sans-serif" font-size="9" fill="#484f58">Less</text>
    ${COLORS.map((c, i) => `<rect x="${28 + i * 16}" y="-8" width="11" height="11" rx="2.5" fill="${c}"/>`).join('\n    ')}
    <text x="${28 + 5 * 16 + 4}" font-family="'Inter',sans-serif" font-size="9" fill="#484f58">More</text>
  </g>
</svg>`;
}

async function main() {
  console.log('Generating contribution snake...');
  const grid = await fetchContributions();
  console.log(`  Grid: ${grid.length} cells`);
  const svg = generateSnakeSVG(grid);
  writeFileSync(join(OUTPUT_DIR, 'github-snake.svg'), svg);
  console.log('Generated github-snake.svg');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
