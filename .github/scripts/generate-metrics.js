/**
 * generate-metrics.js
 *
 * Fetches GitHub user data via REST API and generates two SVG cards:
 * 1. metrics-stats.svg — Total stars, repos, commits, followers, PRs
 * 2. metrics-languages.svg — Top languages with animated bars
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
  const w = 440, h = 260;

  const items = [
    { icon: '⭐', label: 'Total Stars', value: stats.totalStars, color: '#fbbf24' },
    { icon: '📦', label: 'Repositories', value: stats.totalRepos, color: '#6366f1' },
    { icon: '🔀', label: 'Total Forks', value: stats.totalForks, color: '#a855f7' },
    { icon: '👥', label: 'Followers', value: stats.followers, color: '#ec4899' },
    { icon: '👁️', label: 'Profile Views', value: '—', color: '#38bdf8' },
  ];

  const rows = items.map((item, i) => {
    const y = 85 + i * 34;
    const barWidth = typeof item.value === 'number' ? Math.min(item.value * 3, 160) : 20;
    return `
    <g transform="translate(30, ${y})">
      <text font-family="'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" font-size="14">${item.icon}</text>
      <text x="28" font-family="'Inter', sans-serif" font-size="13" fill="#94a3b8" dominant-baseline="central">${item.label}</text>
      <text x="${w - 30}" font-family="'JetBrains Mono', monospace" font-size="14" fill="#e2e8f0" text-anchor="end" font-weight="600" dominant-baseline="central">${typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</text>
      <rect x="160" y="-6" width="${barWidth}" height="12" rx="3" fill="${item.color}" opacity="0.15">
        <animate attributeName="width" from="0" to="${barWidth}" dur="1s" begin="${0.2 + i * 0.15}s" fill="freeze"/>
      </rect>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <rect width="${w}" height="${h}" rx="12" fill="url(#card-bg)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="none" stroke="#30363d" stroke-width="1"/>

  <!-- Title -->
  <text x="30" y="45" font-family="'Inter', sans-serif" font-size="18" font-weight="700" fill="url(#title-grad)">📊 GitHub Stats</text>
  <rect x="30" y="56" width="120" height="2" rx="1" fill="url(#title-grad)" opacity="0.5"/>

  ${rows}
</svg>`;
}

// ─── Languages Card ─────────────────────────────────────────────────────────────

function generateLanguagesCard(languages) {
  const w = 440, h = 260;

  // Normalize
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, bytes]) => ({ name, pct: ((bytes / total) * 100).toFixed(1) }));

  const langColors = {
    'Go': '#00ADD8',
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Dockerfile': '#384d54',
    'Makefile': '#427819',
    'C': '#555555',
    'Vue': '#41b883',
    'Svelte': '#ff3e00',
    'Rust': '#dea584',
    'Java': '#b07219',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'Nix': '#7e7eff',
  };

  // Top bar (stacked)
  let barOffset = 30;
  const barWidth = w - 60;
  const stackedBar = sorted.map((lang, i) => {
    const segWidth = (parseFloat(lang.pct) / 100) * barWidth;
    const color = langColors[lang.name] || '#8b949e';
    const x = barOffset;
    barOffset += segWidth;
    return `<rect x="${x}" y="70" width="${segWidth}" height="10" rx="${i === 0 ? '5 0 0 5' : i === sorted.length - 1 ? '0 5 5 0' : '0'}" fill="${color}">
      <animate attributeName="width" from="0" to="${segWidth}" dur="1.2s" begin="${i * 0.1}s" fill="freeze"/>
    </rect>`;
  }).join('\n  ');

  // Legend items (2 columns)
  const legendItems = sorted.map((lang, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 30 + col * 200;
    const y = 110 + row * 32;
    const color = langColors[lang.name] || '#8b949e';
    return `
    <g transform="translate(${x}, ${y})">
      <circle cx="6" cy="6" r="5" fill="${color}"/>
      <text x="18" font-family="'Inter', sans-serif" font-size="12" fill="#c9d1d9" dominant-baseline="central">${lang.name}</text>
      <text x="160" font-family="'JetBrains Mono', monospace" font-size="12" fill="#8b949e" dominant-baseline="central">${lang.pct}%</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="card-bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    <linearGradient id="title-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>

  <rect width="${w}" height="${h}" rx="12" fill="url(#card-bg2)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="none" stroke="#30363d" stroke-width="1"/>

  <text x="30" y="45" font-family="'Inter', sans-serif" font-size="18" font-weight="700" fill="url(#title-grad2)">💻 Top Languages</text>
  <rect x="30" y="56" width="130" height="2" rx="1" fill="url(#title-grad2)" opacity="0.5"/>

  <!-- Stacked bar -->
  ${stackedBar}

  <!-- Legend -->
  ${legendItems}
</svg>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📊 Fetching GitHub data...');

  const [user, repos] = await Promise.all([
    fetchJSON(`https://api.github.com/users/${USERNAME}`),
    fetchAllRepos(),
  ]);

  // Stats
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const stats = {
    totalStars,
    totalForks,
    totalRepos: user.public_repos,
    followers: user.followers,
  };

  console.log('  Stats:', stats);

  // Languages
  const languages = {};
  for (const repo of repos) {
    if (repo.fork) continue;
    try {
      const langData = await fetchJSON(repo.languages_url);
      for (const [lang, bytes] of Object.entries(langData)) {
        languages[lang] = (languages[lang] || 0) + bytes;
      }
    } catch (e) {
      // skip rate limited repos
    }
  }

  console.log('  Languages:', Object.keys(languages).length, 'found');

  // Generate
  const statsSvg = generateStatsCard(stats);
  const langsSvg = generateLanguagesCard(languages);

  writeFileSync(join(OUTPUT_DIR, 'metrics-stats.svg'), statsSvg);
  writeFileSync(join(OUTPUT_DIR, 'metrics-languages.svg'), langsSvg);

  console.log('✅ Generated metrics-stats.svg');
  console.log('✅ Generated metrics-languages.svg');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
