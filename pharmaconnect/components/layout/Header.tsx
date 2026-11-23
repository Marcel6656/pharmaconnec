'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  Baby,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  CreditCard,
  FileText,
  Heart,
  Layers,
  LayoutGrid,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react';
import { Pharmacy } from '@/lib/shared';
import { Language, translations } from '@/lib/translations';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ModernBrandLogoIcon, ModernDigitalStoreIcon } from '@/components/shared/ModernIcons';
import type { HealthSubPage } from '@/components/public/pages/HealthAlertsPage';

type MegaMenuKey = 'products' | 'pharmacies' | 'solutions' | 'health' | 'account';
type SolutionTabKey = 'industry' | 'team' | 'goal' | 'size';
type PharmacyTabKey = 'all' | 'geo' | 'centre' | 'premium' | 'register';
type AccountTabKey = 'onboarding' | 'security';

interface HeaderProps {
  space: 'public' | 'pharmacy';
  page: string;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  openSpace: (s: 'public' | 'pharmacy', forceAuth?: boolean) => void;
  go: (p: string) => void;
  pharmacyLoggedIn: boolean;
  visitorLoggedIn?: boolean;
  setModal: (m: any) => void;
  setPharmacyLoginError: (s: string) => void;
  setPharmacyLoginForm: (f: any) => void;
  visitorAccount: { email: string; name: string };
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  pharmacies?: Pharmacy[];
  onSelectCategory?: (category: string) => void;
  onSelectAvailability?: (availability: string) => void;
  onSelectPharmacy?: (pharmacyId: number) => void;
  onTriggerGeo?: () => void;
  onOpenHealthSubPage?: (sub: HealthSubPage) => void;
  onOpenPharmacyPage?: (subPage: string) => void;
  onLogoutPharmacy?: () => void;
  onLogoutVisitor?: () => void;
}

interface MegaLinkItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
  tone?: 'slate' | 'violet' | 'blue' | 'pink' | 'mint' | 'indigo';
  onClick: () => void;
}

function FeaturedCubesGraphic() {
  return (
    <svg className="mega-cubes-svg" viewBox="0 0 180 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pcCubeTopA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="pcCubeLeftA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="pcCubeRightA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.86" />
        </linearGradient>
        <linearGradient id="pcCubeAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Top cube */}
      <g transform="translate(68 6)">
        <polygon points="24,4 46,16 24,28 2,16" fill="url(#pcCubeTopA)" />
        <polygon points="2,16 24,28 24,52 2,40" fill="url(#pcCubeLeftA)" />
        <polygon points="46,16 24,28 24,52 46,40" fill="url(#pcCubeRightA)" />
      </g>
      {/* Bottom-left cube */}
      <g transform="translate(26 42)">
        <polygon points="24,4 46,16 24,28 2,16" fill="url(#pcCubeTopA)" />
        <polygon points="2,16 24,28 24,52 2,40" fill="url(#pcCubeLeftA)" />
        <polygon points="46,16 24,28 24,52 46,40" fill="url(#pcCubeRightA)" />
      </g>
      {/* Bottom-right cube */}
      <g transform="translate(106 46)">
        <polygon points="24,4 46,16 24,28 2,16" fill="url(#pcCubeTopA)" />
        <polygon points="2,16 24,28 24,52 2,40" fill="url(#pcCubeAccent)" />
        <polygon points="46,16 24,28 24,52 46,40" fill="url(#pcCubeRightA)" />
      </g>
    </svg>
  );
}

function FeaturedStackedCardsGraphic() {
  return (
    <svg className="mega-stacked-svg" viewBox="0 0 180 118" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pcStackBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="pcStackMid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
        <linearGradient id="pcStackFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6f7f1" />
        </linearGradient>
      </defs>
      <g transform="rotate(-14 90 60)">
        <rect x="44" y="16" width="92" height="58" rx="12" fill="url(#pcStackBack)" opacity="0.88" />
        <rect x="34" y="28" width="96" height="60" rx="12" fill="url(#pcStackMid)" opacity="0.95" />
        <rect x="24" y="40" width="98" height="62" rx="12" fill="url(#pcStackFront)" stroke="#c7d2fe" strokeWidth="1.5" />
        <circle cx="42" cy="58" r="7" fill="#6366f1" opacity="0.25" />
        <rect x="55" y="54" width="46" height="6" rx="3" fill="#4f46e5" opacity="0.55" />
        <rect x="35" y="74" width="70" height="5" rx="2.5" fill="#94a3b8" opacity="0.4" />
        <rect x="35" y="84" width="48" height="5" rx="2.5" fill="#10b981" opacity="0.55" />
      </g>
    </svg>
  );
}

