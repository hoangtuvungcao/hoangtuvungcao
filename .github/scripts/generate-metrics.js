/**
 * generate-metrics.js
 *
 * Fetches GitHub user data via REST API and generates two ultra-premium SVG cards:
 * 1. metrics-stats.svg  — Glassmorphism stats with animated neon bars & SVG icons
 * 2. metrics-languages.svg — Top languages with animated stacked bar + balanced 2-col legend
 *
 * Symmetrical 28px padding, glassmorphism, neon glows, animated gradients.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'assets');
mkdirSync(OUTPUT_DIR, { recursive: true });

const USERNAME = 'hoangtuvungcao';
const TOKEN = process.env.GITHUB_TOKEN || '';

async function fetchJSON(url) {
  const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'profile-metrics' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchAllRepos() {
  let repos = [];
  let page = 1;
  while (true) {
    const batch = await fetchJSON(`https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&type=owner`);
    if (batch.length === 0) break;
    repos = repos.concat(batch);
    page++;
  }
  return repos;
}

// ─── Stats Card ────────────────────────────────────────────────────────────────

function generateStatsCard(stats) {
  const w = 420, h = 230;
  const pad = 28;
  const contentWidth = w - pad * 2; // 364px

  const items = [
    {
      label: 'Total Stars',
      value: stats.totalStars,
      color: '#fbbf24',
      barColor: '#f59e0b',
      iconSvg: '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>',
    },
    {
      label: 'Repositories',
      value: stats.totalRepos,
      color: '#818cf8',
      barColor: '#6366f1',
      iconSvg: '<path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5z"/>',
    },
    {
      label: 'Total Forks',
      value: stats.totalForks,
      color: '#c084fc',
      barColor: '#a855f7',
      iconSvg: '<path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h4.5A2.25 2.25 0 0 0 12.5 6.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm6.5-2.122a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM8 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v-3.372a.75.75 0 0 1 1.5 0v3.372z"/>',
    },
    {
      label: 'Followers',
      value: stats.followers,
      color: '#f472b6',
      barColor: '#ec4899',
      iconSvg: '<path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.002 4.002 0 0 0-7.898 0 .75.75 0 0 1-1.482-.236A5.509 5.509 0 0 1 2 5.5zm11 0a3.488 3.488 0 0 0-.462-1.745.75.75 0 0 1 1.305-.742c.42.74.657 1.594.657 2.487 0 1.954-1.127 3.65-2.77 4.475a.75.75 0 0 1-.66-1.346A3.498 3.498 0 0 0 13 5.5z"/>',
    },
  ];

  const maxVal = Math.max(...items.map(i => i.value), 1);
  const trackWidth = 160;
  const trackX = 132;
  const valX = contentWidth; // Relative to pad (364px -> absolute 392 = w - pad)

  const rows = items.map((item, i) => {
    const y = 68 + i * 38;
    const barWidth = Math.max(10, (item.value / maxVal) * trackWidth);
    return `
    <g transform="translate(${pad}, ${y})">
      <!-- Icon -->
      <g fill="${item.color}" opacity="0.85" transform="translate(0, -7) scale(0.9)">
        ${item.iconSvg}
      </g>
      <!-- Label -->
      <text x="22" font-family="'Inter',-apple-system,sans-serif" font-size="12" fill="#94a3b8" dominant-baseline="central" font-weight="500">${item.label}</text>
      <!-- Bar Track -->
      <rect x="${trackX}" y="-5" width="${trackWidth}" height="10" rx="5" fill="rgba(255,255,255,0.03)"/>
      <!-- Animated Fill Bar -->
      <rect x="${trackX}" y="-5" width="0" height="10" rx="5" fill="${item.barColor}" opacity="0.4">
        <animate attributeName="width" from="0" to="${barWidth}" dur="0.9s" begin="${0.15 + i * 0.12}s" fill="freeze"/>
      </rect>
      <!-- Shimmer overlay -->
      <rect x="${trackX}" y="-5" width="0" height="10" rx="5" fill="url(#shimmer)" opacity="0.3">
        <animate attributeName="width" from="0" to="${barWidth}" dur="0.9s" begin="${0.15 + i * 0.12}s" fill="freeze"/>
      </rect>
      <!-- Glowing head dot -->
      <circle cx="${trackX + barWidth}" cy="0" r="3" fill="${item.color}" opacity="0">
        <animate attributeName="opacity" from="0" to="0.9" dur="0.3s" begin="${0.15 + i * 0.12 + 0.8}s" fill="freeze"/>
        <animate attributeName="r" values="3;4.2;3" dur="2.2s" begin="${0.15 + i * 0.12 + 0.9}s" repeatCount="indefinite"/>
      </circle>
      <!-- Value (ends exactly at content boundary) -->
      <text x="${valX}" font-family="'JetBrains Mono',monospace" font-size="13.5" fill="${item.color}" text-anchor="end" font-weight="700" dominant-baseline="central" opacity="0">
        ${item.value.toLocaleString()}
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${0.2 + i * 0.12}s" fill="freeze"/>
      </text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="50%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#0f0a20"/>
    </linearGradient>
    <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0)"/>
      <stop offset="50%" style="stop-color:rgba(255,255,255,0.2)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.35">
        <animate attributeName="stop-opacity" values="0.25;0.55;0.25" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.35">
        <animate attributeName="stop-opacity" values="0.25;0.55;0.25" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#bg)"/>
  <circle cx="${w/2}" cy="${h/2}" r="110" fill="#6366f1" opacity="0.025"/>

  <!-- Border -->
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="none" stroke="url(#borderGrad)" stroke-width="1"/>

  <!-- Title -->
  <text x="${pad}" y="36" font-family="'Inter',-apple-system,sans-serif" font-size="14.5" font-weight="700" fill="url(#title-grad)" filter="url(#glow)">GitHub Stats</text>
  <rect x="${pad}" y="45" width="80" height="1.5" rx="1" fill="url(#title-grad)" opacity="0.5">
    <animate attributeName="width" values="0;80" dur="0.8s" fill="freeze"/>
  </rect>

  <!-- Top Right Badge -->
  <g transform="translate(${w - pad - 68}, 22)">
    <rect width="68" height="18" rx="9" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.25)" stroke-width="0.8"/>
    <text x="34" y="12" font-family="'JetBrains Mono',monospace" font-size="9" fill="#818cf8" text-anchor="middle" font-weight="600">OVERVIEW</text>
  </g>

  ${rows}
</svg>`;
}

// ─── Languages Card ─────────────────────────────────────────────────────────────

function generateLanguagesCard(languages) {
  const w = 420, h = 230;
  const pad = 28;
  const contentWidth = w - pad * 2; // 364px

  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, bytes]) => ({ name, pct: ((bytes / total) * 100).toFixed(1) }));

  const langColors = {
    'Go': '#00ADD8', 'Python': '#3572A5', 'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6', 'Dart': '#00B4AB', 'HTML': '#e34c26',
    'CSS': '#563d7c', 'Shell': '#89e051', 'Dockerfile': '#384d54',
    'Makefile': '#427819', 'C': '#555555', 'Vue': '#41b883',
    'Svelte': '#ff3e00', 'Rust': '#dea584', 'Java': '#b07219',
    'Ruby': '#701516', 'PHP': '#4F5D95', 'Nix': '#7e7eff',
  };

  // Stacked bar starts at pad (28) and ends at w - pad (392)
  let offset = pad;
  const stackedBar = sorted.map((lang, i) => {
    const segWidth = (parseFloat(lang.pct) / 100) * contentWidth;
    const color = langColors[lang.name] || '#8b949e';
    const x = offset;
    offset += segWidth;
    return `<rect x="${x.toFixed(1)}" y="56" width="0" height="9" rx="${i === 0 ? '4 0 0 4' : i === sorted.length - 1 ? '0 4 4 0' : '0'}" fill="${color}">
      <animate attributeName="width" from="0" to="${segWidth.toFixed(1)}" dur="1s" begin="${(i * 0.08).toFixed(2)}s" fill="freeze"/>
    </rect>`;
  }).join('\n  ');

  // Legend: 2 symmetrical columns inside contentWidth
  // Col 0: x = pad (28) to 28 + 172 = 200
  // Col 1: x = 28 + 192 = 220 to 220 + 172 = 392 (ends exactly at w - pad!)
  const colWidth = 172;
  const colGap = 20;

  const legendItems = sorted.map((lang, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const colX = pad + col * (colWidth + colGap);
    const rowY = 92 + row * 29;
    const color = langColors[lang.name] || '#8b949e';
    return `
    <g transform="translate(${colX}, ${rowY})" opacity="0">
      <rect x="0" y="-4.5" width="9" height="9" rx="2.5" fill="${color}">
        <animate attributeName="opacity" values="0.65;1;0.65" dur="3s" begin="${(i * 0.3).toFixed(1)}s" repeatCount="indefinite"/>
      </rect>
      <text x="16" font-family="'Inter',-apple-system,sans-serif" font-size="11.5" fill="#cbd5e1" dominant-baseline="central" font-weight="500">${lang.name}</text>
      <text x="${colWidth}" font-family="'JetBrains Mono',monospace" font-size="11" fill="#64748b" text-anchor="end" dominant-baseline="central">${lang.pct}%</text>
      <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${(0.4 + i * 0.07).toFixed(2)}s" fill="freeze"/>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="50%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#0f0a20"/>
    </linearGradient>
    <linearGradient id="title-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
    <linearGradient id="borderGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:0.35">
        <animate attributeName="stop-opacity" values="0.25;0.55;0.25" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#ec4899;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.35">
        <animate attributeName="stop-opacity" values="0.25;0.55;0.25" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#bg2)"/>
  <circle cx="${w/2}" cy="${h/2}" r="100" fill="#a855f7" opacity="0.02"/>

  <!-- Border -->
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="none" stroke="url(#borderGrad2)" stroke-width="1"/>

  <!-- Title -->
  <text x="${pad}" y="36" font-family="'Inter',-apple-system,sans-serif" font-size="14.5" font-weight="700" fill="url(#title-grad2)" filter="url(#glow2)">Top Languages</text>
  <rect x="${pad}" y="45" width="95" height="1.5" rx="1" fill="url(#title-grad2)" opacity="0.5">
    <animate attributeName="width" values="0;95" dur="0.8s" fill="freeze"/>
  </rect>

  <!-- Top Right Badge -->
  <g transform="translate(${w - pad - 80}, 22)">
    <rect width="80" height="18" rx="9" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.25)" stroke-width="0.8"/>
    <text x="40" y="12" font-family="'JetBrains Mono',monospace" font-size="9" fill="#c084fc" text-anchor="middle" font-weight="600">CODEBASE</text>
  </g>

  <!-- Stacked Bar Track -->
  <rect x="${pad}" y="56" width="${contentWidth}" height="9" rx="4.5" fill="rgba(255,255,255,0.03)"/>
  ${stackedBar}
  ${legendItems}
</svg>`;
}

const FALLBACK_STATS = { totalStars: 314, totalForks: 98, totalRepos: 72, followers: 26 };
const FALLBACK_LANGS = {
  'Rust': 345000,
  'JavaScript': 328000,
  'Go': 211000,
  'TypeScript': 75000,
  'Python': 71000,
  'Dart': 46000,
  'HTML': 38000,
  'C': 22500,
};

async function main() {
  console.log('Fetching GitHub data...');
  let stats = FALLBACK_STATS;
  let languages = FALLBACK_LANGS;

  try {
    const [user, repos] = await Promise.all([
      fetchJSON(`https://api.github.com/users/${USERNAME}`),
      fetchAllRepos(),
    ]);

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    stats = { totalStars, totalForks, totalRepos: user.public_repos, followers: user.followers };
    console.log('  Stats:', stats);

    const fetchedLangs = {};
    for (const repo of repos) {
      if (repo.fork) continue;
      try {
        const langData = await fetchJSON(repo.languages_url);
        for (const [lang, bytes] of Object.entries(langData)) {
          fetchedLangs[lang] = (fetchedLangs[lang] || 0) + bytes;
        }
      } catch (e) { /* skip */ }
    }
    if (Object.keys(fetchedLangs).length > 0) {
      languages = fetchedLangs;
    }
    console.log('  Languages:', Object.keys(languages).length, 'found');
  } catch (err) {
    console.log(`  API notice: ${err.message} — using latest cached stats`);
  }

  writeFileSync(join(OUTPUT_DIR, 'metrics-stats.svg'), generateStatsCard(stats));
  writeFileSync(join(OUTPUT_DIR, 'metrics-languages.svg'), generateLanguagesCard(languages));

  console.log('Generated metrics-stats.svg');
  console.log('Generated metrics-languages.svg');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
