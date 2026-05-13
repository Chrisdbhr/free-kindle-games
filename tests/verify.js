const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8374;
const BASE = `http://localhost:${PORT}`;
const ROOT = path.resolve(__dirname, '..');

const errors = [];
const warnings = [];
let pagesChecked = 0;
let resourcesChecked = 0;

function log(msg) { console.log('  ' + msg); }
function ok(msg) { console.log('  \x1b[32m✓\x1b[0m ' + msg); }
function fail(msg) { errors.push(msg); console.log('  \x1b[31m✗\x1b[0m ' + msg); }
function warn(msg) { warnings.push(msg); console.log('  \x1b[33m⚠\x1b[0m ' + msg); }

function startServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.appcache': 'text/cache-manifest',
      '.md': 'text/markdown',
    };
    const server = http.createServer((req, res) => {
      const urlObj = new URL(req.url, `http://localhost:${PORT}`);
      let filePath = path.join(ROOT, urlObj.pathname === '/' ? 'index.html' : urlObj.pathname);
      const ext = path.extname(filePath);
      const mime = mimeTypes[ext] || 'application/octet-stream';
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          if (ext === '.html') {
            // Disable appcache for tests
            const content = data.toString().replace(/manifest="[^"]*"/, '');
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content);
          } else {
            res.writeHead(200, { 'Content-Type': mime });
            res.end(data);
          }
        }
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function verifyStatusCode(url) {
  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      fail(`HTTP ${res.status} for ${url}`);
    }
    return res;
  } catch (e) {
    fail(`Failed to fetch ${url}: ${e.message}`);
    return null;
  }
}

async function checkPageResources(page, pageUrl) {
  const resources = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
      results.push({ type: 'css', url: el.href });
    });
    document.querySelectorAll('script[src]').forEach(el => {
      results.push({ type: 'js', url: el.src });
    });
    document.querySelectorAll('img[src]').forEach(el => {
      if (el.src && !el.src.startsWith('data:')) {
        results.push({ type: 'img', url: el.src });
      }
    });
    return results;
  });

  for (const r of resources) {
    resourcesChecked++;
    await verifyStatusCode(r.url);
  }
}

async function checkLinks(page, pageUrl) {
  const links = new Set();
  const allAnchors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map(a => a.getAttribute('href'))
      .filter(h => h && !h.startsWith('#') && !h.startsWith('http') && !h.startsWith('javascript:'));
  });
  for (const href of allAnchors) {
    const absolute = new URL(href, pageUrl).href;
    if (absolute.startsWith(BASE) && !absolute.includes('#') && !links.has(absolute)) {
      links.add(absolute);
      await verifyStatusCode(absolute);
    }
  }
}