export function Header({
  space,
  page,
  mobileNavOpen,
  setMobileNavOpen,
  openSpace,
  go,
  pharmacyLoggedIn,
  visitorLoggedIn = false,
  setModal,
  setPharmacyLoginError,
  setPharmacyLoginForm,
  visitorAccount,
  currentLang = 'fr',
  onLanguageChange = () => { },
  pharmacies = [],
  onSelectCategory,
  onSelectAvailability,
  onSelectPharmacy,
  onTriggerGeo,
  onOpenHealthSubPage,
  onOpenPharmacyPage,
  onLogoutPharmacy,
  onLogoutVisitor,
}: HeaderProps) {
  const isEn = currentLang === 'en';
  const t = translations[currentLang]?.nav || translations.fr.nav;

  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(null);
  const [activeSolutionTab, setActiveSolutionTab] = useState<SolutionTabKey>('industry');
  const [activePharmacyTab, setActivePharmacyTab] = useState<PharmacyTabKey>('all');
  const [activeAccountTab, setActiveAccountTab] = useState<AccountTabKey>('onboarding');
  const [caretOffset, setCaretOffset] = useState<number>(280);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<MegaMenuKey, HTMLButtonElement | null>>({
    products: null,
    pharmacies: null,
    solutions: null,
    health: null,
    account: null,
  });

  const updateCaretPosition = (key: MegaMenuKey) => {
    const shell = shellRef.current;
    const btn = triggerRefs.current[key];
    if (!shell || !btn) return;
    const shellRect = shell.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const center = btnRect.left - shellRect.left + btnRect.width / 2;
    setCaretOffset(Math.max(48, Math.min(center, shellRect.width - 48)));
  };

  useEffect(() => {
    if (!activeMegaMenu && !mobileNavOpen) return;
    if (activeMegaMenu) updateCaretPosition(activeMegaMenu);

    const onDocMouseDown = (event: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
        setMobileNavOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMegaMenu(null);
        setMobileNavOpen(false);
      }
    };
    const onResize = () => {
      if (activeMegaMenu) updateCaretPosition(activeMegaMenu);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [activeMegaMenu, mobileNavOpen]);

  useEffect(() => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
  }, [page, space]);

  const navigateTo = (targetPage: string) => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    go(targetPage);
  };

  const selectCategory = (cat: string) => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      go('Produits');
    }
  };

  const selectAvailability = (availability: string) => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (onSelectAvailability) {
      onSelectAvailability(availability);
    } else {
      go('Produits');
    }
  };

  const selectPharmacy = (pharmacyId: number) => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (onSelectPharmacy) {
      onSelectPharmacy(pharmacyId);
    } else {
      go('Pharmacies');
    }
  };

  const triggerGeo = () => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (onTriggerGeo) {
      onTriggerGeo();
    } else {
      go('Pharmacies');
    }
  };

  const openHealthNestedPage = (sub: HealthSubPage) => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (onOpenHealthSubPage) {
      onOpenHealthSubPage(sub);
    } else {
      go('Rubrique Santé');
    }
  };

  const handlePharmacySpaceClick = () => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (pharmacyLoggedIn) {
      openSpace('pharmacy');
      return;
    }
    setPharmacyLoginError('');
    setPharmacyLoginForm({ email: '', password: '' });
    setModal('pharmacyLogin');
  };

  const openPharmacySubPage = (subPage: string) => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (onOpenPharmacyPage) {
      onOpenPharmacyPage(subPage);
    } else {
      handlePharmacySpaceClick();
    }
  };

  const openVisitorModal = (target: 'account' | 'visitorInbox' = 'account') => {
    setActiveMegaMenu(null);
    setMobileNavOpen(false);
    if (visitorLoggedIn && visitorAccount.email) {
      setModal('visitorInbox');
      return;
    }
    setModal(target === 'visitorInbox' ? 'account' : target);
  };

  const toggleMegaMenu = (key: MegaMenuKey) => {
    setActiveMegaMenu(prev => {
      const next = prev === key ? null : key;
      if (next) {
        requestAnimationFrame(() => updateCaretPosition(next));
      }
      return next;
    });
  };

  const handleTriggerHover = (key: MegaMenuKey) => {
    if (activeMegaMenu && activeMegaMenu !== key) {
      setActiveMegaMenu(key);
      updateCaretPosition(key);
    }
  };

  const pharmacyLockHint = isEn ? 'Sign-in required · ' : 'Connexion requise · ';
  const visitorLockHint = isEn ? 'Auth required · ' : 'Authentification requise · ';

  // --- Data for Panel 1: Produits (4 Columns + Featured Card) ---
  const productColumns: Array<{ heading: string; items: MegaLinkItem[] }> = [
    {
      heading: isEn ? 'Categories' : 'Catégories',
      items: [
        {
          title: isEn ? 'Medicines' : 'Médicaments',
          desc: isEn ? 'Treatments & prescriptions' : 'Traitements & ordonnances',
          icon: <Pill size={17} />,
          onClick: () => selectCategory('Médicaments'),
        },
        {
          title: isEn ? 'Vitamins' : 'Vitamines',
          desc: isEn ? 'Vitality & daily immunity' : 'Tonus & immunité',
          icon: <Heart size={17} />,
          onClick: () => selectCategory('Vitamines'),
        },
        {
          title: isEn ? 'Hygiene' : 'Hygiène',
          desc: isEn ? 'Antiseptics & care' : 'Soins & désinfection',
          icon: <Sparkles size={17} />,
          onClick: () => selectCategory('Hygiène'),
        },
        {
          title: isEn ? 'Baby & Maternity' : 'Bébé & maternité',
          desc: isEn ? 'Pediatrics & family' : 'Pédiatrie & famille',
          icon: <Baby size={17} />,
          onClick: () => selectCategory('Bébé & maternité'),
        },
      ],
    },
    {
      heading: isEn ? 'Explore' : 'Explorer',
      items: [
        {
          title: isEn ? 'Full Catalog' : 'Tout le catalogue',
          desc: isEn ? 'Browse every listed item' : 'Parcourir tous les produits',
          icon: <LayoutGrid size={17} />,
          onClick: () => selectCategory('Toutes les catégories'),
        },
        {
          title: isEn ? 'Parapharmacy' : 'Parapharmacie',
          desc: isEn ? 'Dermocosmetics & wellness' : 'Dermocosmétique & beauté',
          icon: <Activity size={17} />,
          onClick: () => selectCategory('Parapharmacie'),
        },
        {
          title: isEn ? 'Medical Equipment' : 'Matériel médical',
          desc: isEn ? 'Thermometers, masks & kits' : 'Thermomètres, masques, soins',
          icon: <Stethoscope size={17} />,
          onClick: () => selectCategory('Matériel médical'),
        },
        {
          title: isEn ? 'In Stock Now' : 'En stock immédiat',
          desc: isEn ? 'Real-time availability filter' : 'Disponibilité vérifiée en direct',
          icon: <CheckCircle2 size={17} />,
          onClick: () => selectAvailability('Disponible'),
        },
      ],
    },
    {
      heading: isEn ? 'Resources' : 'Ressources',
      items: [
        {
          title: isEn ? 'Patient Guide' : 'Guide patient',
          desc: isEn ? 'How availability checks work' : 'Comment trouver vos soins',
          icon: <BookOpen size={17} />,
          onClick: () => navigateTo('À propos'),
        },
        {
          title: isEn ? 'Freshness Charter' : 'Charte de fraîcheur',
          desc: isEn ? 'Stocks verified within 7 days' : 'Mises à jour sous 7 jours',
          icon: <Clock size={17} />,
          onClick: () => navigateTo('À propos'),
        },
        {
          title: isEn ? 'Privacy Policy' : 'Confidentialité',
          desc: isEn ? 'Protection of your inquiries' : 'Protection de vos échanges',
          icon: <Lock size={17} />,
          onClick: () => navigateTo('Confidentialité'),
        },
        {
          title: isEn ? 'Support & Contact' : 'Assistance & Contact',
          desc: isEn ? 'Reach our coordination team' : 'Contacter notre équipe',
          icon: <MessageSquare size={17} />,
          onClick: () => navigateTo('Contact'),
        },
      ],
    },
    {
      heading: isEn ? 'Use Cases' : 'Cas d’usage',
      items: [
        {
          title: isEn ? 'Patients & Families' : 'Patients & Familles',
          desc: isEn ? 'Find care across neighborhoods' : 'Trouver un soin proche',
          icon: <Users size={17} />,
          onClick: () => navigateTo('Produits'),
        },
        {
          title: isEn ? 'Health Section' : 'Rubrique Santé',
          desc: isEn ? 'Emergency directory, alerts & health news' : 'Numéros d’urgence, alertes et actualités santé',
          icon: <Activity size={17} />,
          onClick: () => openHealthNestedPage('emergency'),
        },
        {
          title: isEn ? 'Certified Pharmacies' : 'Officines agréées',
          desc: isEn ? 'Join the digital network' : 'Rejoindre le réseau santé',
          icon: <ShieldCheck size={17} />,
          onClick: () => navigateTo('Inscription pharmacie'),
        },
        {
          title: isEn ? 'Multi-Branch Portal' : 'Multi-établissements',
          desc: (pharmacyLoggedIn ? '' : pharmacyLockHint) + (isEn ? 'Manage several branches easily' : 'Piloter plusieurs officines'),
          icon: pharmacyLoggedIn ? <Building2 size={17} /> : <Lock size={17} />,
          onClick: handlePharmacySpaceClick,
        },
      ],
    },
  ];

  // --- Data for Panel 2: Pharmacies (Sidebar + Featured Pharmacies List) ---
  const pharmacyTabs: Array<{ key: PharmacyTabKey; label: string; icon: React.ReactNode }> = [
    { key: 'all', label: isEn ? 'All Pharmacies' : 'Toutes les officines', icon: <Building2 size={16} /> },
    { key: 'geo', label: isEn ? 'Near Me (GPS)' : 'Autour de moi (GPS)', icon: <MapPin size={16} /> },
    { key: 'centre', label: isEn ? 'N’Djamena Directory' : 'Annuaire N’Djamena', icon: <Compass size={16} /> },
    { key: 'premium', label: isEn ? 'Premium Partners' : 'Partenaires Premium', icon: <Award size={16} /> },
    { key: 'register', label: isEn ? 'Register Pharmacy' : 'Inscrire une officine', icon: <ShieldCheck size={16} /> },
  ];

  const tones: Array<MegaLinkItem['tone']> = ['violet', 'blue', 'pink', 'mint'];
  const featuredPharmacies: MegaLinkItem[] = (() => {
    if (activePharmacyTab === 'geo') {
      return [
        {
          title: isEn ? 'Enable GPS Distance Sorting' : 'Activer la géolocalisation GPS',
          desc: isEn ? 'Rank nearby verified pharmacies by distance (km)' : 'Classer les officines vérifiées par distance (km)',
          icon: <MapPin size={18} />,
          tone: 'violet',
          onClick: triggerGeo,
        },
        ...pharmacies.slice(0, 3).map((ph, idx) => ({
          title: ph.name,
          desc: `${ph.city} · ${ph.area}`,
          icon: <Building2 size={18} />,
          tone: tones[(idx + 1) % tones.length],
          onClick: () => selectPharmacy(ph.id),
        })),
      ];
    }

    if (activePharmacyTab === 'register') {
      return [
        {
          title: isEn ? 'Apply for Pharmacy Onboarding' : 'Inscrire mon officine',
          desc: isEn ? 'Submit license & start your 14-day free trial' : 'Déposer votre agrément et profiter de 14 jours d’essai',
          icon: <ShieldCheck size={18} />,
          tone: 'mint',
          onClick: () => navigateTo('Inscription pharmacie'),
        },
        {
          title: isEn ? 'Compare Basic, Standard & Premium' : 'Comparer les formules',
          desc: isEn ? 'Subscriptions via Mobile Money' : 'Abonnements via Mobile Money',
          icon: <CreditCard size={18} />,
          tone: 'indigo',
          onClick: () => navigateTo('Tarifs'),
        },
        {
          title: isEn ? 'Access Pharmacy Space' : 'Accéder à mon espace pro',
          desc: (pharmacyLoggedIn ? '' : pharmacyLockHint) + (isEn ? 'Sign in to manage stock & messages' : 'Gérer vos stocks, alertes et messages patients'),
          icon: pharmacyLoggedIn ? <Briefcase size={18} /> : <Lock size={18} />,
          tone: 'blue',
          onClick: handlePharmacySpaceClick,
        },
      ];
    }

    const filtered =
      activePharmacyTab === 'premium'
        ? pharmacies.filter(p => p.subscription === 'Premium' || p.subscription === 'Standard')
        : activePharmacyTab === 'centre'
          ? pharmacies.filter(p => `${p.city} ${p.area}`.toLowerCase().includes('djamena'))
          : pharmacies;
    const list = (filtered.length > 0 ? filtered : pharmacies).slice(0, 4);

    if (list.length === 0) {
      return [
        {
          title: isEn ? 'Browse Pharmacy Directory' : 'Ouvrir l’annuaire des pharmacies',
          desc: isEn ? 'Search certified pharmacies by district' : 'Rechercher une pharmacie par ville ou quartier',
          icon: <Building2 size={18} />,
          tone: 'violet',
          onClick: () => navigateTo('Pharmacies'),
        },
      ];
    }

    return list.map((ph, idx) => ({
      title: ph.name,
      desc: [ph.area || ph.city, ph.subscription, `${ph.products} ${isEn ? 'products' : 'produits'}`]
        .filter(Boolean)
        .join(' · '),
      icon: idx % 2 === 0 ? <Building2 size={18} /> : <ShieldCheck size={18} />,
      tone: tones[idx % tones.length],
      onClick: () => selectPharmacy(ph.id),
    }));
  })();

  // --- Data for Panel 3: Solutions (Sidebar tabs + Center Grid + Featured Card) ---
  const solutionTabs: Array<{ key: SolutionTabKey; label: string; icon: React.ReactNode }> = [
    { key: 'industry', label: isEn ? 'By Need' : 'Par besoin', icon: <Briefcase size={16} /> },
    { key: 'team', label: isEn ? 'By Role' : 'Par acteur', icon: <Users size={16} /> },
    { key: 'goal', label: isEn ? 'By Goal' : 'Par objectif', icon: <Target size={16} /> },
    { key: 'size', label: isEn ? 'By Structure' : 'Par structure', icon: <Building2 size={16} /> },
  ];

  const solutionItemsByTab: Record<SolutionTabKey, MegaLinkItem[]> = {
    industry: [
      {
        title: isEn ? 'Urgent Medicines' : 'Médicaments & Ordonnances',
        desc: isEn ? 'Verify availability before visiting' : 'Vérifier la disponibilité avant déplacement',
        icon: <Pill size={18} />,
        tone: 'indigo',
        onClick: () => selectCategory('Médicaments'),
      },
      {
        title: isEn ? 'Parapharmacy & Skin Care' : 'Parapharmacie & Bien-être',
        desc: isEn ? 'Dermocosmetics & hygiene selections' : 'Dermocosmétique, hygiène & soins quotidiens',
        icon: <Sparkles size={18} />,
        tone: 'pink',
        onClick: () => selectCategory('Parapharmacie'),
      },
      {
        title: isEn ? 'Family & Maternal Care' : 'Pédiatrie & Maternité',
        desc: isEn ? 'Trusted care for parents & babies' : 'Produits bébé & accompagnement familial',
        icon: <Heart size={18} />,
        tone: 'blue',
        onClick: () => selectCategory('Bébé & maternité'),
      },
      {
        title: isEn ? 'Medical Devices' : 'Équipements médicaux',
        desc: isEn ? 'Blood pressure, thermometers & kits' : 'Thermomètres, masques et matériel',
        icon: <Stethoscope size={18} />,
        tone: 'mint',
        onClick: () => selectCategory('Matériel médical'),
      },
    ],
    team: [
      {
        title: isEn ? 'Patients & Caregivers' : 'Patients & Visiteurs',
        desc: isEn ? 'Search medicines and contact pharmacies' : 'Rechercher et contacter une officine',
        icon: <User size={18} />,
        tone: 'blue',
        onClick: () => navigateTo('Produits'),
      },
      {
        title: isEn ? 'Lead Pharmacists' : 'Pharmaciens titulaires',
        desc: (pharmacyLoggedIn ? '' : pharmacyLockHint) + (isEn ? 'Publish inventory & answer patients' : 'Publier vos stocks et répondre en direct'),
        icon: pharmacyLoggedIn ? <ShieldCheck size={18} /> : <Lock size={18} />,
        tone: 'mint',
        onClick: handlePharmacySpaceClick,
      },
      {
        title: isEn ? 'New Partner Pharmacies' : 'Nouvelles officines',
        desc: isEn ? 'Register and activate in 14-day trial' : 'Inscription simple avec essai de 14 jours',
        icon: <FileText size={18} />,
        tone: 'indigo',
        onClick: () => navigateTo('Inscription pharmacie'),
      },
      {
        title: isEn ? 'Support Coordination' : 'Équipe PharmaConnect',
        desc: isEn ? 'Assistance & partnership questions' : 'Support technique et accompagnement',
        icon: <MessageSquare size={18} />,
        tone: 'pink',
        onClick: () => navigateTo('Contact'),
      },
    ],
    goal: [
      {
        title: isEn ? 'Save Time on Searches' : 'Éviter les déplacements inutiles',
        desc: isEn ? 'Filter in-stock items near your area' : 'Cibler les produits disponibles autour de vous',
        icon: <MapPin size={18} />,
        tone: 'blue',
        onClick: triggerGeo,
      },
      {
        title: isEn ? 'Boost Pharmacy Visibility' : 'Accroître sa visibilité',
        desc: isEn ? 'Verified badges & directory ranking' : 'Badges vérifiés et mise en avant locale',
        icon: <TrendingUp size={18} />,
        tone: 'indigo',
        onClick: () => navigateTo('Tarifs'),
      },
      {
        title: isEn ? 'Direct Patient Messaging' : 'Messagerie patient directe',
        desc: (visitorLoggedIn ? '' : visitorLockHint) + (isEn ? 'Threaded conversations with inbox' : 'Fils de discussion sécurisés sans panier'),
        icon: visitorLoggedIn ? <MessageSquare size={18} /> : <Lock size={18} />,
        tone: 'mint',
        onClick: () => openVisitorModal(visitorLoggedIn ? 'visitorInbox' : 'account'),
      },
      {
        title: isEn ? 'Flexible Billing' : 'Paiement Mobile Money & Carte',
        desc: isEn ? 'Airtel, Moov, Visa, Mastercard & GIMAC' : 'Airtel Money, Moov, Visa, Mastercard, GIMAC',
        icon: <CreditCard size={18} />,
        tone: 'pink',
        onClick: () => navigateTo('Tarifs'),
      },
    ],
    size: [
      {
        title: isEn ? 'Independent Pharmacy' : 'Officine indépendante',
        desc: isEn ? 'Start fast with Basic or Standard' : 'Démarrage rapide avec Basic ou Standard',
        icon: <Building2 size={18} />,
        tone: 'indigo',
        onClick: () => navigateTo('Tarifs'),
      },
      {
        title: isEn ? 'High-Volume Dispensary' : 'Grande pharmacie de garde',
        desc: isEn ? 'Unlimited stock updates & alerts' : 'Mises à jour continues & alertes stock bas',
        icon: <Activity size={18} />,
        tone: 'blue',
        onClick: () => navigateTo('Tarifs'),
      },
      {
        title: isEn ? 'Multi-Branch Groups' : 'Groupements multi-sites',
        desc: (pharmacyLoggedIn ? '' : pharmacyLockHint) + (isEn ? 'Switch branches from one account' : 'Gérer plusieurs officines depuis un compte'),
        icon: pharmacyLoggedIn ? <Layers size={18} /> : <Lock size={18} />,
        tone: 'mint',
        onClick: handlePharmacySpaceClick,
      },
      {
        title: isEn ? 'Regional Health Network' : 'Réseau N’Djamena & Régions',
        desc: isEn ? 'Verified healthcare coverage' : 'Couverture vérifiée par quartier',
        icon: <Award size={18} />,
        tone: 'pink',
        onClick: () => navigateTo('Pharmacies'),
      },
    ],
  };

  const activeSolutionItems = solutionItemsByTab[activeSolutionTab];

  // --- Data for Panel 4: Portail d'Authentification & Accès Sécurisé ---
  const accountTabs: Array<{ key: AccountTabKey; label: string; icon: React.ReactNode; locked?: boolean }> = [
    { key: 'onboarding', label: isEn ? 'Partner Onboarding' : 'Adhésion & Agrément', icon: <ShieldCheck size={16} /> },
    { key: 'security', label: isEn ? 'Security & Help' : 'Sécurité & Assistance', icon: <Compass size={16} /> },
  ];

  const accountItemsByTab: Record<AccountTabKey, MegaLinkItem[]> = {
    onboarding: [
      {
        title: isEn ? 'Submit Pharmacy License' : 'Dépôt du dossier d’agrément',
        desc: isEn ? 'Official pharmacy registration on PharmaConnect' : 'Enregistrement officiel de votre établissement sur PharmaConnect',
        icon: <FileText size={18} />,
        tone: 'mint',
        onClick: () => navigateTo('Inscription pharmacie'),
      },
      {
        title: isEn ? 'Verification & Official Badge' : 'Validation & Badge Officine Vérifiée',
        desc: isEn ? 'Administrative review prior to public activation' : 'Contrôle administratif avant activation de votre visibilité',
        icon: <Award size={18} />,
        tone: 'indigo',
        onClick: () => navigateTo('À propos'),
      },
      {
        title: isEn ? 'Professional Membership' : 'Modalités d’adhésion Pro',
        desc: isEn ? 'Subscription activation via Mobile Money' : 'Activation de l’abonnement via Mobile Money',
        icon: <CreditCard size={18} />,
        tone: 'blue',
        onClick: () => navigateTo('Tarifs'),
      },
      {
        title: isEn ? 'Speak with Onboarding Team' : 'Parler à un conseiller réseau',
        desc: isEn ? 'Eligibility & multi-branch deployment inquiries' : 'Questions sur l’éligibilité et le déploiement multi-sites',
        icon: <Users size={18} />,
        tone: 'pink',
        onClick: () => navigateTo('Contact'),
      },
    ],
    security: [
      {
        title: isEn ? 'Locked Portal Access' : 'Verrouillage des espaces',
        desc: isEn ? 'No direct access without prior verified sign-in' : 'Aucun accès direct sans authentification préalable vérifiée',
        icon: <Lock size={18} />,
        tone: 'violet',
        onClick: handlePharmacySpaceClick,
      },
      {
        title: isEn ? 'Account & Data Protection' : 'Protection des comptes & données',
        desc: isEn ? 'Secured session tokens & isolated workspaces' : 'Jetons de session sécurisés et cloisonnement des espaces',
        icon: <ShieldCheck size={18} />,
        tone: 'mint',
        onClick: () => navigateTo('Confidentialité'),
      },
      {
        title: isEn ? 'Freshness & Quality Charter' : 'Charte de fraîcheur & Qualité',
        desc: isEn ? 'Pharmacist commitments on live stock updates' : 'Engagements de mise à jour des stocks par les pharmaciens',
        icon: <Clock size={18} />,
        tone: 'blue',
        onClick: () => navigateTo('À propos'),
      },
      {
        title: isEn ? 'Report an Access Issue' : 'Signaler un problème d’accès',
        desc: isEn ? 'Contact the PharmaConnect technical team' : 'Contacter l’équipe technique PharmaConnect',
        icon: <MessageSquare size={18} />,
        tone: 'pink',
        onClick: () => navigateTo('Contact'),
      },
    ],
  };

  const activeAccountItems = accountItemsByTab[activeAccountTab];

  return (
    <div ref={shellRef} className={`mega-header-shell ${space === 'pharmacy' ? 'is-workspace' : ''}`}>
      <header className="public-header mega-public-header">
        <button
          className="logo-button"
          onClick={() => {
            setActiveMegaMenu(null);
            setMobileNavOpen(false);
            openSpace('public');
          }}
        >
          <span className="logo-symbol">
            <ModernBrandLogoIcon size={23} />
          </span>
          <span className="logo-word">
            <b>PHARMA</b><strong>CONNECT</strong>
            <small>{isEn ? 'HEALTH & PROXIMITY' : 'SANTÉ & PROXIMITÉ'}</small>
          </span>
        </button>

        {space === 'public' ? (
          <nav className={`public-nav mega-public-nav ${mobileNavOpen ? 'mobile-open' : ''}`}>
            <button
              className={`mega-nav-link ${page === 'Accueil' && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => navigateTo('Accueil')}
            >
              {t.home}
            </button>

            <button
              ref={el => { triggerRefs.current.products = el; }}
              type="button"
              aria-expanded={activeMegaMenu === 'products'}
              className={`mega-nav-trigger ${activeMegaMenu === 'products' ? 'is-open' : ''} ${page === 'Produits' && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => toggleMegaMenu('products')}
              onMouseEnter={() => handleTriggerHover('products')}
            >
              <span>{t.products}</span>
              <ChevronDown size={14} className="mega-chevron" />
            </button>

            <button
              ref={el => { triggerRefs.current.pharmacies = el; }}
              type="button"
              aria-expanded={activeMegaMenu === 'pharmacies'}
              className={`mega-nav-trigger ${activeMegaMenu === 'pharmacies' ? 'is-open' : ''} ${(page === 'Pharmacies' || page === 'Fiche pharmacie') && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => toggleMegaMenu('pharmacies')}
              onMouseEnter={() => handleTriggerHover('pharmacies')}
            >
              <span>{t.pharmacies}</span>
              <ChevronDown size={14} className="mega-chevron" />
            </button>

            <button
              ref={el => { triggerRefs.current.solutions = el; }}
              type="button"
              aria-expanded={activeMegaMenu === 'solutions'}
              className={`mega-nav-trigger ${activeMegaMenu === 'solutions' ? 'is-open' : ''} ${(page === 'À propos' || page === 'Inscription pharmacie') && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => toggleMegaMenu('solutions')}
              onMouseEnter={() => handleTriggerHover('solutions')}
            >
              <span>{isEn ? 'Solutions' : 'Solutions'}</span>
              <ChevronDown size={14} className="mega-chevron" />
            </button>

            <button
              className={`mega-nav-link ${page === 'Tarifs' && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => navigateTo('Tarifs')}
            >
              {t.pricing}
            </button>

            <button
              ref={el => { triggerRefs.current.health = el; }}
              type="button"
              aria-expanded={activeMegaMenu === 'health'}
              className={`mega-nav-trigger pc-nav-alerts-link ${activeMegaMenu === 'health' ? 'is-open' : ''} ${(page === 'Rubrique Santé' || page === 'Alertes & Urgences') && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => toggleMegaMenu('health')}
              onMouseEnter={() => handleTriggerHover('health')}
            >
              <span className="pc-nav-alert-dot" aria-hidden="true" />
              <span>{isEn ? 'Health Section' : 'Rubrique Santé'}</span>
              <ChevronDown size={14} className="mega-chevron" />
            </button>

            <button
              className={`mega-nav-link ${page === 'Contact' && !activeMegaMenu ? 'selected' : ''}`}
              onClick={() => navigateTo('Contact')}
            >
              {t.contact}
            </button>

            <button
              type="button"
              className={`mega-nav-trigger mega-mobile-account-link ${activeMegaMenu === 'account' ? 'is-open' : ''}`}
              onClick={() => toggleMegaMenu('account')}
            >
              <span>{isEn ? 'Portal & Account' : 'Espace & Compte'}</span>
              <Lock size={13} aria-hidden="true" />
              <ChevronDown size={14} className="mega-chevron" />
            </button>
          </nav>
        ) : space === 'pharmacy' ? (
          <div className="space-caption">{t.spaceCaption || 'ESPACE PROFESSIONNEL'}</div>
        ) : null}

        <div className="header-actions">
          <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />

          <button
            className="cg-header-search-btn"
            onClick={() => navigateTo('Produits')}
            title={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
          >
            <Search size={16} />
          </button>

          {space === 'public' ? (
            <>
              {visitorLoggedIn && visitorAccount.email && (
                <button
                  type="button"
                  className="cg-visitor-pill-btn"
                  onClick={() => openVisitorModal('visitorInbox')}
                  aria-label={isEn ? 'My patient space' : 'Mon espace patient'}
                  title={visitorAccount.email}
                >
                  <User size={14} />
                  <span>{visitorAccount.name?.split(' ')[0] || (isEn ? 'My space' : 'Mon espace')}</span>
                </button>
              )}
              <button
                ref={el => { triggerRefs.current.account = el; }}
                type="button"
                aria-expanded={activeMegaMenu === 'account'}
                className={`cg-btn-pine cg-header-cta mega-account-trigger ${activeMegaMenu === 'account' ? 'is-open' : ''}`}
                onClick={() => toggleMegaMenu('account')}
                onMouseEnter={() => handleTriggerHover('account')}
              >
                <ModernDigitalStoreIcon size={15} />
                <span>{isEn ? 'Portal & Account' : 'Espace & Compte'}</span>
                <Lock size={13} aria-hidden="true" />
                <ChevronDown size={14} className="mega-chevron" />
              </button>
            </>
          ) : (
            <button
              className="cg-btn-pine cg-header-cta"
              onClick={() => {
                setActiveMegaMenu(null);
                openSpace('public');
              }}
            >
              <ArrowRight size={13} /> {isEn ? 'Public Site' : 'Site public'}
            </button>
          )}

          <button
            className={`mobile-public-menu ${mobileNavOpen ? 'is-open' : ''}`}
            aria-expanded={mobileNavOpen}
            onClick={() => {
              setActiveMegaMenu(null);
              setMobileNavOpen(!mobileNavOpen);
            }}
            aria-label="Ouvrir le menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Creative Mega Menu Dropdown Panel */}
      {space === 'public' && activeMegaMenu && (
        <div
          className={`mega-dropdown-panel mega-panel-${activeMegaMenu}`}
          role="region"
          aria-label={activeMegaMenu}
        >
          <span className="mega-panel-caret" style={{ left: `${caretOffset}px` }} aria-hidden="true" />
          <div className="mega-mobile-panel-bar">
            <button
              type="button"
              className="mega-mobile-back"
              onClick={() => setActiveMegaMenu(null)}
            >
              <X size={15} /> {isEn ? 'Close submenu' : 'Fermer le sous-menu'}
            </button>
          </div>

          {activeMegaMenu === 'products' && (
            <div className="mega-products-layout">
              <div className="mega-columns-grid">
                {productColumns.map(col => (
                  <div key={col.heading} className="mega-col">
                    <div className="mega-col-title">{col.heading}</div>
                    <div className="mega-col-list">
                      {col.items.map(item => (
                        <button
                          key={item.title}
                          type="button"
                          className="mega-item-btn"
                          onClick={item.onClick}
                        >
                          <span className="mega-item-icon is-neutral">{item.icon}</span>
                          <span className="mega-item-text">
                            <strong>{item.title}</strong>
                            <small>{item.desc}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mega-featured-card">
                <div className="mega-featured-visual">
                  <FeaturedCubesGraphic />
                </div>
                <div className="mega-featured-body">
                  <span className="mega-featured-kicker">{isEn ? 'FEATURED' : 'À LA UNE'}</span>
                  <h4>{isEn ? 'Find care faster with PharmaConnect' : 'Trouvez vos soins plus vite'}</h4>
                  <p>
                    {isEn
                      ? 'Verified stocks updated directly by certified pharmacies.'
                      : 'Catalogue vérifié en direct auprès des officines agréées.'}
                  </p>
                  <button
                    type="button"
                    className="mega-featured-cta"
                    onClick={() => navigateTo('Produits')}
                  >
                    {isEn ? 'Explore now' : 'Explorer maintenant'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMegaMenu === 'pharmacies' && (
            <div className="mega-sidebar-layout is-two-col">
              <div className="mega-side-tabs">
                {pharmacyTabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`mega-side-tab ${activePharmacyTab === tab.key ? 'is-active' : ''}`}
                    onMouseEnter={() => setActivePharmacyTab(tab.key)}
                    onClick={() => {
                      const wasSame = activePharmacyTab === tab.key;
                      setActivePharmacyTab(tab.key);
                      if (tab.key === 'all') navigateTo('Pharmacies');
                      else if (tab.key === 'centre' && wasSame) navigateTo('Pharmacies');
                      else if (tab.key === 'geo') triggerGeo();
                      else if (tab.key === 'register') navigateTo('Inscription pharmacie');
                    }}
                  >
                    <span className="mega-side-tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="mega-main-area">
                <div className="mega-main-head">
                  <span>{isEn ? 'Featured Pharmacies' : 'Officines à la une'}</span>
                  <button type="button" className="mega-view-all" onClick={() => navigateTo('Pharmacies')}>
                    {isEn ? 'View all' : 'Tout voir'} <ArrowRight size={13} />
                  </button>
                </div>

                <div className="mega-featured-list">
                  {featuredPharmacies.map(item => (
                    <button
                      key={item.title}
                      type="button"
                      className="mega-item-btn is-card"
                      onClick={item.onClick}
                    >
                      <span className={`mega-item-icon is-tone-${item.tone || 'violet'}`}>{item.icon}</span>
                      <span className="mega-item-text">
                        <strong>{item.title}</strong>
                        <small>{item.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMegaMenu === 'solutions' && (
            <div className="mega-sidebar-layout is-three-col">
              <div className="mega-side-tabs">
                {solutionTabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`mega-side-tab ${activeSolutionTab === tab.key ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveSolutionTab(tab.key)}
                    onClick={() => setActiveSolutionTab(tab.key)}
                  >
                    <span className="mega-side-tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="mega-main-area">
                <div className="mega-solutions-list">
                  {activeSolutionItems.map(item => (
                    <button
                      key={item.title}
                      type="button"
                      className="mega-item-btn is-card"
                      onClick={item.onClick}
                    >
                      <span className={`mega-item-icon is-tone-${item.tone || 'indigo'}`}>{item.icon}</span>
                      <span className="mega-item-text">
                        <strong>{item.title}</strong>
                        <small>{item.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mega-featured-card is-light">
                <div className="mega-featured-visual">
                  <FeaturedStackedCardsGraphic />
                </div>
                <div className="mega-featured-body">
                  <h4>{isEn ? 'Find the right plan for you' : 'Trouvez la formule adaptée'}</h4>
                  <p>
                    {isEn
                      ? 'Tailored plans for independent & multi-branch pharmacies.'
                      : 'Basic, Standard ou Premium selon votre officine et votre réseau.'}
                  </p>
                  <button
                    type="button"
                    className="mega-inline-cta"
                    onClick={() => navigateTo('Tarifs')}
                  >
                    {isEn ? 'Explore plans' : 'Voir les formules'} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMegaMenu === 'health' && (
            <div className="mega-products-layout">
              <div className="mega-main-area">
                <div className="mega-main-head">
                  <span>{isEn ? 'Health Section · Nested Pages' : 'Rubrique Santé · Pages imbriquées'}</span>
                  <button
                    type="button"
                    className="mega-view-all"
                    onClick={() => openHealthNestedPage('alerts')}
                  >
                    {isEn ? 'Open Health Section' : 'Ouvrir la Rubrique Santé'} <ArrowRight size={13} />
                  </button>
                </div>

                <div className="mega-solutions-list">
                  <button
                    type="button"
                    className="mega-item-btn is-card"
                    onClick={() => openHealthNestedPage('alerts')}
                  >
                    <span className="mega-item-icon is-tone-pink"><Activity size={18} /></span>
                    <span className="mega-item-text">
                      <strong>{isEn ? 'Health Alerts & Vigilance' : 'Alertes sanitaires'}</strong>
                      <small>{isEn ? 'Active bulletins, drug safety & prevention reminders' : 'Bulletins de vigilance, sécurité médicaments & rappels'}</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="mega-item-btn is-card"
                    onClick={() => openHealthNestedPage('news')}
                  >
                    <span className="mega-item-icon is-tone-blue"><BookOpen size={18} /></span>
                    <span className="mega-item-text">
                      <strong>{isEn ? 'Health News & Briefings' : 'Actualités de santé'}</strong>
                      <small>{isEn ? 'Practical guides, chronic care & network news' : 'Dossiers pratiques, prévention & nouveautés officinales'}</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="mega-item-btn is-card"
                    onClick={() => openHealthNestedPage('emergency')}
                  >
                    <span className="mega-item-icon is-tone-mint"><ShieldCheck size={18} /></span>
                    <span className="mega-item-text">
                      <strong>{isEn ? 'Emergency Numbers' : 'Numéros d’urgence « Numéro Vert »'}</strong>
                      <small>{isEn ? 'Published emergency contacts' : 'Répertoire des services d’urgence'}</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="mega-item-btn is-card"
                    onClick={() => navigateTo('Pharmacies')}
                  >
                    <span className="mega-item-icon is-tone-indigo"><MapPin size={18} /></span>
                    <span className="mega-item-text">
                      <strong>{isEn ? 'Duty & Open Pharmacies' : 'Officines & Permanence'}</strong>
                      <small>{isEn ? 'Locate nearby certified pharmacies by distance' : 'Repérer les pharmacies agréées les plus proches'}</small>
                    </span>
                  </button>
                </div>
              </div>

              <div className="mega-featured-card is-light">
                <div className="mega-featured-visual">
                  <FeaturedCubesGraphic />
                </div>
                <div className="mega-featured-body">
                  <span className="mega-featured-kicker">{isEn ? 'EMERGENCY SERVICES' : 'SERVICES D’URGENCE'}</span>
                  <h4>{isEn ? 'Emergency Directory' : 'Répertoire d’urgence'}</h4>
                  <p>
                    {isEn
                      ? 'View the contact numbers published by PharmaConnect.'
                      : 'Consultez les numéros de contact publiés par PharmaConnect.'}
                  </p>
                  <button
                    type="button"
                    className="mega-featured-cta"
                    onClick={() => openHealthNestedPage('emergency')}
                  >
                    {isEn ? 'Open Toll-Free Directory' : 'Voir les Numéros Verts'} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMegaMenu === 'account' && (
            <div className="mega-sidebar-layout is-three-col">
              <div className="mega-side-tabs">
                {accountTabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`mega-side-tab ${activeAccountTab === tab.key ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveAccountTab(tab.key)}
                    onClick={() => setActiveAccountTab(tab.key)}
                  >
                    <span className="mega-side-tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.locked && (
                      <span className="mega-tab-lock" title={isEn ? 'Authentication required' : 'Authentification requise'}>
                        <Lock size={11} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mega-main-area">
                <div className="mega-solutions-list">
                  {activeAccountItems.map(item => (
                    <button
                      key={item.title}
                      type="button"
                      className="mega-item-btn is-card"
                      onClick={item.onClick}
                    >
                      <span className={`mega-item-icon is-tone-${item.tone || 'mint'}`}>{item.icon}</span>
                      <span className="mega-item-text">
                        <strong>{item.title}</strong>
                        <small>{item.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mega-featured-card">
                <div className="mega-featured-visual">
                  <FeaturedCubesGraphic />
                </div>
                <div className="mega-featured-body">
                  <span className="mega-featured-kicker">{isEn ? 'SECURE PORTAL' : 'PORTAIL SÉCURISÉ'}</span>
                  <h4>{isEn ? 'Authentication Required' : 'Authentification obligatoire'}</h4>
                  <p>
                    {isEn
                      ? 'Direct access to spaces is locked. Please sign in to access your space.'
                      : 'L’accès direct aux espaces est verrouillé. Identifiez-vous pour accéder à votre portail.'}
                  </p>
                  <div className="mega-featured-dual-actions">
                    <button
                      type="button"
                      className="mega-featured-cta"
                      onClick={handlePharmacySpaceClick}
                    >
                      <Lock size={14} />
                      {isEn ? 'Sign In · Pharmacy' : 'S’identifier · Pharmacie'}
                      <ArrowRight size={13} />
                    </button>
                    <button
                      type="button"
                      className="mega-featured-secondary-cta"
                      onClick={() => openVisitorModal(visitorLoggedIn ? 'visitorInbox' : 'account')}
                    >
                      <User size={14} />
                      {visitorLoggedIn
                        ? (isEn ? 'My Patient Space' : 'Mon espace patient')
                        : (isEn ? 'Sign In · My Account' : 'S’identifier · Mon compte')}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
