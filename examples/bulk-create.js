#!/usr/bin/env node

/**
 * Bulk-create example: mint N Cline API keys from a script, then (optionally)
 * register them in 9Router.
 *
 *   node examples/bulk-create.js --count 200 --prefix clx
 *   node examples/bulk-create.js --dry          # no network, no keys minted
 *
 * Minting for real needs one of:
 *   - `out/.cline-auth.json` with a WorkOS refresh token, or
 *   - `CLINE_REFRESH_TOKEN` in the environment.
 *
 * The keys land in `out/cline-keys.txt` (one `sk-…` per line, with a three-line
 * header). `--dry` prints exactly what would be created and writes nothing.
 */

const { cmdCreate, cmdVerify } = require('../src/cli.js');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const flag = (n) => process.argv.includes(`--${n}`);

(async () => {
  const count = Number(arg('count', '200'));
  const prefix = arg('prefix', 'clx');

  if (flag('dry')) {
    console.log(`[dry] would create ${count} keys "${prefix}-NNN" (${prefix}-001 … ${prefix}-${String(count).padStart(3, '0')})`);
    console.log('[dry] would write out/cline-keys.txt and out/cline-keys.jsonl.failures.json');
    console.log('[dry] would then verify them against a free model (402 counts as accepted)');
    console.log('[dry] nothing was created — drop --dry to mint for real');
    process.exit(0);
  }

  console.log(`Creating ${count} Cline API keys…\n`);
  const created = await cmdCreate();

  console.log(`\nDone! Created ${created.length} keys.`);
  console.log('Keys saved to: out/cline-keys.txt');

  if (created.length && flag('verify')) {
    console.log('\nVerifying…');
    const { accepted } = await cmdVerify();
    console.log(`Accepted ${accepted}/${created.length}`);
  }
})().catch((e) => {
  console.error('FATAL', e.stack || e.message);
  process.exitCode = 1;
});
