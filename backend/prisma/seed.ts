import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv();

const prisma = new PrismaClient();

async function seedDemoUsers() {
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin2026';
  const pharmaPass = process.env.SEED_PHARMACY_PASSWORD || 'pharma2026';

  const [adminHash, pharmaHash, visitorHash] = await Promise.all([
    bcrypt.hash(adminPass, 10),
    bcrypt.hash(pharmaPass, 10),
    bcrypt.hash('Patient2026!', 10),
  ]);

  // 1. Utilisateurs initiaux (Admin, Pharmaciens, Visiteurs)
  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@pharmaconnect.org' },
    update: {},
    create: {
      id: 1,
      email: process.env.SEED_ADMIN_EMAIL || 'admin@pharmaconnect.org',
      name: 'Administration PharmaConnect',
      passwordHash: adminHash,
      role: 'ADMIN',
      provider: 'email',
    },
  });

  await prisma.user.upsert({
    where: { email: 'contact@centrale.example' },
    update: {},
    create: {
      id: 100,
      email: 'contact@centrale.example',
      name: 'Pharmacien Centrale',
      passwordHash: pharmaHash,
      role: 'PHARMACIST',
      provider: 'email',
      phone: '+235 66 20 10 01',
    },
  });

  await prisma.user.upsert({
    where: { email: 'grandmarche@example.com' },
    update: {},
    create: {
      id: 200,
      email: 'grandmarche@example.com',
      name: 'Pharmacien Grand Marché',
      passwordHash: pharmaHash,
      role: 'PHARMACIST',
      provider: 'email',
      phone: '+235 66 20 10 02',
    },
  });

  await prisma.user.upsert({
    where: { email: 'esperance@example.com' },
    update: {},
    create: {
      id: 300,
      email: 'esperance@example.com',
      name: 'Pharmacien Espérance',
      passwordHash: pharmaHash,
      role: 'PHARMACIST',
      provider: 'email',
      phone: '+235 66 20 10 03',
    },
  });

  await prisma.user.upsert({
    where: { email: 'aminata.diallo@gmail.com' },
    update: {},
    create: {
      id: 400,
      email: 'aminata.diallo@gmail.com',
      name: 'Aminata Diallo',
      role: 'VISITOR',
      provider: 'google',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sophie.koffi@patient.example' },
    update: {},
    create: {
      id: 401,
      email: 'sophie.koffi@patient.example',
      name: 'Sophie Koffi',
      passwordHash: visitorHash,
      role: 'VISITOR',
      provider: 'email',
    },
  });

}

