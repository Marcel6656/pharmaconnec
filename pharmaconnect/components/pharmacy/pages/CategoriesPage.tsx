'use client';

import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AppData, Modal, SectionTitle } from '@/lib/shared';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { ModernTagCategoryIcon } from '@/components/shared/ModernIcons';

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

  return (
    <>
      <SectionTitle
        eyebrow="ORGANISATION"
        title="Catégories"
        desc="Utilisez les catégories officielles et ajoutez vos propres catégories internes."
        icon={<ModernTagCategoryIcon size={24} />}
      />
      <div className="two-panels">
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div><h3>Catégories officielles</h3><p>Référentiel commun de la plateforme.</p></div>
            <span className="badge-label mint">Officielles</span>
          </div>
          {data.platformCategories.map(c => (
            <div className="category-row-item" key={c}><ModernTagCategoryIcon size={17} />{c}<span>Référentiel PharmaConnect</span></div>
          ))}
        </section>
        <section className="panel cg-modern-panel">
          <div className="panel-heading"><div><h3>Catégories personnalisées</h3><p>Organisation propre à votre établissement.</p></div></div>
          <form className="inline-create" onSubmit={e => {
            e.preventDefault();
            if (!canOperatePharmacy || pharmacyId <= 0) {
              say('Action impossible : établissement inactif, expiré ou suspendu.');
              return;
            }
            const v = customCategory.trim();
            if (!v) return;
            if (categories.some(x => x.toLowerCase() === v.toLowerCase())) { say('Cette catégorie existe déjà.'); return; }
            addCategory(v);
          }}>
            <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Nom de la catégorie" disabled={!canOperatePharmacy} />
            <button className="primary-btn" disabled={!canOperatePharmacy}><Plus size={14} /> Ajouter</button>
          </form>
          {customCategories().map(c => (
            <div className="category-row-item" key={c}>
              {c}<span>Personnalisée</span>
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
          ))}
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
