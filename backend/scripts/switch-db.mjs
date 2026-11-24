import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = (process.argv[2] || '').toLowerCase();
if (!['sqlite', 'postgres', 'postgresql'].includes(target)) {
  console.error('Usage: node scripts/switch-db.mjs <sqlite|postgres>');
  process.exit(1);
}

const provider = target === 'sqlite' ? 'sqlite' : 'postgresql';
const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
const current = fs.readFileSync(schemaPath, 'utf8');

const datasourceBlock =
  provider === 'postgresql'
    ? [
        'datasource db {',
        '  provider  = "postgresql"',
        '  url       = env("DATABASE_URL")',
        '  directUrl = env("DIRECT_URL")',
        '}',
      ].join('\n')
    : [
        'datasource db {',
        '  provider = "sqlite"',
        '  url      = env("DATABASE_URL")',
        '}',
      ].join('\n');

if (!/datasource\s+db\s*\{[\s\S]*?\}/.test(current)) {
  console.error('Impossible de localiser le bloc datasource db dans prisma/schema.prisma');
  process.exit(1);
}

const updated = current.replace(/datasource\s+db\s*\{[\s\S]*?\}/, datasourceBlock);

fs.writeFileSync(schemaPath, updated, 'utf8');
console.log(`Prisma datasource basculé sur "${provider}" dans prisma/schema.prisma.`);
console.log('Exécutez ensuite : npx prisma generate && npx prisma db push');
