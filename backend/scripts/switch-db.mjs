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

const updated = current.replace(
  /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+(")/,
  `$1${provider}$2`,
);

if (updated === current && !current.includes(`provider = "${provider}"`)) {
  console.error('Impossible de localiser le bloc datasource db dans prisma/schema.prisma');
  process.exit(1);
}

fs.writeFileSync(schemaPath, updated, 'utf8');
console.log(`Prisma datasource basculé sur "${provider}" dans prisma/schema.prisma.`);
console.log('Exécutez ensuite : npx prisma generate && npx prisma db push');
