/**
 * generate-metrics.js
 *
 * Fetches GitHub user data via REST API and generates two SVG cards:
 * 1. metrics-stats.svg  — Stars, repos, forks, followers with animated bars
 * 2. metrics-languages.svg — Top languages with stacked bar + legend
 *
 * Professional design: no emoji, clean typography, animated fills.
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

// ─── SVG Shared Defs ────────────────────────────────────────────────────────────

const cardDefs = `
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    <linearGradient id="accent1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <linearGradient id="accent2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>`;

// ─── Stats Card ────────────────────────────────────────────────────────────────

function generateStatsCard(stats) {
  const w = 440, h = 220;

  const items = [
    { label: 'Total Stars', value: stats.totalStars, color: '#fbbf24', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
    { label: 'Repositories', value: stats.totalRepos, color: '#6366f1', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
    { label: 'Total Forks', value: stats.totalForks, color: '#a855f7', icon: 'M7 5C7 3.89 6.11 3 5 3S3 3.89 3 5c0 .74.4 1.38 1 1.72v7.56c-.6.35-1 .98-1 1.72 0 1.11.89 2 2 2s2-.89 2-2c0-.74-.4-1.38-1-1.72V8.97a5 5 0 004 0V6.72c-.6-.34-1-.98-1-1.72zm12 0c0-1.11-.89-2-2-2s-2 .89-2 2c0 .74.4 1.38 1 1.72V10l-4 4v1.28c-.6.35-1 .98-1 1.72 0 1.11.89 2 2 2s2-.89 2-2c0-.74-.4-1.38-1-1.72V14l4-4V6.72c.6-.34 1-.98 1-1.72z' },
    { label: 'Followers', value: stats.followers, color: '#ec4899', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  ];

  const maxVal = Math.max(...items.map(i => i.value), 1);

  const rows = items.map((item, i) => {
    const y = 65 + i * 36;
    const barWidth = Math.max(8, (item.value / maxVal) * 180);
    return `
    <g transform="translate(30, ${y})">
      <text x="0" font-family="'Inter',sans-serif" font-size="13" fill="#8b949e" dominant-baseline="central">${item.label}</text>
      <rect x="130" y="-5" width="${barWidth}" height="10" rx="3" fill="${item.color}" opacity="0.2">
        <animate attributeName="width" from="0" to="${barWidth}" dur="0.8s" begin="${0.15 + i * 0.12}s" fill="freeze"/>
      </rect>
      <circle cx="${130 + barWidth + 8}" cy="0" r="2.5" fill="${item.color}" opacity="0.6">
        <animate attributeName="opacity" from="0" to="0.6" dur="0.3s" begin="${0.15 + i * 0.12 + 0.7}s" fill="freeze"/>
      </circle>
      <text x="${w - 30}" font-family="'JetBrains Mono',monospace" font-size="14" fill="#e2e8f0" text-anchor="end" font-weight="600" dominant-baseline="central">${item.value.toLocaleString()}</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${cardDefs}</defs>
  <rect width="${w}" height="${h}" rx="10" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="none" stroke="#30363d" stroke-width="1"/>
  <text x="30" y="35" font-family="'Inter',sans-serif" font-size="15" font-weight="700" fill="url(#accent1)">GitHub Stats</text>
  <rect x="30" y="45" width="80" height="1.5" rx="1" fill="url(#accent1)" opacity="0.4"/>
  ${rows}
</svg>`;
}

// ─── Languages Card ─────────────────────────────────────────────────────────────

function generateLanguagesCard(languages) {
  const w = 440, h = 220;

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
  const barWidth = w - 60;
  let offset = 30;
  const stackedBar = sorted.map((lang, i) => {
    const segWidth = (parseFloat(lang.pct) / 100) * barWidth;
    const color = langColors[lang.name] || '#8b949e';
    const x = offset;
    offset += segWidth;
    const rx = i === 0 ? '4' : i === sorted.length - 1 ? '4' : '0';
    return `<rect x="${x.toFixed(1)}" y="55" width="${segWidth.toFixed(1)}" height="8" rx="${rx}" fill="${color}">
      <animate attributeName="width" from="0" to="${segWidth.toFixed(1)}" dur="1s" begin="${(i * 0.08).toFixed(2)}s" fill="freeze"/>
    </rect>`;
  }).join('\n  ');

  // Legend (2 columns)
  const legendItems = sorted.map((lang, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 30 + col * 200;
    const y = 88 + row * 28;
    const color = langColors[lang.name] || '#8b949e';
    return `
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="-4" width="8" height="8" rx="2" fill="${color}"/>
      <text x="14" font-family="'Inter',sans-serif" font-size="11.5" fill="#c9d1d9" dominant-baseline="central">${lang.name}</text>
      <text x="165" font-family="'JetBrains Mono',monospace" font-size="11" fill="#6e7681" text-anchor="end" dominant-baseline="central">${lang.pct}%</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${cardDefs}</defs>
  <rect width="${w}" height="${h}" rx="10" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="none" stroke="#30363d" stroke-width="1"/>
  <text x="30" y="35" font-family="'Inter',sans-serif" font-size="15" font-weight="700" fill="url(#accent2)">Top Languages</text>
  <rect x="30" y="45" width="100" height="1.5" rx="1" fill="url(#accent2)" opacity="0.4"/>
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
