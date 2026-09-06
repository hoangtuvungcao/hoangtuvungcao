/**
 * generate-metrics.js
 *
 * Fetches GitHub user data via REST API and generates two premium SVG cards:
 * 1. metrics-stats.svg  — Glassmorphism stats with animated neon bars
 * 2. metrics-languages.svg — Top languages with animated stacked bar + legend
 *
 * Ultra-premium design: glassmorphism, neon glows, animated gradients.
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
  const w = 460, h = 240;

  const items = [
    { label: 'Total Stars', value: stats.totalStars, color: '#fbbf24', barColor: '#f59e0b', glowColor: 'rgba(251,191,36,0.3)' },
    { label: 'Repositories', value: stats.totalRepos, color: '#818cf8', barColor: '#6366f1', glowColor: 'rgba(99,102,241,0.3)' },
    { label: 'Total Forks', value: stats.totalForks, color: '#c084fc', barColor: '#a855f7', glowColor: 'rgba(168,85,247,0.3)' },
    { label: 'Followers', value: stats.followers, color: '#f472b6', barColor: '#ec4899', glowColor: 'rgba(236,72,153,0.3)' },
  ];

  const maxVal = Math.max(...items.map(i => i.value), 1);

  const rows = items.map((item, i) => {
    const y = 70 + i * 38;
    const barWidth = Math.max(10, (item.value / maxVal) * 200);
    return `
    <g transform="translate(28, ${y})">
      <text x="0" font-family="'Inter',sans-serif" font-size="12.5" fill="#8b949e" dominant-baseline="central" font-weight="500">${item.label}</text>
      <!-- Bar background -->
      <rect x="130" y="-6" width="200" height="12" rx="6" fill="rgba(255,255,255,0.03)"/>
      <!-- Animated fill bar -->
      <rect x="130" y="-6" width="0" height="12" rx="6" fill="${item.barColor}" opacity="0.35">
        <animate attributeName="width" from="0" to="${barWidth}" dur="1s" begin="${0.2 + i * 0.15}s" fill="freeze"/>
      </rect>
      <!-- Shimmer effect on bar -->
      <rect x="130" y="-6" width="0" height="12" rx="6" fill="url(#shimmer)" opacity="0.4">
        <animate attributeName="width" from="0" to="${barWidth}" dur="1s" begin="${0.2 + i * 0.15}s" fill="freeze"/>
      </rect>
      <!-- Glow dot at end -->
      <circle cx="${130 + barWidth}" cy="0" r="3" fill="${item.color}" opacity="0">
        <animate attributeName="opacity" from="0" to="0.8" dur="0.3s" begin="${0.2 + i * 0.15 + 0.9}s" fill="freeze"/>
        <animate attributeName="r" values="3;4;3" dur="2s" begin="${0.2 + i * 0.15 + 1}s" repeatCount="indefinite"/>
      </circle>
      <!-- Value -->
      <text x="${w - 28}" font-family="'JetBrains Mono',monospace" font-size="14" fill="${item.color}" text-anchor="end" font-weight="700" dominant-baseline="central" opacity="0">
        ${item.value.toLocaleString()}
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${0.3 + i * 0.15}s" fill="freeze"/>
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
      <stop offset="50%" style="stop-color:rgba(255,255,255,0.15)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.4">
        <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.4">
        <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#bg)"/>
  <!-- Subtle radial glow -->
  <circle cx="${w/2}" cy="${h/2}" r="120" fill="#6366f1" opacity="0.02"/>

  <!-- Border -->
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="none" stroke="url(#borderGrad)" stroke-width="1"/>

  <!-- Title -->
  <text x="28" y="38" font-family="'Inter',sans-serif" font-size="15" font-weight="700" fill="url(#title-grad)" filter="url(#glow)">GitHub Stats</text>
  <rect x="28" y="48" width="85" height="1.5" rx="1" fill="url(#title-grad)" opacity="0.5">
    <animate attributeName="width" values="0;85" dur="0.8s" fill="freeze"/>
  </rect>

  ${rows}
</svg>`;
}

// ─── Languages Card ─────────────────────────────────────────────────────────────

function generateLanguagesCard(languages) {
  const w = 460, h = 240;

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

  // Stacked bar
  const barWidth = w - 56;
  let offset = 28;
  const stackedBar = sorted.map((lang, i) => {
    const segWidth = (parseFloat(lang.pct) / 100) * barWidth;
    const color = langColors[lang.name] || '#8b949e';
    const x = offset;
    offset += segWidth;
    return `<rect x="${x.toFixed(1)}" y="58" width="0" height="10" rx="${i === 0 ? '5 0 0 5' : i === sorted.length - 1 ? '0 5 5 0' : '0'}" fill="${color}">
      <animate attributeName="width" from="0" to="${segWidth.toFixed(1)}" dur="1.2s" begin="${(i * 0.1).toFixed(2)}s" fill="freeze"/>
    </rect>`;
  }).join('\n  ');

  // Legend (2 columns)
  const legendItems = sorted.map((lang, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 28 + col * 210;
    const y = 95 + row * 30;
    const color = langColors[lang.name] || '#8b949e';
    return `
    <g transform="translate(${x}, ${y})" opacity="0">
      <rect x="0" y="-5" width="10" height="10" rx="2.5" fill="${color}">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" begin="${(i * 0.3).toFixed(1)}s" repeatCount="indefinite"/>
      </rect>
      <text x="16" font-family="'Inter',sans-serif" font-size="12" fill="#c9d1d9" dominant-baseline="central" font-weight="500">${lang.name}</text>
      <text x="175" font-family="'JetBrains Mono',monospace" font-size="11" fill="#6e7681" text-anchor="end" dominant-baseline="central">${lang.pct}%</text>
      <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${(0.5 + i * 0.08).toFixed(2)}s" fill="freeze"/>
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
      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:0.4">
        <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#ec4899;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.4">
        <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#bg2)"/>
  <circle cx="${w/2}" cy="${h/2}" r="100" fill="#a855f7" opacity="0.015"/>

  <!-- Border -->
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="none" stroke="url(#borderGrad2)" stroke-width="1"/>

  <!-- Title -->
  <text x="28" y="38" font-family="'Inter',sans-serif" font-size="15" font-weight="700" fill="url(#title-grad2)" filter="url(#glow2)">Top Languages</text>
  <rect x="28" y="48" width="105" height="1.5" rx="1" fill="url(#title-grad2)" opacity="0.5">
    <animate attributeName="width" values="0;105" dur="0.8s" fill="freeze"/>
  </rect>

  <!-- Bar background -->
  <rect x="28" y="58" width="${barWidth}" height="10" rx="5" fill="rgba(255,255,255,0.03)"/>
  ${stackedBar}
  ${legendItems}
</svg>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching GitHub data...');

  const [user, repos] = await Promise.all([
    fetchJSON(`https://api.github.com/users/${USERNAME}`),
    fetchAllRepos(),
  ]);

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const stats = { totalStars, totalForks, totalRepos: user.public_repos, followers: user.followers };
  console.log('  Stats:', stats);

  const languages = {};
  for (const repo of repos) {
    if (repo.fork) continue;
    try {
      const langData = await fetchJSON(repo.languages_url);
      for (const [lang, bytes] of Object.entries(langData)) {
        languages[lang] = (languages[lang] || 0) + bytes;
      }
    } catch (e) { /* skip rate limited */ }
  }
  console.log('  Languages:', Object.keys(languages).length, 'found');

  writeFileSync(join(OUTPUT_DIR, 'metrics-stats.svg'), generateStatsCard(stats));
  writeFileSync(join(OUTPUT_DIR, 'metrics-languages.svg'), generateLanguagesCard(languages));

  console.log('Generated metrics-stats.svg');
  console.log('Generated metrics-languages.svg');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