async function main() {
  const demo = process.env.SEED_DEMO_DATA === 'true';
  if (demo && process.env.NODE_ENV === 'production') {
    throw new Error('Les données de démonstration sont réservées aux environnements locaux et de test.');
  }
  if (demo) {
    await seedDemoUsers();
  } else if (!await prisma.user.count({ where: { role: 'ADMIN' } })) {
    const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
      throw new Error('Renseignez SEED_ADMIN_EMAIL et un mot de passe administrateur de 12 caractères minimum (72 octets max).');
    }
    await prisma.user.create({
      data: { email, name: 'Administration PharmaConnect', passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' },
    });
  }

  // 2. Catégories officielles de la plateforme
  const officialCategories = ['Médicaments', 'Vitamines', 'Hygiène', 'Matériel médical', 'Parapharmacie', 'Bébé & maternité'];
  for (let i = 0; i < officialCategories.length; i++) {
    await prisma.platformCategory.upsert({
      where: { name: officialCategories[i] },
      update: {},
      create: { name: officialCategories[i], position: i },
    });
  }

  // 3. Badges
  const badgesData = [
    {
      id: 1,
      key: 'verified',
      name: 'Pharmacie vérifiée',
      description: 'Documents administratifs vérifiés par PharmaConnect.',
      color: 'mint',
      icon: 'shield',
      visible: true,
      expiryDays: null,
      system: true,
    },
    {
      id: 2,
      key: 'premium-partner',
      name: 'Partenaire Premium',
      description: 'Établissement disposant du forfait Premium.',
      color: 'blue',
      icon: 'star',
      visible: true,
      expiryDays: null,
      system: false,
    },
    {
      id: 3,
      key: 'recommended',
      name: 'Recommandée',
      description: 'Badge attribué par l’administration.',
      color: 'gold',
      icon: 'award',
      visible: true,
      expiryDays: 365,
      system: false,
    },
  ];
  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { key: b.key },
      update: {},
      create: demo ? b : { ...b, id: undefined },
    });
  }

  // 4. Formules tarifaires (FCFA)
  const plansData = [
    {
      name: 'Basic',
      monthly: 5000,
      quarterly: 13500,
      yearly: 48000,
      description: 'Pour démarrer une présence numérique.',
      features: JSON.stringify([
        'Fiche pharmacie publique',
        'Catalogue de produits',
        'Mise à jour des prix et stocks',
        'Contact direct par téléphone et messagerie',
      ]),
      position: 0,
    },
    {
      name: 'Standard',
      monthly: 10000,
      quarterly: 27000,
      yearly: 96000,
      description: 'Pour développer votre visibilité.',
      features: JSON.stringify([
        'Tous les avantages Basic',
        'Statistiques de visibilité',
        'Notifications et suivi du catalogue',
        'Outils de gestion avancés',
      ]),
      position: 1,
    },
    {
      name: 'Premium',
      monthly: 20000,
      quarterly: 54000,
      yearly: 192000,
      description: 'Pour une gestion complète et prioritaire.',
      features: JSON.stringify([
        'Tous les avantages Standard',
        'Fonctionnalités avancées de soumission et suivi de validation produits',
        'Badge Premium personnalisable',
        'Accompagnement prioritaire',
      ]),
      position: 2,
    },
  ];
  for (const pl of plansData) {
    await prisma.plan.upsert({
      where: { name: pl.name },
      update: {},
      create: pl,
    });
  }

  if (demo) {
    const now = new Date();
    const yesterday = new Date(Date.now() - 86_400_000);
    const olderDate = new Date(Date.now() - 3 * 86_400_000);
    // 5. Établissements initiaux
    const activeSubscriptionUntil = new Date(Date.now() + 90 * 86_400_000);
    const pharmaciesData = [
      {
        id: 1,
        ownerId: 100,
        name: 'Pharmacie Centrale',
        city: 'N’Djamena',
        area: 'Avenue Charles de Gaulle',
        address: 'Avenue Charles de Gaulle, face Place de la Nation',
        phone: '+235 66 20 10 01',
        email: 'contact@centrale.example',
        license: 'AUT-001-2026',
        responsible: 'Pharmacien responsable',
        lat: 12.1131,
        lng: 15.0492,
        status: 'Validée',
        subscription: 'Premium',
        subscriptionEndsAt: activeSubscriptionUntil,
        coverImage: '/images/pharmacy-1.jpg',
        documentsNote: 'agrement_centrale_2026.pdf',
        badges: [1, 2],
      },
      {
        id: 2,
        ownerId: 200,
        name: 'Pharmacie du Grand Marché',
        city: 'N’Djamena',
        area: 'Quartier Bololo · Grand Marché',
        address: 'Avenue Mobutu, près de la Grande Mosquée',
        phone: '+235 66 20 10 02',
        email: 'grandmarche@example.com',
        license: 'AUT-002-2026',
        responsible: 'Pharmacien titulaire',
        lat: 12.1098,
        lng: 15.0554,
        status: 'Validée',
        subscription: 'Standard',
        subscriptionEndsAt: activeSubscriptionUntil,
        coverImage: '/images/pharmacy-2.jpg',
        documentsNote: 'agrement_grandmarche_2026.pdf',
        badges: [1],
      },
      {
        id: 3,
        ownerId: 300,
        name: 'Pharmacie Espérance',
        city: 'N’Djamena',
        area: 'Quartier Moursal',
        address: 'Avenue Maldom Bada Abbas, Carrefour Moursal',
        phone: '+235 66 20 10 03',
        email: 'esperance@example.com',
        license: 'AUT-003-2026',
        responsible: 'Pharmacien responsable',
        lat: 12.0954,
        lng: 15.0681,
        status: 'En vérification',
        subscription: 'Basic',
        coverImage: '/images/pharmacy-3.jpg',
        documentsNote: 'dossier_esperance_2026.pdf',
        badges: [],
      },
    ];

    for (const ph of pharmaciesData) {
      const { badges, ...fields } = ph;
      await prisma.pharmacy.upsert({
        where: { id: fields.id },
        update: fields,
        create: fields,
      });
      for (const badgeId of badges) {
        await prisma.pharmacyBadge.upsert({
          where: { pharmacyId_badgeId: { pharmacyId: fields.id, badgeId } },
          update: {},
          create: { pharmacyId: fields.id, badgeId },
        });
      }
      await prisma.pharmacyPreferences.upsert({
        where: { pharmacyId: fields.id },
        update: {},
        create: {
          pharmacyId: fields.id,
          notificationMessages: true,
          subscriptionReminders: true,
          lowStockAlerts: false,
          lowStockThreshold: 5,
        },
      });
    }

    // 6. Produits initiaux (si absents, pour ne pas écraser les changements)
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      const productsData = [
        { id: 1, pharmacyId: 1, name: 'Paracétamol 500 mg', category: 'Médicaments', brand: 'Sanofi', code: '3400930000012', price: 1500, stock: 42, status: 'Publié', stockUpdatedAt: now, description: 'Comprimés — boîte de 16.', imageUrl: '/images/prod-paracetamol.jpg' },
        { id: 2, pharmacyId: 1, name: 'Vitamine C 1000 mg', category: 'Vitamines', brand: 'UPSA', code: '3400930000029', price: 3200, stock: 18, status: 'Publié', stockUpdatedAt: yesterday, description: 'Complément vitaminé effervescent.', imageUrl: '/images/prod-vitaminc.jpg' },
        { id: 3, pharmacyId: 1, name: 'Gel hydroalcoolique 100 ml', category: 'Hygiène', brand: 'PharmaCare', code: '', price: 1200, stock: 6, status: 'En attente', stockUpdatedAt: now, description: 'Gel désinfectant pour les mains.', imageUrl: '/images/prod-gel.jpg' },
        { id: 4, pharmacyId: 1, name: 'Thermomètre digital', category: 'Matériel médical', brand: 'Omron', code: '', price: 4500, stock: 0, status: 'À corriger', note: 'Merci de confirmer la catégorie et la disponibilité.', stockUpdatedAt: olderDate, description: 'Thermomètre électronique précis.', imageUrl: '/images/prod-thermometer.jpg' },
        { id: 5, pharmacyId: 1, name: 'Sérum physiologique', category: 'Hygiène', brand: 'Gifrer', code: '', price: 900, stock: 31, status: 'Publié', stockUpdatedAt: olderDate, description: 'Solution saline stérile en unidoses.', imageUrl: '/images/prod-serum.jpg' },
        { id: 6, pharmacyId: 2, name: 'Crème hydratante', category: 'Parapharmacie', brand: 'Topicrem', code: '', price: 5200, stock: 12, status: 'Publié', stockUpdatedAt: now, description: 'Soin dermatologique hydratant.', imageUrl: '/images/prod-creme.jpg' },
        { id: 7, pharmacyId: 3, name: 'Masques chirurgicaux', category: 'Matériel médical', brand: 'SafeMed', code: '', price: 2500, stock: 30, status: 'Brouillon', stockUpdatedAt: yesterday, description: 'Boîte de 50 masques haute filtration.', imageUrl: '/images/prod-masques.jpg' },
      ];
      for (const p of productsData) {
        await prisma.product.create({
          data: {
            ...p,
            stockHistory: { create: { price: p.price, stock: p.stock, createdAt: p.stockUpdatedAt } },
          },
        });
      }
    }

    // 7. Messages initiaux
    const initialMessages = [
      { id: 1, pharmacyId: 1, sender: 'Ama K.', phone: '+235 66 45 11 22', subject: 'Disponibilité du Paracétamol', body: 'Bonjour, le Paracétamol 500 mg est-il disponible actuellement ?', read: false, direction: 'visitor', createdAt: now },
      { id: 2, pharmacyId: 1, sender: 'Kossi D.', phone: '+235 99 30 44 55', subject: 'Horaire de fermeture', body: 'Bonsoir, à quelle heure fermez-vous ce soir ?', read: true, direction: 'visitor', createdAt: yesterday },
    ];
    for (const m of initialMessages) {
      await prisma.message.upsert({
        where: { id: m.id },
        update: { phone: m.phone },
        create: m,
      });
    }

    // 8. Notifications initiales
    if ((await prisma.notice.count()) === 0) {
      await prisma.notice.createMany({
        data: [
          { id: 1, pharmacyId: 1, title: 'Bienvenue sur PharmaConnect', body: 'Votre espace de démonstration est prêt. Complétez votre profil pour préparer la mise en ligne.', kind: 'info', read: false, createdAt: now },
          { id: 2, pharmacyId: 1, title: 'Produit à corriger', body: 'Le thermomètre digital nécessite une information complémentaire.', kind: 'warning', read: false, createdAt: olderDate },
        ],
      });
    }

  }

  // 9. Paramètre de fraîcheur
  await prisma.setting.upsert({
    where: { key: 'freshnessDays' },
    update: {},
    create: { key: 'freshnessDays', value: '7' },
  });

  // 10. Resynchroniser les séquences PostgreSQL si la base utilise PostgreSQL
  const dbUrl = process.env.DATABASE_URL || '';
  if (demo && dbUrl.startsWith('postgres')) {
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), COALESCE((SELECT MAX(id) FROM "User"), 1), true)`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Pharmacy"', 'id'), COALESCE((SELECT MAX(id) FROM "Pharmacy"), 1), true)`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), COALESCE((SELECT MAX(id) FROM "Product"), 1), true)`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Badge"', 'id'), COALESCE((SELECT MAX(id) FROM "Badge"), 1), true)`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Message"', 'id'), COALESCE((SELECT MAX(id) FROM "Message"), 1), true)`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Notice"', 'id'), COALESCE((SELECT MAX(id) FROM "Notice"), 1), true)`;
  }

  console.log('Seed PharmaConnect exécuté avec succès.');
}

main()
  .catch(err => {
    console.error('Erreur seed Prisma :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
