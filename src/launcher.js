#!/usr/bin/env node

/**
 * Cline banner launcher.
 *
 * The wordmark below is byte-identical to the fenced banner at the top of
 * README.md (and every i18n/README.<lang>.md) — keep the two in sync.
 *
 * ESM: this package is `"type": "module"`, so CommonJS `module.exports` here
 * would make the file unloadable by `src/cli.js`.
 */

const WORDMARK = [
  ' ██████╗   ██╗     ██   ███╗     ███╗   ██╗ ███████╗',
  '██╔════╝   ██║     ██  █████╗    ████╗  ██║ ██╔════╝',
  '█████╗     ██║     ██  ██╔██║    ██╔██╗ ██║ █████╗  ',
  '██╔══╝     ██║     ██  ██║╚██║   ██║╚██╗██║ ██╔══╝  ',
  '███████╗   ███████╗    ██████║   ██║ ╚████║ ███████╗',
  '╚══════╝   ╚══════╝    ╚═════╝   ╚═╝  ╚═══╝ ╚══════╝',
];

const WIDTH = Math.max(...WORDMARK.map((r) => r.length));
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const color = process.stdout.isTTY && !process.env.NO_COLOR;

const border = (fill) => (color ? `${DIM}${fill}${RESET}` : fill);

/** The wordmark inside a `╔═…═╗` box, matching the house style. */
function boxedBanner() {
  const line = '═'.repeat(WIDTH);
  return ['', border('╔' + line + '╗'), ...WORDMARK.map((r) => r + ' '.repeat(WIDTH - r.length) + border('║')), border('╚' + line + '╝'), ''].join('\n');
}

const CLINE_BANNER = WORDMARK.join('\n');

function showBanner() {
  console.log(boxedBanner());
}

function showCompact() {
  console.log('  C L I N E   b u l k - a p i k e y');
}

export { showBanner, showCompact, CLINE_BANNER, WORDMARK, boxedBanner, CYAN };

if (process.argv[1] && process.argv[1].endsWith('launcher.js')) {
  showBanner();
}
