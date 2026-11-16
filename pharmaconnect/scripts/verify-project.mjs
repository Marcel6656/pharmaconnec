import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const adminPage = fs.existsSync(path.join(root, 'app/admin/page.tsx')) ? read('app/admin/page.tsx') : '';
const shared = fs.existsSync(path.join(root, 'lib/shared.tsx')) ? read('lib/shared.tsx') : '';
function readAllFromDir(dir) {
  let content = '';
  const dirPath = path.join(root, dir);
  if (!fs.existsSync(dirPath)) return content;
  const entries = fs.readdirSync(dirPath, { recursive: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry);
    if (fs.statSync(full).isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
      content += '\n' + fs.readFileSync(full, 'utf8');
    }
  }
  return content;
}
const components = readAllFromDir('components');
const page = read('app/page.tsx') + '\n' + adminPage + '\n' + shared + '\n' + components;
const css = read('app/globals.css');
const readme = read('README.md');
const backend = ['admin/admin.module.ts', 'common/core.service.ts', 'products/products.module.ts', 'state/state.module.ts']
  .map(file => read('../backend/src/' + file)).join('\n');
const pkg = JSON.parse(read('package.json'));

const checks = [
  ['Site public / accueil', /page\s*===\s*'Accueil'/],
  ['Annuaire des pharmacies', /page\s*===\s*'Pharmacies'/],
  ['Catalogue public produits', /page\s*===\s*'Produits'/],
  ['Fiche pharmacie', /page\s*===\s*'Fiche pharmacie'/],
  ['Tarifs Basic / Standard / Premium', /name:\s*'Basic'.*[\s\S]*name:\s*'Standard'.*[\s\S]*name:\s*'Premium'/],
  ['Inscription professionnelle', /page\s*===\s*'Inscription pharmacie'/],
  ['Espace pharmacie', /space\s*===\s*'pharmacy'/],
  ['Gestion produits et brouillons', /saveProduct\(draft: boolean\)[\s\S]*draft \? 'Brouillon' : 'En attente'/],
  ['Validation administrative obligatoire des produits', /Validation obligatoire avant publication/],
  ['Historique des stocks et prix', /stockHistory/],
  ['Catégories officielles et personnalisées', /Catégories officielles[\s\S]*Catégories personnalisées/],
  ['Messagerie en fil de discussion', /function sendVisitorReply[\s\S]*threadId/],
  ['Boîte de réception visiteur facultative', /visitorInbox/],
  ['Gestion établissement et multi-établissements', /Ajouter un établissement à votre compte/],
  ['Gestion abonnement et paiement Mobile Money', /Paiement Mobile Money/],
  ['Essai de 14 jours après validation', /Votre essai gratuit de 14 jours commence maintenant/],
  ['Badges administrables avec durée', /expiryDays/],
  ['Badge de vérification obligatoire à l’activation', /if \(finalStatus === 'Validée'\) await this\.core\.assignVerifiedBadge/],
  ['Espace administration', /space\s*===\s*'admin'/],
  ['Modération produits', /page\s*===\s*'Validation produits'/],
  ['Demandes de pharmacies', /page\s*===\s*'Demandes pharmacies'/],
  ['Gestion des signalements', /page\s*===\s*'Signalements'/],
  ['Journal d’activité', /page\s*===\s*'Journal d’activité'/],
  ['Paramètres de fraîcheur catalogue', /freshnessDays/],
  ['Masquage public des pharmacies non actives', /p\.status\s*===\s*'Validée'/],
  ['Géolocalisation et calcul de distance', /navigator.geolocation[\s\S]*distanceKm/],
  ['Écritures serveur par action, état global en lecture', /onDocumentsUploaded[\s\S]*new GoneException/],
  ['Absence de vente en ligne / panier / commandes documentée', /Pas de panier, pas de commande, pas de checkout et pas de paiement de produits par les visiteurs/],
  ['DA bleue et vert menthe, responsive', /--mint:[\s\S]*--blue:[\s\S]*@media\(max-width:780px\)/],
  ['Angles et bordures sobres', /border-radius:\s*[0-9]+px/],
];

let failed = 0;
for (const [label, regex] of checks) {
  const ok = regex.test(label.includes('DA') || label.includes('Angles') ? css + '\n' + page : page + '\n' + readme + '\n' + backend);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failed++;
}

for (const file of ['app/layout.tsx', 'app/globals.css', 'next.config.ts', 'tailwind.config.ts', 'tsconfig.json']) {
  const exists = fs.existsSync(path.join(root, file));
  console.log(`${exists ? 'PASS' : 'FAIL'}  Fichier requis : ${file}`);
  if (!exists) failed++;
}

if (!pkg.scripts?.build || !pkg.scripts?.typecheck) {
  console.log('FAIL  Scripts build/typecheck présents');
  failed++;
} else {
  console.log('PASS  Scripts build/typecheck présents');
}

console.log(`\n${checks.length + 6 - failed}/${checks.length + 6} contrôles statiques réussis.`);
if (failed) process.exit(1);
