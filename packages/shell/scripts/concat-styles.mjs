import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(pkg, 'dist'), { recursive: true });

const hand = readFileSync(join(pkg, 'src', 'styles.css'), 'utf8');
const tw = readFileSync(join(pkg, 'dist', 'tw-utilities.css'), 'utf8');
writeFileSync(
  join(pkg, 'dist', 'styles.css'),
  `${hand}\n\n/* tailwind utilities — generated, do not edit */\n${tw}`,
);
