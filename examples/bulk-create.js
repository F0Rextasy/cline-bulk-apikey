#!/usr/bin/env node
'use strict';

/**
 * Bulk-create example: create 200 Cline API keys.
 * 
 * Run: node examples/bulk-create.js
 */

import { createKeys, writeKeysFile } from '../src/cli.js';

async function main() {
  console.log('Creating 200 Cline API keys...');
  
  const count = 200;
  const prefix = 'clx';
  
  // Keys are written to out/cline-keys.txt automatically
  const created = await createKeys({ count, prefix });
  
  console.log(`\nDone! Created ${created.length} keys.`);
  console.log('Keys saved to: out/cline-keys.txt');
}

main().catch(console.error);