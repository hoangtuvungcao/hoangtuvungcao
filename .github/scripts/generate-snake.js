/**
 * generate-snake.js
 *
 * Generates an animated SVG "snake eating contributions" grid.
 * Uses GitHub's contribution data (fetched via the contributions page or GraphQL).
 * Falls back to generated sample data if no token is available.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'assets');
mkdirSync(OUTPUT_DIR, { recursive: true });

const USERNAME = 'hoangtuvungcao';
const TOKEN = process.env.GITHUB_TOKEN || '';

const COLS = 53; // weeks
const ROWS = 7;  // days
const CELL = 13;
const GAP = 3;
const PADDING = 30;

const LEVEL_COLORS_DARK = [
  '#161b22', // 0 - empty
  '#0e4429', // 1 - low
  '#006d32', // 2 - medium-low
  '#26a641', // 3 - medium-high
  '#39d353', // 4 - high
];

const LEVEL_COLORS_EATEN = '#6366f130';

async function fetchContributions() {
  if (!TOKEN) {
    console.log('  ⚠ No GITHUB_TOKEN, using generated contribution data');
    return generateSampleData();
  }

  try {
    const query = `query {
      user(login: "${USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
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
      const week = weeks[w];
      for (let d = 0; d < week.contributionDays.length; d++) {
        const count = week.contributionDays[d].contributionCount;
        const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;
        grid.push({ col: w, row: d, level });
      }
    }
    return grid;
  } catch (e) {
    console.log(`  ⚠ GraphQL failed (${e.message}), using generated data`);
    return generateSampleData();
  }
}

function generateSampleData() {
  const grid = [];
  // Create realistic-looking contribution pattern
  for (let w = 0; w < COLS; w++) {
    for (let d = 0; d < ROWS; d++) {
      // More active on weekdays, seasonal variations
      const isWeekday = d >= 1 && d <= 5;
      const seasonFactor = Math.sin((w / COLS) * Math.PI * 2) * 0.3 + 0.5;
      const rand = Math.random();
      let level;

      if (rand < 0.3) level = 0;
      else if (rand < 0.55 + (isWeekday ? 0.1 : 0)) level = 1;
      else if (rand < 0.75 + seasonFactor * 0.1) level = 2;
      else if (rand < 0.9) level = 3;
      else level = 4;

      grid.push({ col: w, row: d, level });
    }
  }
  return grid;
}

function generateSnakePath(grid) {
  // Build a snake path that eats cells with contributions
  const cellsWithContribs = grid.filter(c => c.level > 0);

  // Sort by a snake-like traversal pattern (zigzag)
  cellsWithContribs.sort((a, b) => {
    if (a.col !== b.col) return a.col - b.col;
    return a.col % 2 === 0 ? a.row - b.row : b.row - a.row;
  });

  return cellsWithContribs;
}

function generateSnakeSVG(grid) {
  const totalWidth = PADDING * 2 + COLS * (CELL + GAP);
  const totalHeight = PADDING * 2 + ROWS * (CELL + GAP) + 60;
  const snakePath = generateSnakePath(grid);
  const totalDuration = 15; // seconds for full animation

  // Build the cells
  const cells = grid.map((cell) => {
    const x = PADDING + cell.col * (CELL + GAP);
    const y = PADDING + 40 + cell.row * (CELL + GAP);
    const color = LEVEL_COLORS_DARK[cell.level];

    // Find if this cell is in the snake path
    const snakeIdx = snakePath.findIndex(s => s.col === cell.col && s.row === cell.row);
    const isEaten = snakeIdx >= 0;

    if (isEaten) {
      const eatTime = (snakeIdx / snakePath.length) * totalDuration;
      return `
    <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${color}">
      <animate attributeName="fill" values="${color};${LEVEL_COLORS_EATEN};${color}" dur="${totalDuration}s" begin="${eatTime.toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="rx" values="2;4;2" dur="0.4s" begin="${eatTime.toFixed(2)}s" repeatCount="indefinite"/>
    </rect>`;
    }

    return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${color}"/>`;
  }).join('');

  // Snake head animation along the path
  const snakeKeyframes = snakePath.map(cell => {
    const x = PADDING + cell.col * (CELL + GAP) + CELL / 2;
    const y = PADDING + 40 + cell.row * (CELL + GAP) + CELL / 2;
    return { x, y };
  });

  // Sample keyframes for smooth animation (take every Nth point)
  const step = Math.max(1, Math.floor(snakeKeyframes.length / 80));
  const sampledX = [];
  const sampledY = [];
  for (let i = 0; i < snakeKeyframes.length; i += step) {
    sampledX.push(snakeKeyframes[i].x.toFixed(1));
    sampledY.push(snakeKeyframes[i].y.toFixed(1));
  }

  // Snake body segments (trailing behind head)
  const snakeSegments = [0, 1, 2, 3, 4].map(offset => {
    const segDelay = (offset * 0.15).toFixed(2);
    const segSize = 10 - offset * 1.5;
    const opacity = 1 - offset * 0.15;
    return `
    <circle r="${segSize}" fill="#39d353" opacity="${opacity}" filter="url(#snake-glow)">
      <animate attributeName="cx" values="${sampledX.join(';')}" dur="${totalDuration}s" begin="${segDelay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${sampledY.join(';')}" dur="${totalDuration}s" begin="${segDelay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');

  // Day labels
  const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const dayLabels = days.map((d, i) => {
    if (!d) return '';
    const y = PADDING + 40 + i * (CELL + GAP) + CELL / 2;
    return `<text x="12" y="${y}" font-family="'Inter', sans-serif" font-size="9" fill="#8b949e" dominant-baseline="central">${d}</text>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <defs>
    <linearGradient id="snake-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    <filter id="snake-glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="snake-title" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#39d353"/>
      <stop offset="100%" style="stop-color:#26a641"/>
    </linearGradient>
  </defs>

  <rect width="${totalWidth}" height="${totalHeight}" rx="12" fill="url(#snake-bg)"/>
  <rect x="0.5" y="0.5" width="${totalWidth - 1}" height="${totalHeight - 1}" rx="12" fill="none" stroke="#30363d" stroke-width="1"/>

  <!-- Title -->
  <text x="${PADDING}" y="28" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="url(#snake-title)">🐍 Contribution Snake</text>

  <!-- Day labels -->
  ${dayLabels}

  <!-- Contribution cells -->
  ${cells}

  <!-- Snake -->
  <g>
    ${snakeSegments}
    <!-- Snake eyes -->
    <circle r="2" fill="#fff">
      <animate attributeName="cx" values="${sampledX.map(x => (parseFloat(x) - 2.5).toFixed(1)).join(';')}" dur="${totalDuration}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${sampledY.map(y => (parseFloat(y) - 2).toFixed(1)).join(';')}" dur="${totalDuration}s" repeatCount="indefinite"/>
    </circle>
    <circle r="2" fill="#fff">
      <animate attributeName="cx" values="${sampledX.map(x => (parseFloat(x) + 2.5).toFixed(1)).join(';')}" dur="${totalDuration}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${sampledY.map(y => (parseFloat(y) - 2).toFixed(1)).join(';')}" dur="${totalDuration}s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- Legend -->
  <g transform="translate(${totalWidth - 200}, ${totalHeight - 20})">
    <text font-family="'Inter', sans-serif" font-size="9" fill="#8b949e">Less</text>
    ${LEVEL_COLORS_DARK.map((c, i) => `<rect x="${28 + i * 16}" y="-8" width="11" height="11" rx="2" fill="${c}"/>`).join('\n    ')}
    <text x="${28 + 5 * 16 + 4}" font-family="'Inter', sans-serif" font-size="9" fill="#8b949e">More</text>
  </g>
</svg>`;
}

async function main() {
  console.log('🐍 Generating contribution snake...');
  const grid = await fetchContributions();
  console.log(`  Grid: ${grid.length} cells`);

  const svg = generateSnakeSVG(grid);
  writeFileSync(join(OUTPUT_DIR, 'github-snake.svg'), svg);
  console.log('✅ Generated github-snake.svg');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
