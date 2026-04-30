#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ORGS_FILE = path.join(__dirname, '../site/organizations.json');
const DATA_FILE = path.join(__dirname, '../site/data.json');
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

  fs.writeFileSync(DATA_FILE, JSON.stringify(grouped, null, 2));
  console.log(`\nWrote ${grouped.length} groups to ${DATA_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
