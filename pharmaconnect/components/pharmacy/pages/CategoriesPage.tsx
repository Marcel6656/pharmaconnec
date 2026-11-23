'use client';

import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AppData, Empty, Metric, Modal, SectionTitle } from '@/lib/shared';
import { ActionMenu } from '@/components/shared/ActionMenu';
import {
  ModernAlertWarningIcon,
  ModernPackageBoxIcon,
  ModernSearchMedicineIcon,
  ModernTagCategoryIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

interface CategoriesPageProps {
  data: AppData;
  pharmacyId: number;
  canOperatePharmacy?: boolean;
  categories: string[];
  customCategories: () => string[];
  customCategory: string;
  setCustomCategory: (c: string) => void;
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => Promise<boolean> | void;
  removeCategory: (name: string) => void;
  say: (s: string) => void;
}

export function CategoriesPage({
  data,
  pharmacyId,
  canOperatePharmacy = true,
  categories,
  customCategories,
  customCategory,
  setCustomCategory,
  addCategory,
  renameCategory,
  removeCategory,
  say
}: CategoriesPageProps) {
  const [renaming, setRenaming] = useState<{ oldName: string; nextName: string } | null>(null);
  const [search, setSearch] = useState('');

  const customList = customCategories();

  const { categoryCounts, categorizedCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalCategorized = 0;
    for (const p of data.products) {
      if (p.pharmacyId !== pharmacyId || p.status === 'Archivé') continue;
      if (p.category) {
        totalCategorized += 1;
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    return { categoryCounts: counts, categorizedCount: totalCategorized };
  }, [data.products, pharmacyId]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOfficial = useMemo(
    () =>
      data.platformCategories.filter(c =>
        !normalizedSearch || c.toLowerCase().includes(normalizedSearch)
      ),
    [data.platformCategories, normalizedSearch]
  );

  const filteredCustom = useMemo(
    () =>
      customList.filter(c =>
        !normalizedSearch || c.toLowerCase().includes(normalizedSearch)
      ),
    [customList, normalizedSearch]
  );

  return (
    <>
      <SectionTitle
        eyebrow="ORGANISATION"
        title="Catégories"
        desc="Utilisez les catégories officielles et ajoutez vos propres catégories internes."
        icon={<ModernTagCategoryIcon size={24} />}
      />

      <div className="metric-grid">
        <Metric
          title="Catégories officielles"
          value={String(data.platformCategories.length)}
          detail="Référentiel national PharmaConnect"
          icon={ModernVerifiedShieldIcon}
        />
        <Metric
          title="Catégories personnalisées"
          value={String(customList.length)}
          detail="Propres à votre officine"
          icon={ModernTagCategoryIcon}
        />
        <Metric
          title="Produits catégorisés"
          value={String(categorizedCount)}
          detail="Fiches actives classées"
          icon={ModernPackageBoxIcon}
        />
      </div>

      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie officielle ou personnalisée…"
          />
        </label>
      </div>

      <div className="two-panels">
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div><h3>Catégories officielles</h3><p>Référentiel commun de la plateforme.</p></div>
            <span className="badge-label mint">Officielles</span>
          </div>
          {filteredOfficial.map(c => {
            const count = categoryCounts[c] || 0;
            return (
              <div className="category-row-item" key={c}>
                <ModernTagCategoryIcon size={17} />
                <span className="pc-cat-name">{c}</span>
                <span className="pc-cat-count">{count} produit{count > 1 ? 's' : ''}</span>
              </div>
            );
          })}
          {filteredOfficial.length === 0 && (
            <Empty title="Aucune catégorie officielle" detail="Aucune catégorie officielle ne correspond à votre recherche." />
          )}
        </section>

        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div><h3>Catégories personnalisées</h3><p>Organisation propre à votre établissement.</p></div>
          </div>
          <form
            className="inline-create"
            onSubmit={e => {
              e.preventDefault();
              if (!canOperatePharmacy || pharmacyId <= 0) {
                say('Action impossible : établissement inactif, expiré ou suspendu.');
                return;
              }
              const v = customCategory.trim();
              if (!v) return;
              if (categories.some(x => x.toLowerCase() === v.toLowerCase())) {
                say('Cette catégorie existe déjà.');
                return;
              }
              addCategory(v);
            }}
          >
            <input
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              placeholder="Nom de la catégorie"
              disabled={!canOperatePharmacy}
            />
            <button type="submit" className="primary-btn" disabled={!canOperatePharmacy}>
              <Plus size={14} /> Ajouter
            </button>
          </form>

          {filteredCustom.map(c => {
            const count = categoryCounts[c] || 0;
            return (
              <div className="category-row-item" key={c}>
                <span className="pc-cat-name">{c}</span>
                <span className="pc-cat-count">{count} produit{count > 1 ? 's' : ''}</span>
                <ActionMenu
                  label={`Actions pour ${c}`}
                  items={[
                    {
                      key: 'rename',
                      label: 'Renommer',
                      icon: <Pencil size={14} />,
                      onClick: () => {
                        if (!canOperatePharmacy || pharmacyId <= 0) {
                          say('Action impossible : établissement inactif, expiré ou suspendu.');
                          return;
                        }
                        setRenaming({ oldName: c, nextName: c });
                      },
                    },
                    {
                      key: 'delete',
                      label: 'Supprimer',
                      icon: <Trash2 size={14} />,
                      variant: 'danger',
                      dividerBefore: true,
                      onClick: () => {
                        if (!canOperatePharmacy || pharmacyId <= 0) {
                          say('Action impossible : établissement inactif, expiré ou suspendu.');
                          return;
                        }
                        if (!window.confirm(`Supprimer la catégorie personnalisée « ${c} » ?`)) return;
                        removeCategory(c);
                      },
                    },
                  ]}
                />
              </div>
            );
          })}

          {filteredCustom.length === 0 && (
            <Empty
              title={customList.length === 0 ? 'Aucune catégorie personnalisée' : 'Aucun résultat'}
              detail={
                customList.length === 0
                  ? 'Ajoutez une catégorie interne ci-dessus pour mieux structurer votre catalogue.'
                  : 'Aucune catégorie personnalisée ne correspond à votre recherche.'
              }
            />
          )}
        </section>
      </div>

      {renaming && (
        <Modal
          title="Renommer la catégorie"
          icon={<ModernTagCategoryIcon size={20} />}
          onClose={() => setRenaming(null)}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              const next = renaming.nextName.trim();
              if (next.length < 2) {
                say('Indiquez un nom de catégorie valide (2 caractères min.).');
                return;
              }
              if (next !== renaming.oldName && categories.some(x => x.toLowerCase() === next.toLowerCase())) {
                say('Une catégorie porte déjà ce nom.');
                return;
              }
              const ok = await renameCategory(renaming.oldName, next);
              if (ok !== false) setRenaming(null);
            }}
          >
            <div className="info-note pc-modal-warning">
              <ModernAlertWarningIcon size={17} />
              <span>
                Si cette catégorie est utilisée par des produits au statut <b>Publié</b>, leur renommage les soumettra de nouveau pour validation administrative (<b>En attente</b>).
              </span>
            </div>
            <label className="form-field">
              Nouveau nom *
              <input
                required
                minLength={2}
                maxLength={60}
                value={renaming.nextName}
                onChange={e => setRenaming({ ...renaming, nextName: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setRenaming(null)}>Annuler</button>
              <button type="submit" className="primary-btn">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
