import 'reflect-metadata';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync, closeSync, openSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

const testDirectory = mkdtempSync(join(tmpdir(), 'pharmaconnect-test-'));
const tmpDb = join(testDirectory, 'integration.db');
process.env.DATABASE_URL = `file:${tmpDb}`;
process.env.NODE_ENV = 'test';
process.env.SEED_DEMO_DATA = 'true';
process.env.SEED_ADMIN_EMAIL = 'admin@pharmaconnect.org';
process.env.SEED_ADMIN_PASSWORD = 'admin2026';
process.env.SEED_PHARMACY_PASSWORD = 'pharma2026';
process.env.MOBILE_MONEY_MODE = 'manual_reconciliation';
process.env.UPLOAD_DIR = join(testDirectory, 'uploads');
for (const key of ['GOOGLE_CLIENT_ID', 'RESEND_API_KEY', 'SMTP_WEBHOOK_URL', 'SMS_API_URL']) process.env[key] = '';
process.env.JWT_SECRET = 'test-secret-pharmaconnect-au-moins-32-caracteres-2026';
process.env.PAYMENT_WEBHOOK_SECRET = 'test-webhook-secret-pharmaconnect-32-chars';
process.env.GOOGLE_DEMO_MODE = 'false';

let app: NestExpressApplication;
let baseUrl = '';
let cataloguePharmacistToken: string;

async function api(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const prefix = path.startsWith('/uploads/') ? '' : '/api';
  const res = await fetch(`${baseUrl}${prefix}${path}`, { ...init, headers });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json, headers: res.headers };
}

before(async () => {
  closeSync(openSync(tmpDb, 'a'));
  execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'db', 'push', '--schema', 'prisma/schema.prisma', '--skip-generate']);
  execFileSync(process.execPath, ['--import', 'tsx', 'prisma/seed.ts']);
  const { AppModule } = await import('../src/app.module');
  app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false, rawBody: true });
  const { uploadedImageRoute } = await import('../src/common/uploads');
  app.setGlobalPrefix('api', { exclude: [uploadedImageRoute] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
});

after(async () => {
  await app?.close();
  rmSync(testDirectory, { recursive: true, force: true });
});

