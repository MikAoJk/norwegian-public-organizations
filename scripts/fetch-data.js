#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ORGS_FILE = path.join(__dirname, '../site/organizations.json');
const CSS_FILE = path.join(__dirname, '../site/styles.css');
const HTML_FILE = path.join(__dirname, '../site/index.html');
const GH_TOKEN = process.env.GH_TOKEN;

const organizations = JSON.parse(fs.readFileSync(ORGS_FILE, 'utf8'));

async function fetchPublicRepos(owner) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'norwegian-public-organizations',
  };
  if (GH_TOKEN) {
    headers.Authorization = `Bearer ${GH_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/orgs/${owner}`, { headers });

  if (!response.ok) {
    console.error(`  Failed to fetch ${owner}: HTTP ${response.status}`);
    return 0;
  }

  const data = await response.json();
  return data.public_repos ?? 0;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTableRows(grouped) {
  return grouped.map((group, idx) => {
    let nameCell;
    if (group.orgs.length === 1) {
      nameCell = `<a href="${escapeHtml(group.orgs[0].url)}">${escapeHtml(group.name)}</a>`;
    } else {
      const links = group.orgs
        .map((org) => `<a href="${escapeHtml(org.url)}">${escapeHtml(org.owner)}</a>`)
        .join(', ');
      nameCell = `${escapeHtml(group.name)}<div class="sub-orgs">(${links})</div>`;
    }
    return `    <tr>
      <td>${idx + 1}</td>
      <td>${nameCell}</td>
      <td>${group.totalRepos}</td>
    </tr>`;
  }).join('\n');
}

function buildHtml(tableRows, inlineCss) {
  const GITHUB_SVG = `<svg width="3em" height="3em" viewBox="0 0 98 98" xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true" focusable="false">
      <path fill-rule="evenodd" clip-rule="evenodd"
            d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            fill="currentColor"></path>
    </svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Norwegian public organizations on GitHub</title>
  <meta name="description" content="List of Norwegian public organizations on GitHub" />
  <style>${inlineCss}</style>
</head>
<body>
  <main>
    <a class="github-link" href="https://github.com/MikAoJk/norwegian-public-organizations"
       aria-label="Norwegian public organizations repo on Github">
      ${GITHUB_SVG}
    </a>
    <h1>Norwegian public organizations on GitHub</h1>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
            <th scope="col">Number of repos</th>
          </tr>
        </thead>
        <tbody>
${tableRows}
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
`;
}

async function main() {
  console.log(`Fetching repo counts for ${organizations.length} organizations...`);

  const results = [];
  for (const org of organizations) {
    const repos = await fetchPublicRepos(org.owner);
    console.log(`  ${org.owner}: ${repos} public repos`);
    results.push({ id: org.id, name: org.name, url: org.url, owner: org.owner, repos });
  }

  const groupMap = new Map();
  for (const org of results) {
    const existing = groupMap.get(org.name);
    if (existing) {
      existing.totalRepos += org.repos;
      existing.orgs.push(org);
    } else {
      groupMap.set(org.name, { name: org.name, totalRepos: org.repos, orgs: [org] });
    }
  }

  const grouped = Array.from(groupMap.values()).sort((a, b) => b.totalRepos - a.totalRepos);

  const tableRows = buildTableRows(grouped);
  let inlineCss;
  try {
    inlineCss = fs.readFileSync(CSS_FILE, 'utf8');
  } catch (err) {
    throw new Error(`Could not read CSS file at ${CSS_FILE}: ${err.message}`);
  }
  const html = buildHtml(tableRows, inlineCss);
  fs.writeFileSync(HTML_FILE, html);
  console.log(`\nWrote pre-rendered ${HTML_FILE} (${grouped.length} groups)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