async function run() {
  console.log('Starting HTTP server...');
  const server = await startServer();
  log(`Server running on ${BASE}`);

  console.log('\nLaunching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });

  const htmlFiles = [
    '/index.html',
    '/games/lang.html',
    '/games/tictactoe.html',
    '/games/memory.html',
    '/games/sudoku.html',
    '/games/battleship.html',
    '/games/wordsearch.html',
    '/games/hangman.html',
    '/games/connect4.html',
    '/games/dots.html',
    '/games/sinister.html',
    '/games/crosswords.html',
    '/dev/crosswords.html',
  ];

  console.log('\n--- Page Load Tests ---');
  for (const file of htmlFiles) {
    const url = BASE + file;
    log(`Testing: ${file}`);
    try {
      const page = await context.newPage();
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      if (!res || res.status() !== 200) {
        fail(`${file} returned status ${res ? res.status() : 'no response'}`);
        await page.close();
        continue;
      }
      pagesChecked++;
      ok(`${file} loaded (200)`);

      await checkPageResources(page, url);
      await checkLinks(page, url);
      await page.close();
    } catch (e) {
      fail(`${file} failed to load: ${e.message}`);
    }
  }

  console.log('\n--- Manifest AppCache Verification ---');
  const manifestPath = path.join(ROOT, 'manifest.appcache');
  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const lines = content.split('\n');
    let inCache = false;
    const cachedFiles = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === 'CACHE:') { inCache = true; continue; }
      if (trimmed === 'NETWORK:') { inCache = false; continue; }
      if (trimmed.startsWith('#')) continue;
      if (inCache && trimmed) cachedFiles.push(trimmed);
    }
    for (const cf of cachedFiles) {
      const fullPath = path.join(ROOT, cf);
      if (!fs.existsSync(fullPath)) {
        fail(`manifest.appcache lists '${cf}' but file does not exist`);
      } else {
        ok(`manifest file exists: ${cf}`);
      }
    }
  } else {
    warn('manifest.appcache not found');
  }

  console.log('\n--- Smoke Tests on Game Pages ---');
  const smokePages = await browser.newPage();
  await smokePages.setViewportSize({ width: 800, height: 600 });

  // Test Tic-Tac-Toe: verify setup screen elements exist
  log('Smoke: Tic-Tac-Toe setup');
  await smokePages.goto(BASE + '/games/tictactoe.html', { waitUntil: 'domcontentloaded' });
  const tttSetup = await smokePages.evaluate(() => {
    const setup = document.getElementById('setup-screen');
    return { visible: setup && setup.style.display !== 'none', exists: !!setup };
  });
  if (tttSetup.exists) ok('Tic-Tac-Toe setup screen exists');
  else fail('Tic-Tac-Toe missing setup screen');

  // Test Sinister: verify setup screen
  log('Smoke: Sinister Occurrences setup');
  await smokePages.goto(BASE + '/games/sinister.html', { waitUntil: 'domcontentloaded' });
  const sinSetup = await smokePages.evaluate(() => {
    const setup = document.getElementById('setup-screen');
    return { exists: !!setup };
  });
  if (sinSetup.exists) ok('Sinister setup screen exists');
  else fail('Sinister missing setup screen');

  // Test Sudoku: verify setup screen
  log('Smoke: Sudoku setup');
  await smokePages.goto(BASE + '/games/sudoku.html', { waitUntil: 'domcontentloaded' });
  const sudokuSetup = await smokePages.evaluate(() => {
    const setup = document.getElementById('setup-screen');
    return { exists: !!setup };
  });
  if (sudokuSetup.exists) ok('Sudoku setup screen exists');
  else fail('Sudoku missing setup screen');

  // Test Connect4: verify setup screen and check for player color options
  log('Smoke: Connect 4 setup');
  await smokePages.goto(BASE + '/games/connect4.html', { waitUntil: 'domcontentloaded' });
  const c4Setup = await smokePages.evaluate(() => {
    const setup = document.getElementById('setup-screen');
    const buttons = document.querySelectorAll('.mode-selector .btn, #setup-screen .btn');
    return { exists: !!setup, buttonCount: buttons.length };
  });
  if (c4Setup.exists) ok('Connect 4 setup screen exists');
  else fail('Connect 4 missing setup screen');

  // Test Memory: verify setup and game board
  log('Smoke: Memory Game');
  await smokePages.goto(BASE + '/games/memory.html', { waitUntil: 'domcontentloaded' });
  const memSetup = await smokePages.evaluate(() => {
    return {
      setupExists: !!document.getElementById('setup-screen'),
      boardExists: !!document.getElementById('game-board'),
    };
  });
  if (memSetup.setupExists) ok('Memory setup screen exists');
  if (memSetup.boardExists) ok('Memory game board exists');
  if (!memSetup.setupExists && !memSetup.boardExists) fail('Memory missing both setup and board');

  await smokePages.close();

  // Test index.html games grid: all games listed have valid links
  console.log('\n--- Index Grid Verification ---');
  const indexPage = await browser.newPage();
  await indexPage.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  const gameLinks = await indexPage.evaluate(() => {
    return Array.from(document.querySelectorAll('.game-card, .game-list a[href]'))
      .map(a => a.getAttribute('href'))
      .filter(h => h && h.endsWith('.html'));
  });
  if (gameLinks.length > 0) ok(`Found ${gameLinks.length} game links in index`);
  for (const gl of gameLinks) {
    const absolute = new URL(gl, BASE + '/index.html').href;
    const res = await verifyStatusCode(absolute);
    if (res) ok(`Game link OK: ${gl}`);
  }
  await indexPage.close();

  await browser.close();
  server.close();

  console.log('\n=== Results ===');
  console.log(`  Pages checked: ${pagesChecked}`);
  console.log(`  Resources checked: ${resourcesChecked}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