describe('PharmaConnect — Sécurité & Règles métier', () => {
  it('désactive le mode démo Google et cloisonne /api/state', async () => {
    const g = await api('/auth/google/config');
    assert.equal(g.status, 200);
    assert.equal(g.json.demoMode, false);

    const stateAnon = await api('/state');
    assert.equal(stateAnon.status, 200);
    assert.deepEqual(stateAnon.json.messages, []);
    assert.deepEqual(stateAnon.json.payments, []);
    assert.deepEqual(stateAnon.json.reports, []);
    assert.deepEqual(stateAnon.json.auditLogs, []);

    const putAnon = await api('/state', { method: 'PUT', body: JSON.stringify({}) });
    assert.equal(putAnon.status, 401);
  });

  it('révoque les anciens JWT lors du changement de mot de passe et de logout-all', async () => {
    const email = `visitor-${Date.now()}@example.com`;
    const reg = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Patient Test', email, password: 'Password123!' }),
    });
    assert.equal(reg.status, 201);
    const oldToken = reg.json.accessToken as string;
    assert.ok(oldToken);

    const me1 = await api('/auth/me', {}, oldToken);
    assert.equal(me1.status, 200);
    assert.equal(me1.json.email, email);

    const changed = await api(
      '/auth/change-password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword: 'Password123!', newPassword: 'NewPassword456!' }),
      },
      oldToken,
    );
    assert.equal(changed.status, 201);
    const newToken = changed.json.accessToken as string;
    assert.ok(newToken && newToken !== oldToken);

    const meWithOld = await api('/auth/me', {}, oldToken);
    assert.equal(meWithOld.status, 401);

    const meWithNew = await api('/auth/me', {}, newToken);
    assert.equal(meWithNew.status, 200);

    const adminForbidden = await api('/admin/contacts', {}, newToken);
    assert.equal(adminForbidden.status, 403);

    const logoutAll = await api('/auth/logout-all', { method: 'POST' }, newToken);
    assert.equal(logoutAll.status, 201);

    const meAfterLogoutAll = await api('/auth/me', {}, newToken);
    assert.equal(meAfterLogoutAll.status, 401);
  });

  it('gère le cycle complet des messages de contact et la modération produit avec motif', async () => {
    const contact = await api('/public/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jean Test',
        email: 'jean.test@example.com',
        topic: 'Support partenaire',
        message: 'Bonjour, je souhaite vérifier notre dossier.',
      }),
    });
    assert.equal(contact.status, 201);
    assert.equal(contact.json.ok, true);
    const contactId = contact.json.id as number;

    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: process.env.SEED_ADMIN_EMAIL || 'admin@pharmaconnect.org',
        password: process.env.SEED_ADMIN_PASSWORD || 'admin2026',
        role: 'ADMIN',
      }),
    });
    assert.equal(adminLogin.status, 201);
    const adminToken = adminLogin.json.accessToken as string;

    const listRes = await api('/admin/contacts', {}, adminToken);
    assert.equal(listRes.status, 200);
    assert.ok(listRes.json.some((c: any) => c.id === contactId && c.status === 'Nouveau'));

    const patchContact = await api(
      `/admin/contacts/${contactId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Traité', adminNote: 'Répondu par e-mail.' }),
      },
      adminToken,
    );
    assert.equal(patchContact.status, 200);
    assert.equal(patchContact.json.status, 'Traité');
    assert.equal(patchContact.json.adminNote, 'Répondu par e-mail.');

    const pharmaLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'contact@centrale.example',
        password: process.env.SEED_PHARMACY_PASSWORD || 'pharma2026',
        role: 'PHARMACIST',
      }),
    });
    assert.equal(pharmaLogin.status, 201);
    const pharmaToken = pharmaLogin.json.accessToken as string;

    const crossPharmacy = await api(
      '/pharmacies/2/products',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Intrusion', category: 'Médicaments', price: 1000, stock: 5 }),
      },
      pharmaToken,
    );
    assert.equal(crossPharmacy.status, 404);

    const createdProd = await api(
      '/pharmacies/1/products',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Amoxicilline 500', category: 'Médicaments', price: 2400, stock: 12 }),
      },
      pharmaToken,
    );
    assert.equal(createdProd.status, 201);

    const moderated = await api(
      `/admin/products/${createdProd.json.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'À corriger', note: 'Indiquez le laboratoire fabricant.' }),
      },
      adminToken,
    );
    assert.equal(moderated.status, 200);
    assert.equal(moderated.json.status, 'À corriger');
    assert.equal(moderated.json.note, 'Indiquez le laboratoire fabricant.');
  });

  it('applique les quotas de formule Basic vs Premium et bloque les faux PNG HTML', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url: `file:${tmpDb}` } } });
    try {
      await prisma.pharmacy.update({
        where: { id: 3 },
        data: { status: 'Validée', subscription: 'Basic', trialEndsAt: null, subscriptionEndsAt: new Date(Date.now() + 30 * 86_400_000) },
      });
      const existingCount = await prisma.product.count({ where: { pharmacyId: 3, status: { not: 'Archivé' } } });
      for (let i = existingCount; i < 50; i++) {
        await prisma.product.create({
          data: { pharmacyId: 3, name: `Produit Quota ${i}`, category: 'Médicaments', price: 500, stock: 1, status: 'Brouillon' },
        });
      }
      const user3 = await prisma.user.findUniqueOrThrow({ where: { email: 'esperance@example.com' } });
      await prisma.user.update({ where: { id: user3.id }, data: { active: true } });
    } finally {
      await prisma.$disconnect();
    }

    const pharma3 = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'esperance@example.com',
        password: process.env.SEED_PHARMACY_PASSWORD || 'pharma2026',
        role: 'PHARMACIST',
      }),
    });
    assert.equal(pharma3.status, 201);
    const token3 = pharma3.json.accessToken as string;

    const overQuota = await api(
      '/pharmacies/3/products',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Produit 51', category: 'Médicaments', price: 1000, stock: 2 }),
      },
      token3,
    );
    assert.equal(overQuota.status, 403);

    const form = new FormData();
    form.append('files', new Blob(['<html><script>alert(1)</script></html>'], { type: 'image/png' }), 'evil.png');
    const badUpload = await api('/pharmacies/3/documents', { method: 'POST', body: form }, token3);
    assert.equal(badUpload.status, 400);

    const incompleteRegister = await api('/pharmacies/register', {
      method: 'POST',
      body: JSON.stringify({
        accountEmail: `incomplet-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Officine Incomplete',
        city: 'N’Djamena',
        phone: '+235 66 00 11 22',
        license: 'LIC-INCOMPLET-2026',
      }),
    });
    assert.equal(incompleteRegister.status, 400);

    const expiredCardRes = await api(
      '/pharmacies/3/payments',
      {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Standard',
          period: 'Mensuel',
          method: 'Carte bancaire',
          cardBrand: 'Visa',
          cardLast4: '4242',
          cardHolder: 'Dr Test',
          cardExpiry: '01/20',
        }),
      },
      token3,
    );
    assert.equal(expiredCardRes.status, 400);

    const { PrismaClient: PrismaClient2 } = await import('@prisma/client');
    const prisma2 = new PrismaClient2({ datasources: { db: { url: `file:${tmpDb}` } } });
    try {
      await prisma2.pharmacy.update({
        where: { id: 3 },
        data: { status: 'Validée', trialEndsAt: null, subscriptionEndsAt: new Date(Date.now() - 60_000) },
      });
    } finally {
      await prisma2.$disconnect();
    }

    const msgToExpired = await api('/messages', {
      method: 'POST',
      body: JSON.stringify({
        pharmacyId: 3,
        sender: 'Patient Test',
        phone: '+23566001122',
        body: 'Test message sur pharmacie expirée.',
      }),
    });
    assert.equal(msgToExpired.status, 404);
  });

  it('vérifie carte bancaire, idempotence paiement, réactivation Refusée, conservation des filiales, lecture du fil et modération image', async () => {
    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: process.env.SEED_ADMIN_EMAIL || 'admin@pharmaconnect.org',
        password: process.env.SEED_ADMIN_PASSWORD || 'admin2026',
        role: 'ADMIN',
      }),
    });
    assert.equal(adminLogin.status, 201);
    const adminToken = adminLogin.json.accessToken as string;

    const pharmaLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'contact@centrale.example',
        password: process.env.SEED_PHARMACY_PASSWORD || 'pharma2026',
        role: 'PHARMACIST',
      }),
    });
    assert.equal(pharmaLogin.status, 201);
    const pharmaToken = pharmaLogin.json.accessToken as string;
    const pharmaOwnerId = pharmaLogin.json.user.id as number;

    // 1. Carte bancaire sans cardExpiry -> 400
    const missingExpiryCard = await api(
      '/pharmacies/1/payments',
      {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Standard',
          period: 'Mensuel',
          method: 'Carte bancaire',
          cardBrand: 'Visa',
          cardLast4: '4242',
          cardHolder: 'Dr Centrale',
        }),
      },
      pharmaToken,
    );
    assert.equal(missingExpiryCard.status, 400);

    // 2. Idempotence confirmation paiement (double appel PATCH ne prolonge qu'une fois)
    const pendingPay = await api(
      '/pharmacies/1/payments',
      {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Standard',
          period: 'Mensuel',
          method: 'Mobile Money',
          provider: 'Airtel Money',
          payerPhone: '+235 66 20 10 01',
        }),
      },
      pharmaToken,
    );
    assert.equal(pendingPay.status, 201);
    assert.equal(pendingPay.json.status, 'En attente');

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url: `file:${tmpDb}` } } });
    let endAfterFirst: Date | null = null;
    try {
      const firstConfirm = await api(
        `/admin/payments/${pendingPay.json.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'Confirmé', externalRef: 'TEST-RAPPROCHEMENT-1' }),
        },
        adminToken,
      );
      assert.equal(firstConfirm.status, 200);
      assert.equal(firstConfirm.json.status, 'Confirmé');

      const phAfter1 = await prisma.pharmacy.findUniqueOrThrow({ where: { id: 1 } });
      endAfterFirst = phAfter1.subscriptionEndsAt;
      assert.ok(endAfterFirst);

      // Deuxième confirmation idempotente -> 200 sans double prolongation, et tentative de bascule Échoué -> 400
      const secondConfirm = await api(
        `/admin/payments/${pendingPay.json.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'Confirmé', externalRef: 'TEST-RAPPROCHEMENT-1' }),
        },
        adminToken,
      );
      assert.equal(secondConfirm.status, 200);
      assert.equal(secondConfirm.json.status, 'Confirmé');

      const phAfter2 = await prisma.pharmacy.findUniqueOrThrow({ where: { id: 1 } });
      assert.equal(phAfter2.subscriptionEndsAt?.getTime(), endAfterFirst.getTime());

      const flipToFailed = await api(
        `/admin/payments/${pendingPay.json.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'Échoué' }),
        },
        adminToken,
      );
      assert.equal(flipToFailed.status, 400);

      // 3. Refusée -> Validée sans date d'expiration préalable initialise l'essai gratuit de 14 jours
      const refusedPh = await prisma.pharmacy.create({
        data: {
          ownerId: pharmaOwnerId,
          name: 'Pharmacie Refusée Test',
          city: 'N’Djamena',
          area: 'Moursal',
          address: 'Rue 40',
          phone: '+235 66 12 34 56',
          email: `refused-${Date.now()}@example.com`,
          license: `LIC-REFUSED-${Date.now()}`,
          responsible: 'Dr Refus Test',
          status: 'Refusée',
          subscription: 'Basic',
          trialEndsAt: null,
          subscriptionEndsAt: null,
        },
      });

      const decisionPath = `/admin/pharmacies/${refusedPh.id}/status`;
      const approval = { method: 'PATCH', body: JSON.stringify({ status: 'Validée' }) };
      assert.equal((await api(decisionPath, approval, adminToken)).status, 409);
      const upload = new FormData();
      upload.append('files', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'agrement-test.pdf');
      const uploaded = await api(`/pharmacies/${refusedPh.id}/documents`, { method: 'POST', body: upload }, pharmaToken);
      assert.equal(uploaded.status, 201);
      assert.equal((await api(`/admin/documents/${uploaded.json[0].id}/download`, {}, pharmaToken)).status, 403);

      const reactivateRefused = await api(
        `/admin/pharmacies/${refusedPh.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'Validée' }),
        },
        adminToken,
      );
      assert.equal(reactivateRefused.status, 200);
      assert.equal(reactivateRefused.json.status, 'Validée');
      assert.ok(reactivateRefused.json.trialEndsAt);
      assert.ok(new Date(reactivateRefused.json.trialEndsAt).getTime() > Date.now());

      // 4. Un état obsolète ne peut pas effacer les produits des filiales
      const expiredBranch = await prisma.pharmacy.create({
        data: {
          ownerId: pharmaOwnerId,
          name: 'Filiale Expirée Test',
          city: 'N’Djamena',
          area: 'Chagoua',
          address: 'Av Mobutu',
          phone: '+235 66 98 76 54',
          email: `exp-branch-${Date.now()}@example.com`,
          license: `LIC-EXP-BRANCH-${Date.now()}`,
          responsible: 'Dr Expiré',
          status: 'Abonnement expiré',
          subscription: 'Basic',
          subscriptionEndsAt: new Date(Date.now() - 86_400_000),
        },
      });
      const preservedProduct = await prisma.product.create({
        data: {
          pharmacyId: expiredBranch.id,
          name: 'Produit Filiale Expirée',
          category: 'Médicaments',
          price: 1500,
          stock: 4,
          status: 'Brouillon',
        },
      });

      const stateBeforePut = await api('/state', {}, pharmaToken);
      assert.equal(stateBeforePut.status, 200);
      const putMultiRes = await api(
        '/state',
        {
          method: 'PUT',
          body: JSON.stringify({
            ...stateBeforePut.json,
            // Omet volontairement les produits de la filiale expirée dans la synchro
            products: stateBeforePut.json.products.filter((p: any) => p.pharmacyId === 1),
          }),
        },
        pharmaToken,
      );
      assert.equal(putMultiRes.status, 410);
      const stillExists = await prisma.product.findUnique({ where: { id: preservedProduct.id } });
      assert.ok(stillExists, 'Le produit d’une filiale expirée ne doit pas être supprimé par PUT /api/state');

      // 5. Répondre par la route métier marque le fil comme lu.
      const visitorMsg = await api('/messages', {
        method: 'POST',
        body: JSON.stringify({
          pharmacyId: 1,
          sender: 'Patient Fil',
          phone: '+23566112233',
          subject: 'Disponibilité sirop',
          body: 'Avez-vous ce produit ?',
        }),
      });
      assert.equal(visitorMsg.status, 201);
      const threadId = visitorMsg.json.id as number;

      const replyResult = await api(`/messages/${threadId}/reply`, {
        method: 'POST', body: JSON.stringify({ body: 'Oui, disponible en officine.' }),
      }, pharmaToken);
      assert.equal(replyResult.status, 201);
      const parentAfterReply = await prisma.message.findUniqueOrThrow({ where: { id: threadId } });
      assert.equal(parentAfterReply.read, true);

      // 6. Changement d'image sur produit Publié repasse en En attente
      const pubProd = await prisma.product.create({
        data: {
          pharmacyId: 1,
          name: 'Paracétamol Image Test',
          category: 'Médicaments',
          price: 800,
          stock: 10,
          status: 'Publié',
        },
      });
      const tinyPng = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
        'hex',
      );
      const imgForm = new FormData();
      imgForm.append('file', new Blob([tinyPng], { type: 'image/png' }), 'product.png');
      const imgRes = await api(`/products/${pubProd.id}/image`, { method: 'POST', body: imgForm }, pharmaToken);
      assert.equal(imgRes.status, 201);
      assert.equal(imgRes.json.status, 'En attente');
    } finally {
      await prisma.$disconnect();
    }
  });

  it('applique anti-rejeu webhook, complexité mot de passe, verrouillage du compte et bornes de configuration', async () => {
    const pharmaLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'contact@centrale.example',
        password: process.env.SEED_PHARMACY_PASSWORD || 'pharma2026',
        role: 'PHARMACIST',
      }),
    });
    assert.equal(pharmaLogin.status, 201);
    const pharmaToken = pharmaLogin.json.accessToken as string;

    // 1. Créer un paiement puis tester webhook sans timestamp / timestamp expiré / timestamp valide
    const payCreate = await api(
      '/pharmacies/1/payments',
      {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Standard',
          period: 'Mensuel',
          method: 'Mobile Money',
          provider: 'Airtel Money',
          payerPhone: '+23566001122',
        }),
      },
      pharmaToken,
    );
    assert.equal(payCreate.status, 201);
    const invoiceRef = payCreate.json.invoiceRef as string;
    const webhookBody = JSON.stringify({ invoiceRef, status: 'Confirmé', externalRef: 'TX-ANTI-REPLAY-1', amount: payCreate.json.amount, currency: 'XAF' });
    const secret = process.env.PAYMENT_WEBHOOK_SECRET as string;

    const noTs = await api('/payments/webhook', {
      method: 'POST',
      headers: { 'x-signature': createHmac('sha256', secret).update(webhookBody).digest('hex') },
      body: webhookBody,
    });
    assert.equal(noTs.status, 403);

    const oldTs = String(Math.floor(Date.now() / 1000) - 600);
    const expiredSig = createHmac('sha256', secret).update(`${oldTs}.${webhookBody}`).digest('hex');
    const expiredRes = await api('/payments/webhook', {
      method: 'POST',
      headers: { 'x-timestamp': oldTs, 'x-signature': expiredSig },
      body: webhookBody,
    });
    assert.equal(expiredRes.status, 403);

    const freshTs = String(Math.floor(Date.now() / 1000));
    const wrongAmount = JSON.stringify({ ...JSON.parse(webhookBody), amount: payCreate.json.amount + 1 });
    assert.equal((await api('/payments/webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': freshTs,
        'x-signature': createHmac('sha256', secret).update(`${freshTs}.${wrongAmount}`).digest('hex'),
      },
      body: wrongAmount,
    })).status, 409);
    const freshSig = createHmac('sha256', secret).update(`${freshTs}.${webhookBody}`).digest('hex');
    const okWebhook = await api('/payments/webhook', {
      method: 'POST',
      headers: { 'x-timestamp': freshTs, 'x-signature': freshSig },
      body: webhookBody,
    });
    assert.equal(okWebhook.status, 201);
    assert.equal(okWebhook.json.status, 'Confirmé');

    // 2. Politique de complexité de mot de passe
    const weakReg = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Faible', email: `weak-${Date.now()}@test.local`, password: 'weakpassword1' }),
    });
    assert.equal(weakReg.status, 400);

    // 3. Verrouillage par compte après 5 échecs consécutifs (indépendant du rate-limit IP)
    const { AuthService } = await import('../src/auth/auth.module');
    const authSvc = app.get(AuthService);
    const lockEmail = `lock-${Date.now()}@test.local`;
    const regOk = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Lock', email: lockEmail, password: 'ValidPass123!' }),
    });
    assert.equal(regOk.status, 201);
    for (let i = 0; i < 5; i += 1) {
      await assert.rejects(
        () => authSvc.login({ email: lockEmail, password: 'WrongPassword999' }),
        (err: any) => err?.getStatus?.() === 401,
      );
    }
    await assert.rejects(
      () => authSvc.login({ email: lockEmail, password: 'ValidPass123!' }),
      (err: any) => err?.getStatus?.() === 429 && String(err?.message).includes('15 minutes'),
    );

    // 4. Seuil de fraîcheur validé sur la route d’administration.
    const admin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, role: 'ADMIN' }),
    });
    const badSettings = await api('/admin/settings', {
      method: 'PATCH', body: JSON.stringify({ freshnessDays: -5 }),
    }, admin.json.accessToken);
    assert.equal(badSettings.status, 400);
  });

  it('redéfinit la gouvernance administrateur (utilisateurs, Rubrique Santé, paramètres, motif agrément)', async () => {
    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: process.env.SEED_ADMIN_EMAIL || 'admin@pharmaconnect.org',
        password: process.env.SEED_ADMIN_PASSWORD || 'admin2026',
        role: 'ADMIN',
      }),
    });
    assert.equal(adminLogin.status, 201);
    const adminToken = adminLogin.json.accessToken as string;
    const adminId = adminLogin.json.user.id as number;

    // Création d'un compte patient puis suspension / réactivation par l'administrateur
    const userEmail = `gov-${Date.now()}@test.local`;
    const regUser = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Citoyen Test', email: userEmail, password: 'ValidPass123!' }),
    });
    assert.equal(regUser.status, 201);
    const userToken = regUser.json.accessToken as string;
    const userId = regUser.json.user.id as number;

    const usersList = await api('/admin/users', {}, adminToken);
    assert.equal(usersList.status, 200);
    assert.ok(usersList.json.some((u: any) => u.id === userId && !('passwordHash' in u)));

    // Auto-suspension interdite
    const selfSuspend = await api(
      `/admin/users/${adminId}/status`,
      { method: 'PATCH', body: JSON.stringify({ active: false }) },
      adminToken,
    );
    assert.equal(selfSuspend.status, 403);

    // Suspension d'un compte visiteur -> JWT révoqué immédiatement
    const suspendUser = await api(
      `/admin/users/${userId}/status`,
      { method: 'PATCH', body: JSON.stringify({ active: false, reason: 'Compte doublon' }) },
      adminToken,
    );
    assert.equal(suspendUser.status, 200);
    assert.equal(suspendUser.json.active, false);

    const revokedMe = await api('/auth/me', {}, userToken);
    assert.equal(revokedMe.status, 401);

    const reactivateUser = await api(
      `/admin/users/${userId}/status`,
      { method: 'PATCH', body: JSON.stringify({ active: true }) },
      adminToken,
    );
    assert.equal(reactivateUser.status, 200);
    assert.equal(reactivateUser.json.active, true);

    // Pilotage éditorial Rubrique Santé (Admin -> Public)
    const savedHealth = await api(
      '/admin/health-section',
      {
        method: 'PUT',
        body: JSON.stringify({
          alerts: [{ id: 'a-test', titleFr: 'Alerte Test', active: true, severity: 'urgent' }],
          news: [{ id: 'n-test', titleFr: 'Actu Test', active: true }],
          emergencyNumbers: [{ id: 'e-test', number: '1313', active: true }],
        }),
      },
      adminToken,
    );
    assert.equal(savedHealth.status, 200);

    const publicHealth = await api('/public/health-section');
    assert.equal(publicHealth.status, 200);
    assert.equal(publicHealth.json.alerts[0].titleFr, 'Alerte Test');
    assert.equal(publicHealth.json.emergencyNumbers[0].number, '1313');

    // Paramètres étendus (fraîcheur + annonce plateforme)
    const patchSettings = await api(
      '/admin/settings',
      { method: 'PATCH', body: JSON.stringify({ freshnessDays: 10, platformBanner: 'Veille sanitaire active' }) },
      adminToken,
    );
    assert.equal(patchSettings.status, 200);
    assert.equal(patchSettings.json.freshnessDays, 10);
    assert.equal(patchSettings.json.platformBanner, 'Veille sanitaire active');

    const metaRes = await api('/public/meta');
    assert.equal(metaRes.status, 200);
    assert.equal(metaRes.json.platformBanner, 'Veille sanitaire active');

    // Dashboard enrichi + filtre audit logs
    const dash = await api('/admin/dashboard', {}, adminToken);
    assert.equal(dash.status, 200);
    assert.ok(typeof dash.json.confirmedRevenue === 'number');
    assert.ok(typeof dash.json.usersCount === 'number');

    const filteredLogs = await api('/admin/audit-logs?actor=Administration&q=Rubrique', {}, adminToken);
    assert.equal(filteredLogs.status, 200);
    assert.ok(filteredLogs.json.some((l: any) => String(l.action).includes('Rubrique Santé')));
  });
  it('aligne le catalogue, la modération, le prix et le stock sur les routes dédiées', async () => {
    const admin = await api('/auth/login', {
      method: 'POST', body: JSON.stringify({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD }),
    });
    const pharmacist = await api('/auth/login', {
      method: 'POST', body: JSON.stringify({ email: 'contact@centrale.example', password: process.env.SEED_PHARMACY_PASSWORD }),
    });
    const adminToken = admin.json.accessToken;
    const token = pharmacist.json.accessToken;
    assert.ok(adminToken && token);
    cataloguePharmacistToken = token;

    const created = await api('/pharmacies/1/products', {
      method: 'POST', body: JSON.stringify({ name: 'Produit cycle métier', category: 'Vitamines', price: 200, stock: 2 }),
    }, token);
    assert.equal(created.status, 201);
    const id = created.json.id;
    assert.equal(created.json.status, 'En attente');
    const publicCatalog = () => api('/public/products?q=Produit%20cycle%20m%C3%A9tier');
    assert.equal((await publicCatalog()).json.total, 0);

    const review = (status: string, note?: string, expectedModifiedAt = created.json.modifiedAt) => api(`/admin/products/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status, note, expectedModifiedAt }),
    }, adminToken);
    assert.equal((await review('Publié', 'Note interne')).status, 200);
    assert.equal((await publicCatalog()).json.items[0].note, undefined);

    const stockChange = await api(`/products/${id}/stock`, {
      method: 'PATCH', body: JSON.stringify({ price: 200, stock: 0 }),
    }, token);
    assert.equal(stockChange.status, 200);
    assert.equal(stockChange.json.stockHistory.length, 2);
    assert.equal((await publicCatalog()).json.items[0].available, false);

    const profileEdit = await api(`/products/${id}`, {
      method: 'PATCH', body: JSON.stringify({ description: 'Version revue de la fiche' }),
    }, token);
    assert.equal(profileEdit.json.status, 'En attente');
    assert.equal((await publicCatalog()).json.total, 0);
    assert.equal((await review('Publié')).status, 409);
    assert.equal((await review('À corriger', '   ')).status, 400);
    assert.equal((await api(`/products/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'Publié', expectedModifiedAt: profileEdit.json.modifiedAt }),
    }, token)).status, 403);
    assert.equal((await review('Publié', undefined, profileEdit.json.modifiedAt)).status, 200);
    assert.equal((await review('Suspendu')).status, 200);
    const forbiddenStock = await api(`/products/${id}/stock`, {
      method: 'PATCH', body: JSON.stringify({ price: 300, stock: 10 }),
    }, token);
    assert.equal(forbiddenStock.status, 403);
    assert.equal((await api(`/products/${id}`, { method: 'DELETE' }, token)).status, 403);
    assert.equal((await api(`/products/${id}`, { method: 'DELETE' }, adminToken)).status, 200);
  });

  it('réserve la messagerie privée au compte qui a créé le fil', async () => {
    const recipient = `invité-${Date.now()}@example.com`.replace('é','e');
    const msg = await api('/messages', {
      method: 'POST',
      body: JSON.stringify({ pharmacyId: 1, phone: '+23566112233', visitorEmail: recipient, body: 'Contenu confidentiel' }),
    });
    assert.equal(msg.status, 201);
    const reg = await api('/auth/register', {
      method: 'POST', body: JSON.stringify({ name: 'Visiteur', email: recipient, password: 'Password123!' }),
    });
    assert.equal(reg.status, 201);
    const token = reg.json.accessToken;
    assert.deepEqual((await api('/state', {}, token)).json.messages, []);
    assert.deepEqual((await api('/messages/visitor', {}, token)).json, []);
    const owned = await api('/messages', {
      method: 'POST',
      body: JSON.stringify({ pharmacyId: 1, phone: '+23566112233', body: 'Fil du compte connecté' }),
    }, token);
    assert.equal(owned.status, 201);
    assert.deepEqual((await api('/state', {}, token)).json.messages.map((m: { id: number }) => m.id), [owned.json.id]);
  });

  it('déduplique une demande Mobile Money réessayée', async () => {
    const dto = {
      requestId: 'ac762a7a-39c1-437d-a4f3-2033eb5b6297', plan: 'Basic', period: 'Mensuel',
      provider: 'Airtel Money', payerPhone: '+23566112233',
    };
    const pay = (body = dto) => api('/pharmacies/1/payments', {
      method: 'POST', body: JSON.stringify(body),
    }, cataloguePharmacistToken);
    const first = await pay();
    const second = await pay();
    assert.equal(first.status, 201);
    assert.equal(first.json.dispatch, 'manual');
    assert.equal(second.status, 201);
    assert.equal(first.json.id, second.json.id);
    assert.equal((await pay({ ...dto, plan: 'Standard' })).status, 409);
  });

  it('isole les données professionnelles et les images non publiées entre deux officines', async () => {
    const { JwtService } = await import('@nestjs/jwt');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const jwt = app.get(JwtService);
    const prisma = app.get(PrismaService);
    const [firstOwner, secondOwner, admin] = await Promise.all(
      [100, 200, 1].map(id => prisma.user.findUniqueOrThrow({ where: { id } })),
    );
    const issue = (user: typeof firstOwner) => jwt.sign({ sub: user.id, tv: user.tokenVersion });
    const firstToken = issue(firstOwner);
    const secondToken = issue(secondOwner);
    const adminToken = issue(admin);
    const firstId = 1;
    const secondId = 2;

    const profile = await api(`/pharmacies/${secondId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        openingHours: 'Du lundi au samedi', openingHoursJson: { internalNote: 'Planning interne' },
        metadata: { internalCode: 'Interne B' },
      }),
    }, secondToken);
    assert.equal(profile.status, 200);
    assert.equal(profile.json.openingHoursJson.internalNote, 'Planning interne');

    const product = await api(`/pharmacies/${secondId}/products`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Produit privé officine B', category: 'Vitamines', price: 500, stock: 4, draft: true }),
    }, secondToken);
    assert.equal(product.status, 201);
    const productId = product.json.id;
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/X1sAAAAASUVORK5CYII=', 'base64');
    const uploadImage = () => {
      const form = new FormData();
      form.append('file', new Blob([png], { type: 'image/png' }), 'produit.png');
      return form;
    };
    const image = await api(`/products/${productId}/image`, { method: 'POST', body: uploadImage() }, secondToken);
    assert.equal(image.status, 201);
    const imagePath = image.json.imageDataUrl as string;
    assert.equal((await api(imagePath)).status, 404);
    assert.equal((await api(imagePath, {}, firstToken)).status, 404);
    assert.equal((await api(imagePath, {}, adminToken)).status, 200);
    const ownerImage = await api(imagePath, {}, secondToken);
    assert.equal(ownerImage.status, 200);
    assert.equal(ownerImage.headers.get('cache-control'), 'private, no-store');
    assert.equal(ownerImage.headers.get('content-type'), 'image/png');

    const docs = new FormData();
    docs.append('files', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'licence-officine-b.pdf');
    const uploaded = await api(`/pharmacies/${secondId}/documents`, { method: 'POST', body: docs }, secondToken);
    assert.equal(uploaded.status, 201);
    assert.equal((await api(`/pharmacies/${secondId}/documents`, {}, secondToken)).json[0].fileName, 'licence-officine-b.pdf');
    const dbNotice = await prisma.notice.create({
      data: { pharmacyId: secondId, title: 'Notification privée B', body: 'Réservée à B' },
    });
    const dbMessage = await prisma.message.create({
      data: { pharmacyId: secondId, sender: 'Visiteur test', phone: '+23566112233', subject: 'Fil privé B', body: 'Réservé à B', direction: 'visitor' },
    });
    const payment = await api(`/pharmacies/${secondId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ plan: 'Basic', period: 'Mensuel', provider: 'Moov Money', payerPhone: '+23566112233' }),
    }, secondToken);
    assert.equal(payment.status, 201);
    const category = await api(`/pharmacies/${secondId}/categories`, {
      method: 'POST', body: JSON.stringify({ name: 'Catégorie privée B' }),
    }, secondToken);
    assert.equal(category.status, 201);

    const own = await api('/state', {}, secondToken);
    assert.deepEqual(own.json.pharmacies.map((row: { id: number }) => row.id), [secondId]);
    assert.equal(own.json.products.find((row: { id: number }) => row.id === productId).stockHistory.length, 1);
    assert.ok(own.json.payments.some((row: { id: number }) => row.id === payment.json.id));
    assert.ok(own.json.messages.some((row: { id: number }) => row.id === dbMessage.id));
    assert.ok(own.json.notices.some((row: { id: number }) => row.id === dbNotice.id));
    assert.deepEqual(own.json.customCategories[secondId], ['Catégorie privée B']);

    const isolated = await api('/state', {}, firstToken);
    assert.equal(isolated.headers.get('cache-control'), 'private, no-store');
    assert.ok(isolated.json.pharmacies.some((row: { id: number }) => row.id === firstId));
    assert.ok(isolated.json.pharmacies.every((row: { ownerId: number }) => row.ownerId === firstOwner.id));
    for (const key of ['products', 'messages', 'notices', 'payments']) {
      assert.ok(isolated.json[key].every((row: { pharmacyId: number }) => row.pharmacyId !== secondId), key);
    }
    assert.equal(isolated.json.preferences[secondId], undefined);
    assert.equal(isolated.json.customCategories[secondId], undefined);
    assert.deepEqual((await api('/pharmacies/mine', {}, firstToken)).json.map((row: { id: number }) => row.id).sort(),
      isolated.json.pharmacies.map((row: { id: number }) => row.id).sort());

    for (const suffix of ['', '/products', '/documents', '/messages', '/payments', '/preferences', '/notices', '/categories', '/stats']) {
      assert.equal((await api(`/pharmacies/${secondId}${suffix}`, {}, firstToken)).status, 404, suffix);
    }
    const unknown = await api('/pharmacies/2147483647', {}, firstToken);
    const outsideScope = await api(`/pharmacies/${secondId}`, {}, firstToken);
    assert.deepEqual(unknown.json, outsideScope.json);
    const writes: [string, RequestInit][] = [
      [`/pharmacies/${secondId}`, { method: 'PATCH', body: JSON.stringify({ name: 'Autre officine' }) }],
      [`/pharmacies/${secondId}/cover`, { method: 'POST', body: uploadImage() }],
      [`/pharmacies/${secondId}/documents`, { method: 'POST', body: docs }],
      [`/pharmacies/${secondId}/products`, { method: 'POST', body: JSON.stringify({ name: 'Produit test', category: 'Vitamines', price: 100, stock: 1 }) }],
      [`/pharmacies/${secondId}/payments`, { method: 'POST', body: JSON.stringify({ plan: 'Basic', period: 'Mensuel', provider: 'Moov Money', payerPhone: '+23566112233' }) }],
      [`/pharmacies/${secondId}/categories`, { method: 'POST', body: JSON.stringify({ name: 'Catégorie test' }) }],
      [`/products/${productId}`, { method: 'PATCH', body: JSON.stringify({ name: 'Modification test' }) }],
      [`/products/${productId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Archivé' }) }],
      [`/pharmacies/${secondId}/preferences`, { method: 'PATCH', body: JSON.stringify({ lowStockAlerts: true }) }],
      [`/pharmacies/${secondId}/categories/Catégorie%20privée%20B`, { method: 'DELETE' }],
      [`/pharmacies/${secondId}/notices/read-all`, { method: 'POST' }],
      [`/notices/${dbNotice.id}/read`, { method: 'PATCH' }],
      [`/products/${productId}/stock`, { method: 'PATCH', body: JSON.stringify({ price: 800, stock: 1 }) }],
      [`/products/${productId}/image`, { method: 'POST', body: uploadImage() }],
      [`/products/${productId}`, { method: 'DELETE' }],
      [`/messages/${dbMessage.id}/read`, { method: 'PATCH' }],
      [`/messages/${dbMessage.id}/reply`, { method: 'POST', body: JSON.stringify({ body: 'Réponse' }) }],
    ];
    for (const [path, request] of writes) {
      assert.equal((await api(path, request, firstToken)).status, 404, path);
    }
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: productId } })).stock, 4);
    assert.equal((await prisma.notice.findUniqueOrThrow({ where: { id: dbNotice.id } })).read, false);
    assert.equal((await prisma.message.findUniqueOrThrow({ where: { id: dbMessage.id } })).read, false);
    assert.equal((await api(`/admin/documents/${uploaded.json[0].id}/download`, {}, firstToken)).status, 403);

    const reuse = await api(`/pharmacies/${firstId}/products`, {
      method: 'POST', body: JSON.stringify({ name: 'Image externe', category: 'Vitamines', price: 100, stock: 1, imageDataUrl: imagePath }),
    }, firstToken);
    assert.equal(reuse.status, 400);
    assert.equal((await api(imagePath, {}, secondToken)).status, 200);

    const publish = (expectedModifiedAt: string) => api(`/admin/products/${productId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'Publié', expectedModifiedAt }),
    }, adminToken);
    assert.equal((await publish(image.json.modifiedAt)).status, 409);
    assert.equal((await api(`/products/${productId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'Masqué' }),
    }, secondToken)).status, 409);
    const submitted = await api(`/products/${productId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'En attente' }),
    }, secondToken);
    assert.equal(submitted.status, 200);
    assert.equal((await publish(submitted.json.modifiedAt)).status, 200);
    const publicState = await api('/state');
    const publicRow = publicState.json.pharmacies.find((row: { id: number }) => row.id === secondId);
    assert.ok(publicRow);
    for (const key of ['ownerId', 'documents', 'subscription', 'subscriptionEndsAt', 'trialEndsAt', 'activeUntil']) {
      assert.equal(publicRow[key], undefined, key);
    }
    assert.equal(publicRow.license, '');
    const publicProduct = publicState.json.products.find((row: { id: number }) => row.id === productId);
    assert.ok(publicProduct);
    assert.equal(publicProduct.stockHistory, undefined);
    assert.deepEqual(publicState.json.messages, []);
    const publicProfile = (await api(`/public/pharmacies/${secondId}`)).json;
    assert.equal(publicProfile.subscription, undefined);
    assert.equal(publicProfile.openingHoursJson, undefined);
    assert.equal(publicProfile.metadata, undefined);
    assert.equal(publicProfile.openingHours, 'Du lundi au samedi');
    assert.equal((await api(imagePath)).status, 200);

    assert.equal((await api(`/products/${productId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'Masqué' }),
    }, secondToken)).status, 200);
    assert.equal((await api(imagePath)).status, 404);
    assert.equal((await api(imagePath, {}, firstToken)).status, 404);
    assert.equal((await api(imagePath, {}, secondToken)).status, 200);
  });

  it('refuse les sessions expirées ou révoquées et vérifie le rôle actuel en base', async () => {
    const { JwtService } = await import('@nestjs/jwt');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);
    const [owner, admin] = await Promise.all([200, 1].map(id => prisma.user.findUniqueOrThrow({ where: { id } })));
    const session = jwt.sign({ sub: owner.id, tv: owner.tokenVersion, role: 'ADMIN' });
    const expired = jwt.sign({ sub: owner.id, tv: owner.tokenVersion }, { expiresIn: -60 });
    const adminSession = jwt.sign({ sub: admin.id, tv: admin.tokenVersion });

    assert.equal((await api('/admin/dashboard', {}, session)).status, 403);
    const ownerState = await api('/state', {}, session);
    assert.equal(ownerState.status, 200);
    assert.deepEqual(ownerState.json.pharmacies.map((row: { id: number }) => row.id), [2]);

    assert.equal((await api('/state', {}, expired)).status, 401);
    assert.equal((await api('/state', {}, 'session-invalide')).status, 401);
    assert.equal((await api('/pharmacies/2/documents', {}, expired)).status, 401);
    const anonymous = await api('/state');
    assert.equal(anonymous.status, 200);
    assert.deepEqual(anonymous.json.payments, []);

    const setActive = (active: boolean) => api(`/admin/users/${owner.id}/status`, {
      method: 'PATCH', body: JSON.stringify({ active }),
    }, adminSession);
    assert.equal((await setActive(false)).status, 200);
    try {
      assert.equal((await api('/state', {}, session)).status, 401);
      assert.equal((await api('/pharmacies/2/messages', {}, session)).status, 401);
    } finally {
      assert.equal((await setActive(true)).status, 200);
    }
    assert.equal((await api('/state', {}, session)).status, 401);
    const current = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
    assert.equal((await api('/pharmacies/2/messages', {}, jwt.sign({ sub: current.id, tv: current.tokenVersion }))).status, 200);
  });

  it('exige le mot de passe avant la première association Google à une officine existante', async context => {
    const { AuthService } = await import('../src/auth/auth.module');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const auth = app.get(AuthService);
    const prisma = app.get(PrismaService);
    const user = await prisma.user.create({
      data: {
        name: 'Titulaire Test Google', email: 'titulaire-google@example.com', role: 'PHARMACIST',
        passwordHash: await AuthService.hash('Titulaire2026!'),
      },
    });
    const identities: Record<string, { sub: string | undefined; email: string; email_verified: boolean }> = {
      original: { sub: 'identity-fixture-a', email: user.email, email_verified: true },
      differentIdentity: { sub: 'identity-fixture-b', email: user.email, email_verified: true },
      changedEmail: { sub: 'identity-fixture-a', email: 'nouvelle-adresse@example.com', email_verified: true },
      missingSubject: { sub: undefined, email: user.email, email_verified: true },
    };
    const verifier = (auth as unknown as { googleClient: { verifyIdToken: Function } }).googleClient;
    context.mock.method(verifier, 'verifyIdToken', async ({ idToken }: { idToken: string }) => ({
      getPayload: () => identities[idToken],
    }));

    const previousClient = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = 'pharmaconnect-fixture.apps.googleusercontent.com';
    try {
      const google = (idToken: string, currentPassword?: string, role = 'PHARMACIST') => api('/auth/google', {
        method: 'POST', body: JSON.stringify({ idToken, role, currentPassword }),
      });
      assert.equal((await google('missingSubject')).status, 401);
      assert.equal((await google('original')).status, 409);
      assert.equal((await google('original', 'MotDePasseIncorrect2026')).status, 401);
      assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).googleSub, null);

      const linked = await google('original', 'Titulaire2026!');
      assert.equal(linked.status, 201);
      assert.equal(linked.json.user.id, user.id);
      const returning = await google('changedEmail');
      assert.equal(returning.status, 201);
      assert.equal(returning.json.user.id, user.id);
      assert.equal((await google('differentIdentity', 'Titulaire2026!')).status, 403);
      assert.equal((await google('original', undefined, 'VISITOR')).status, 403);
      assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).googleSub, 'identity-fixture-a');
    } finally {
      if (previousClient === undefined) delete process.env.GOOGLE_CLIENT_ID;
      else process.env.GOOGLE_CLIENT_ID = previousClient;
    }
  });

  it('écarte des dossiers de messagerie les réponses rattachées à une autre officine', async () => {
    const { JwtService } = await import('@nestjs/jwt');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);
    const visitor = await prisma.user.create({
      data: { email: 'visitor-legacy@example.com', name: 'Visiteur Test', role: 'VISITOR', provider: 'google', googleSub: 'visitor-fixture' },
    });
    const pharmacyB = await prisma.user.findUniqueOrThrow({ where: { id: 200 } });
    const visitorSession = jwt.sign({ sub: visitor.id, tv: visitor.tokenVersion });
    const pharmacySession = jwt.sign({ sub: pharmacyB.id, tv: pharmacyB.tokenVersion });
    const attributes = { sender: 'Test', phone: '+23566112233', subject: 'Conversation témoin', body: 'Message de test' };
    const [root, guest] = await Promise.all([
      prisma.message.create({ data: { ...attributes, pharmacyId: 1, visitorId: visitor.id, direction: 'visitor' } }),
      prisma.message.create({ data: { ...attributes, pharmacyId: 1, visitorEmail: visitor.email, direction: 'visitor' } }),
    ]);
    const [validReply, mismatchedReply] = await Promise.all([
      prisma.message.create({ data: { ...attributes, pharmacyId: 1, threadId: root.id, direction: 'pharmacy' } }),
      prisma.message.create({ data: { ...attributes, pharmacyId: 2, threadId: root.id, direction: 'pharmacy' } }),
    ]);

    const threads = await api('/messages/visitor', {}, visitorSession);
    assert.equal(threads.status, 200);
    assert.deepEqual(threads.json.map((thread: { id: number }) => thread.id), [root.id]);
    assert.deepEqual(threads.json[0].replies.map((reply: { id: number }) => reply.id), [validReply.id]);
    const aggregate = await api('/state', {}, visitorSession);
    assert.deepEqual(aggregate.json.messages.map((message: { id: number }) => message.id), [root.id, validReply.id]);

    const pharmacyThreads = await api('/pharmacies/2/messages', {}, pharmacySession);
    assert.equal(pharmacyThreads.status, 200);
    assert.ok(pharmacyThreads.json.every((message: { id: number }) => message.id !== mismatchedReply.id));
    const pharmacyState = await api('/state', {}, pharmacySession);
    assert.ok(pharmacyState.json.messages.every((message: { id: number }) => message.id !== mismatchedReply.id));
    const response = { method: 'POST', body: JSON.stringify({ body: 'Réponse du titulaire' }) };
    assert.equal((await api(`/messages/${mismatchedReply.id}/visitor-reply`, response, visitorSession)).status, 404);
    assert.equal((await api(`/messages/${guest.id}/visitor-reply`, response, visitorSession)).status, 404);
    assert.equal((await api(`/messages/${mismatchedReply.id}/reply`, response, pharmacySession)).status, 404);
    assert.equal((await api(`/messages/${mismatchedReply.id}/read`, { method: 'PATCH' }, pharmacySession)).status, 404);
    assert.equal((await api(`/messages/${validReply.id}/visitor-reply`, response, visitorSession)).status, 201);
  });

  it('exige la première validation, conserve un seul essai et retire les officines à échéance', async () => {
    const { JwtService } = await import('@nestjs/jwt');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const { AdminService } = await import('../src/admin/admin.module');
    const prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);
    const [owner, admin] = await Promise.all([100, 1].map(id => prisma.user.findUniqueOrThrow({ where: { id } })));
    const ownerToken = jwt.sign({ sub: owner.id, tv: owner.tokenVersion });
    const adminToken = jwt.sign({ sub: admin.id, tv: admin.tokenVersion });
    const pharmacy = await prisma.pharmacy.create({
      data: { ownerId: owner.id, name: 'Officine cycle abonnement', city: 'Ville Test', phone: '+23566112233', email: 'cycle@example.com', license: 'TEST-CYCLE-01' },
    });
    const id = pharmacy.id;
    const decision = (status: string) => api(`/admin/pharmacies/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }, adminToken);
    const order = () => api(`/pharmacies/${id}/payments`, {
      method: 'POST', body: JSON.stringify({ plan: 'Standard', period: 'Trimestriel', provider: 'Moov Money', payerPhone: '+23566112233' }),
    }, ownerToken);

    assert.equal((await decision('Abonnement expiré')).status, 409);
    assert.equal((await order()).status, 403);
    // Ancienne ligne importée, sans preuve de validation initiale.
    await prisma.pharmacy.update({ where: { id }, data: { status: 'Abonnement expiré' } });
    assert.equal((await order()).status, 403);
    assert.equal((await decision('Validée')).status, 409);

    const documents = new FormData();
    documents.append('files', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'autorisation.pdf');
    assert.equal((await api(`/pharmacies/${id}/documents`, { method: 'POST', body: documents }, ownerToken)).status, 201);
    assert.equal((await api(`/public/pharmacies/${id}`)).status, 404);

    const beforeValidation = Date.now();
    const verified = await decision('Validée');
    assert.equal(verified.status, 200);
    const trialEnd = Date.parse(verified.json.trialEndsAt);
    const trialLength = 14 * 86_400_000;
    assert.ok(trialEnd >= beforeValidation + trialLength && trialEnd <= Date.now() + trialLength);
    const badge = await prisma.badge.findUniqueOrThrow({ where: { key: 'verified' } });
    assert.ok(verified.json.badgeIds.includes(badge.id));
    assert.equal((await api(`/public/pharmacies/${id}`)).status, 200);
    assert.equal((await decision('Abonnement expiré')).status, 409);
    assert.equal((await decision('Suspendue')).status, 200);
    assert.equal((await api(`/public/pharmacies/${id}`)).status, 404);
    assert.equal((await order()).status, 403);
    assert.equal((await decision('Validée')).json.trialEndsAt, verified.json.trialEndsAt);

    const elapsed = new Date(Date.now() - 60_000);
    await prisma.pharmacy.update({ where: { id }, data: { trialEndsAt: elapsed } });
    assert.equal((await api(`/public/pharmacies/${id}`)).status, 404);
    await app.get(AdminService).expireOverduePharmacies();
    assert.equal((await prisma.pharmacy.findUniqueOrThrow({ where: { id } })).status, 'Abonnement expiré');
    const invoice = await order();
    assert.equal(invoice.status, 201);
    const payment = (externalRef?: string) => api(`/admin/payments/${invoice.json.id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'Confirmé', externalRef }),
    }, adminToken);
    assert.equal((await payment()).status, 400);
    assert.equal((await payment(invoice.json.invoiceRef)).status, 400);
    const confirmed = await payment('TEST-RECU-TRIMESTRIEL-01');
    assert.equal(confirmed.status, 200);
    const active = await prisma.pharmacy.findUniqueOrThrow({ where: { id } });
    assert.equal(active.status, 'Validée');
    assert.equal(active.subscription, 'Standard');
    assert.equal(active.trialEndsAt, null);
    const receipt = await prisma.payment.findUniqueOrThrow({ where: { id: invoice.json.id } });
    assert.ok(receipt.processedAt && active.subscriptionEndsAt);
    const expected = new Date(receipt.processedAt);
    const day = expected.getUTCDate();
    expected.setUTCDate(1);
    expected.setUTCMonth(expected.getUTCMonth() + 3);
    const endOfMonth = new Date(Date.UTC(expected.getUTCFullYear(), expected.getUTCMonth() + 1, 0)).getUTCDate();
    expected.setUTCDate(Math.min(day, endOfMonth));
    assert.ok(Math.abs(active.subscriptionEndsAt.getTime() - expected.getTime()) < 1000);
    assert.equal((await payment('TEST-RECU-DIFFERENT')).status, 409);
    assert.equal((await api(`/public/pharmacies/${id}`)).status, 200);
  });

  it('applique le quota à la demande de formule, au règlement et à la réouverture d’une archive', async () => {
    const { JwtService } = await import('@nestjs/jwt');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);
    const [owner, admin] = await Promise.all([100, 1].map(id => prisma.user.findUniqueOrThrow({ where: { id } })));
    const token = jwt.sign({ sub: owner.id, tv: owner.tokenVersion });
    const adminToken = jwt.sign({ sub: admin.id, tv: admin.tokenVersion });
    const pharmacy = await prisma.pharmacy.create({
      data: {
        ownerId: owner.id, name: 'Officine quotas', city: 'Ville Test', phone: '+23566112233', email: 'quotas@example.com',
        license: 'TEST-QUOTA-01', status: 'Validée', subscription: 'Premium', subscriptionEndsAt: new Date(Date.now() + 86_400_000),
      },
    });
    const product = { pharmacyId: pharmacy.id, category: 'Vitamines', price: 100, stock: 1, status: 'Brouillon' };
    await prisma.product.createMany({ data: Array.from({ length: 50 }, (_, index) => ({ ...product, name: `Témoin quota ${index}` })) });
    const extra = await prisma.product.create({ data: { ...product, name: 'Témoin quota supplémentaire' } });
    const status = (id: number, value: string, auth = token) => api(`/products/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: value }),
    }, auth);
    const order = () => api(`/pharmacies/${pharmacy.id}/payments`, {
      method: 'POST', body: JSON.stringify({ plan: 'Basic', period: 'Annuel', provider: 'Moov Money', payerPhone: '+23566112233' }),
    }, token);
    assert.equal((await order()).status, 409);
    assert.equal((await status(extra.id, 'Archivé')).status, 200);
    const invoice = await order();
    assert.equal(invoice.status, 201);
    assert.equal((await status(extra.id, 'Brouillon')).status, 200);
    const confirm = (id: number, ref: string) => api(`/admin/payments/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'Confirmé', externalRef: ref }),
    }, adminToken);
    assert.equal((await confirm(invoice.json.id, 'TEST-RECU-ANNUEL-01')).status, 409);
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: invoice.json.id } })).status, 'En attente');
    assert.equal((await status(extra.id, 'Archivé')).status, 200);
    assert.equal((await confirm(invoice.json.id, 'TEST-RECU-ANNUEL-01')).status, 200);
    assert.equal((await prisma.pharmacy.findUniqueOrThrow({ where: { id: pharmacy.id } })).subscription, 'Basic');
    assert.equal((await status(extra.id, 'Brouillon')).status, 403);
    assert.equal((await status(extra.id, 'En attente', adminToken)).status, 403);

    const nextInvoice = await order();
    assert.equal(nextInvoice.status, 201);
    assert.equal((await confirm(nextInvoice.json.id, 'TEST-RECU-ANNUEL-01')).status, 409);
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: nextInvoice.json.id } })).status, 'En attente');

    await prisma.pharmacy.update({
      where: { id: pharmacy.id }, data: { status: 'Abonnement expiré', subscriptionEndsAt: new Date(Date.now() - 60_000) },
    });
    const activeProduct = await prisma.product.findFirstOrThrow({ where: { pharmacyId: pharmacy.id, status: 'Brouillon' } });
    assert.equal((await status(activeProduct.id, 'Archivé')).status, 200);
    assert.equal((await status(activeProduct.id, 'Brouillon')).status, 403);
  });

  it('exclut les déclarations hors période et protège les catégories et la vérification', async () => {
    const { JwtService } = await import('@nestjs/jwt');
    const { PrismaService } = await import('../src/prisma/prisma.service');
    const prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);
    const admin = await prisma.user.findUniqueOrThrow({ where: { id: 1 } });
    const token = jwt.sign({ sub: admin.id, tv: admin.tokenVersion });
    const threshold = Number((await api('/public/meta')).json.freshnessDays);
    const product = { pharmacyId: 1, category: 'Vitamines', price: 100, stock: 1, status: 'Publié' };
    await prisma.product.createMany({
      data: [
        { ...product, name: 'Fraîcheur témoin archive', stockUpdatedAt: new Date(Date.now() - (threshold + 1) * 86_400_000) },
        { ...product, name: 'Fraîcheur témoin future', stockUpdatedAt: new Date(Date.now() + 86_400_000) },
        { ...product, name: 'Fraîcheur témoin actuelle', stock: 0, stockUpdatedAt: new Date() },
      ],
    });
    const catalog = await api('/public/products?q=Fra%C3%AEcheur%20t%C3%A9moin');
    assert.equal(catalog.json.total, 1);
    assert.equal(catalog.json.items[0].available, false);
    assert.equal(catalog.json.items[0].name, 'Fraîcheur témoin actuelle');

    assert.equal((await api('/admin/categories/Vitamines', { method: 'DELETE' }, token)).status, 409);
    assert.equal((await api('/admin/categories', {
      method: 'POST', body: JSON.stringify({ name: '  vitamines  ' }),
    }, token)).status, 409);
    assert.equal((await api('/admin/categories', {
      method: 'POST', body: JSON.stringify({ name: '   ' }),
    }, token)).status, 400);

    const badge = await prisma.badge.findUniqueOrThrow({ where: { key: 'verified' } });
    assert.equal((await api('/admin/badges', {
      method: 'POST', body: JSON.stringify({ name: 'Pharmacie verifiee' }),
    }, token)).status, 409);
    assert.equal((await api(`/admin/badges/${badge.id}`, {
      method: 'PATCH', body: JSON.stringify({ name: 'Autre nom' }),
    }, token)).status, 403);
    assert.equal((await api(`/admin/badges/${badge.id}`, { method: 'DELETE' }, token)).status, 403);
  });

});
