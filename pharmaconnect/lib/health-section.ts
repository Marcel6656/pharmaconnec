export type EmergencyCategory = 'all' | 'green' | 'rescue' | 'hospital';
export type AlertSeverity = 'all' | 'urgent' | 'vigilance' | 'prevention';

export interface EmergencyNumberItem {
  id: string;
  number: string;
  telHref?: string;
  badgeFr: string;
  badgeEn: string;
  category: Exclude<EmergencyCategory, 'all'>;
  isTollFree?: boolean;
  active?: boolean;
  titleFr: string;
  titleEn: string;
  serviceFr: string;
  serviceEn: string;
  descFr: string;
  descEn: string;
  hoursFr: string;
  hoursEn: string;
  secondaryNumber?: string;
}

export interface HealthAlertItem {
  id: string;
  severity: Exclude<AlertSeverity, 'all'>;
  active?: boolean;
  dateFr: string;
  dateEn: string;
  scopeFr: string;
  scopeEn: string;
  image: string;
  imageAltFr: string;
  imageAltEn: string;
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  adviceFr: string;
  adviceEn: string;
  actionLabelFr: string;
  actionLabelEn: string;
  targetPage: string;
  targetCategory?: string;
}

export interface HealthNewsItem {
  id: string;
  tagFr: string;
  tagEn: string;
  active?: boolean;
  dateFr: string;
  dateEn: string;
  readTime: string;
  image: string;
  imageAltFr: string;
  imageAltEn: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  keyPointsFr: string[];
  keyPointsEn: string[];
  targetCategory?: string;
}

export interface HealthSectionPayload {
  alerts: HealthAlertItem[];
  news: HealthNewsItem[];
  emergencyNumbers: EmergencyNumberItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_EMERGENCY_NUMBERS: EmergencyNumberItem[] = [
  {
    id: 'green-health-1313',
    number: '1313',
    telHref: 'tel:1313',
    badgeFr: 'Numéro Vert Gratuit',
    badgeEn: 'Toll-Free Green Line',
    category: 'green',
    isTollFree: true,
    active: true,
    titleFr: 'Numéro Vert Urgence Santé & Alerte Sanitaire',
    titleEn: 'Health Emergency & Sanitary Alert Toll-Free Line',
    serviceFr: 'Ministère de la Santé Publique · Cellule Veille & Alerte',
    serviceEn: 'Ministry of Public Health · Surveillance & Alert Unit',
    descFr: 'Ligne nationale d’information sanitaire, de signalement d’urgence médicale et d’orientation vers les structures de prise en charge.',
    descEn: 'National health helpline for emergency guidance, epidemiological reporting, and care center orientation.',
    hoursFr: 'Ouvert 24h/24 · 7j/7',
    hoursEn: 'Open 24/7',
  },
  {
    id: 'hgrn-ambulance',
    number: '+235 22 51 42 42',
    telHref: 'tel:+23522514242',
    secondaryNumber: '+235 22 51 12 37',
    badgeFr: 'Urgences Médicales',
    badgeEn: 'Medical Emergencies',
    category: 'hospital',
    active: true,
    titleFr: 'Urgences Médicales & Ambulance (HGRN)',
    titleEn: 'Medical Emergencies & Ambulance (HGRN)',
    serviceFr: 'Hôpital Général de Référence Nationale · N’Djamena',
    serviceEn: 'National General Referral Hospital · N’Djamena',
    descFr: 'Lignes fixes directes pour la régulation médicale, l’accueil d’urgence vitale et les transferts hospitaliers.',
    descEn: 'Direct hospital lines for urgent medical triage, emergency admission, and ambulance coordination.',
    hoursFr: 'Permanence 24h/24',
    hoursEn: '24/7 Duty Desk',
  },
  {
    id: 'fire-18',
    number: '18',
    telHref: 'tel:18',
    secondaryNumber: '+235 22 52 25 55',
    badgeFr: 'Secours & Incendie',
    badgeEn: 'Fire & Rescue',
    category: 'rescue',
    active: true,
    titleFr: 'Sapeurs-Pompiers & Secours d’Urgence',
    titleEn: 'Fire Brigade & Emergency Rescue',
    serviceFr: 'Secours incendie, accidents de la route & évacuations',
    serviceEn: 'Fire rescue, road accidents & emergency evacuations',
    descFr: 'Composez le 18 ou la ligne directe de la caserne municipale (+235 22 52 25 55 / +235 66 55 74 55) selon votre opérateur.',
    descEn: 'Dial 18 or the municipal brigade direct line (+235 22 52 25 55 / +235 66 55 74 55) depending on carrier.',
    hoursFr: 'Intervention 24h/24',
    hoursEn: '24/7 Dispatch',
  },
  {
    id: 'police-17',
    number: '17',
    telHref: 'tel:17',
    secondaryNumber: '117',
    badgeFr: 'Sécurité Publique',
    badgeEn: 'Public Safety',
    category: 'rescue',
    active: true,
    titleFr: 'Police Secours',
    titleEn: 'Emergency Police',
    serviceFr: 'Assistance immédiate sur la voie publique & sécurité',
    serviceEn: 'Immediate public safety assistance & emergency response',
    descFr: 'Appels d’urgence sécuritaire, accidents graves et coordination des périmètres d’intervention (17 ou 117 selon opérateur).',
    descEn: 'Urgent public safety calls, serious accidents, and incident coordination (17 or 117 depending on network).',
    hoursFr: 'Continu 24h/24',
    hoursEn: 'Continuous 24/7',
  },
  {
    id: 'cnts-blood',
    number: 'HGRN · CNTS',
    badgeFr: 'Urgence Vitale · Sang',
    badgeEn: 'Vital Blood Bank',
    category: 'hospital',
    active: true,
    titleFr: 'Centre National de Transfusion Sanguine (CNTS)',
    titleEn: 'National Blood Transfusion Center (CNTS)',
    serviceFr: 'Enceinte de l’Hôpital Général de Référence Nationale',
    serviceEn: 'Located inside National General Referral Hospital (HGRN)',
    descFr: 'Approvisionnement d’urgence en produits sanguins labiles pour les interventions chirurgicales, obstétricales et anémies sévères.',
    descEn: 'Emergency blood supply and compatibility screening for surgical, obstetric, and critical care emergencies.',
    hoursFr: 'Service d’urgence hospitalier',
    hoursEn: 'Hospital Emergency Desk',
  },
  {
    id: 'green-pharmacy-watch',
    number: 'Réseau 24/7',
    badgeFr: 'Officines Agréées',
    badgeEn: 'Verified Pharmacies',
    category: 'green',
    isTollFree: true,
    active: true,
    titleFr: 'Annuaire Direct des Pharmacies Partenaires',
    titleEn: 'Verified Partner Pharmacy Directory',
    serviceFr: 'PharmaConnect · Téléphone & WhatsApp directs',
    serviceEn: 'PharmaConnect · Direct Phone & WhatsApp',
    descFr: 'Localisez une pharmacie agréée proche et joignez le comptoir par téléphone avant de vous déplacer pour un traitement urgent.',
    descEn: 'Locate a nearby certified pharmacy and call the counter directly before traveling for urgent medication.',
    hoursFr: 'Stocks déclarés mis à jour',
    hoursEn: 'Updated live pharmacy hours',
  },
];

export const DEFAULT_HEALTH_ALERTS: HealthAlertItem[] = [
  {
    id: 'alert-supply-chain',
    severity: 'urgent',
    active: true,
    dateFr: 'Bulletin actif · Nov. 2026',
    dateEn: 'Active Bulletin · Nov 2026',
    scopeFr: 'Vigilance Médicaments',
    scopeEn: 'Medication Vigilance',
    image: '/images/hero-cinema-medicines.jpg',
    imageAltFr: 'Flacons stériles, gélules et plaquettes pharmaceutiques issus du circuit officinal contrôlé',
    imageAltEn: 'Sterile pharmaceutical vials, capsules, and blister packs from a licensed supply chain',
    titleFr: 'Rappel de vigilance : éviter les circuits de vente informels',
    titleEn: 'Vigilance Notice: Avoid Unlicensed Street Medication Markets',
    summaryFr: 'Les spécialités exposées au soleil ou hors circuit pharmaceutique agréé présentent un risque majeur de sous-dosage, de dégradation et de contrefaçon.',
    summaryEn: 'Medicines stored outside licensed pharmacies risk thermal degradation, wrong dosage, or counterfeiting.',
    adviceFr: 'Vérifiez systématiquement la présence du badge « Pharmacie vérifiée » sur PharmaConnect et exigez le conseil d’un pharmacien diplômé.',
    adviceEn: 'Always confirm the "Verified Pharmacy" badge on PharmaConnect and request pharmacist verification at the counter.',
    actionLabelFr: 'Voir les officines vérifiées',
    actionLabelEn: 'View verified pharmacies',
    targetPage: 'Pharmacies',
  },
  {
    id: 'alert-seasonal-hydration',
    severity: 'vigilance',
    active: true,
    dateFr: 'Veille saisonnière',
    dateEn: 'Seasonal Watch',
    scopeFr: 'Chaleur & Pédiatrie',
    scopeEn: 'Heat & Pediatrics',
    image: '/images/prod-paracetamol.jpg',
    imageAltFr: 'Thermomètre clinique, masque de protection et comprimés antipyrétiques contre la fièvre',
    imageAltEn: 'Clinical thermometer, protective mask, and antipyretic tablets for fever care',
    titleFr: 'Prévention déshydratation & fièvres aiguës chez l’enfant',
    titleEn: 'Preventing Acute Dehydration & Fever Complications in Children',
    summaryFr: 'En cas de fièvre persistante, diarrhée ou refus de boire chez le nourrisson, l’administration précoce de SRO et une consultation rapide sont essentielles.',
    summaryEn: 'With persistent fever or diarrhea in infants, prompt oral rehydration salts (ORS) and medical triage are critical.',
    adviceFr: 'Gardez des sachets de SRO, un thermomètre fiable et consultez un médecin en cas de léthargie ou de fièvre > 38,5 °C.',
    adviceEn: 'Keep ORS packets and a digital thermometer on hand, and seek urgent medical evaluation if lethargy or fever > 38.5°C occurs.',
    actionLabelFr: 'Produits Bébé & Maternité',
    actionLabelEn: 'Baby & Maternity Products',
    targetPage: 'Produits',
    targetCategory: 'Bébé & maternité',
  },
  {
    id: 'alert-cold-chain',
    severity: 'vigilance',
    active: true,
    dateFr: 'Contrôle Officinal',
    dateEn: 'Pharmacy Cold-Chain',
    scopeFr: 'Chaîne du Froid',
    scopeEn: 'Cold Chain',
    image: '/images/hero-cinema-vitamins.jpg',
    imageAltFr: 'Flacons en verre ambré et solutions thermosensibles conservées sous chaîne du froid',
    imageAltEn: 'Amber glass dropper vials and temperature-sensitive formulations under cold-chain storage',
    titleFr: 'Conservation de l’insuline et des traitements thermosensibles (2 °C – 8 °C)',
    titleEn: 'Cold-Chain Handling for Insulin & Biologics (2°C – 8°C)',
    summaryFr: 'Les températures élevées altèrent rapidement l’efficacité de l’insuline, des collyres ouverts et de certains vaccins lors du transport.',
    summaryEn: 'High ambient temperatures rapidly reduce potency of insulin, opened eye drops, and vaccines during transit.',
    adviceFr: 'Prévoyez une pochette isotherme avec bloc réfrigérant lors du retrait en pharmacie et ne congelez jamais vos flacons.',
    adviceEn: 'Carry an insulated pouch with a cool pack when picking up cold-chain items and never freeze vials.',
    actionLabelFr: 'Vérifier les disponibilités',
    actionLabelEn: 'Check availability',
    targetPage: 'Produits',
    targetCategory: 'Médicaments',
  },
  {
    id: 'alert-antibiotics',
    severity: 'prevention',
    active: true,
    dateFr: 'Santé Publique',
    dateEn: 'Public Health',
    scopeFr: 'Bon Usage',
    scopeEn: 'Safe Medication Use',
    image: '/images/pharmacy-1.jpg',
    imageAltFr: 'Gélules d’ordonnance pharmaceutique et pilulier pour le respect strict de la posologie',
    imageAltEn: 'Prescription antibiotic capsules and pill bottle reminding patients to complete treatment',
    titleFr: 'Lutte contre l’antibiorésistance : respecter l’ordonnance jusqu’au bout',
    titleEn: 'Antibiotic Stewardship: Complete Prescribed Courses',
    summaryFr: 'Arrêter un antibiotique dès la disparition des symptômes favorise les rechutes et l’apparition de bactéries résistantes.',
    summaryEn: 'Stopping antibiotics early once symptoms improve drives relapse and antimicrobial resistance.',
    adviceFr: 'Ne réutilisez pas une ancienne boîte et demandez toujours avis au médecin ou au pharmacien avant toute prise.',
    adviceEn: 'Never reuse leftover antibiotics and always confirm dosing schedules with a pharmacist or physician.',
    actionLabelFr: 'Consulter le catalogue',
    actionLabelEn: 'Browse catalog',
    targetPage: 'Produits',
  },
];

export const DEFAULT_HEALTH_NEWS: HealthNewsItem[] = [
  {
    id: 'news-digital-watch',
    tagFr: 'Actualité Réseau',
    tagEn: 'Network Update',
    active: true,
    dateFr: 'Novembre 2026',
    dateEn: 'November 2026',
    readTime: '2 min',
    image: '/images/hero-smile.jpg',
    imageAltFr: 'Professionnelle de santé consultant la disponibilité des médicaments sur smartphone',
    imageAltEn: 'Healthcare professional checking medicine availability on smartphone',
    titleFr: 'Transparence des stocks : limiter les déplacements inutiles en urgence',
    titleEn: 'Live Stock Transparency: Reducing Unnecessary Travel in Emergencies',
    excerptFr: 'Les officines partenaires publient désormais leurs disponibilités déclarées et leurs horaires de permanence directement sur PharmaConnect.',
    excerptEn: 'Partner pharmacies now publish updated stock declarations and duty hours directly on PharmaConnect.',
    keyPointsFr: [
      'Consultez la fraîcheur de mise à jour affichée sur chaque fiche produit.',
      'Appelez ou écrivez directement au comptoir via WhatsApp avant de vous déplacer.',
      'Aucune transaction ou paiement en ligne : la délivrance reste 100 % encadrée en officine.',
    ],
    keyPointsEn: [
      'Check the freshness indicator shown on each product card.',
      'Call or message the pharmacy counter on WhatsApp before traveling.',
      'Zero online checkout: dispensing stays strictly under licensed pharmacist supervision.',
    ],
  },
  {
    id: 'news-chronic-monitoring',
    tagFr: 'Suivi Chronique',
    tagEn: 'Chronic Care',
    active: true,
    dateFr: 'Novembre 2026',
    dateEn: 'November 2026',
    readTime: '3 min',
    image: '/images/hero-cinema-care.jpg',
    imageAltFr: 'Équipement médical de surveillance clinique : stéthoscope, thermomètre et ampoule stérile',
    imageAltEn: 'Clinical home-monitoring medical equipment including stethoscope and thermometer',
    titleFr: 'Hypertension & Diabète : les bons réflexes de surveillance à domicile',
    titleEn: 'Hypertension & Diabetes: Home Monitoring Essentials',
    excerptFr: 'Un suivi régulier par tensiomètre brassard et lecteur de glycémie aide votre médecin à ajuster efficacement votre traitement.',
    excerptEn: 'Regular tracking with validated blood-pressure cuffs and glucometers supports safer medical adjustments.',
    keyPointsFr: [
      'Prenez votre tension après 5 minutes de repos, assis, bras posé à hauteur du cœur.',
      'Notez vos mesures dans un carnet de suivi avant chaque consultation médicale.',
      'Renouvelez vos bandelettes et traitements avant rupture complète de votre boîte.',
    ],
    keyPointsEn: [
      'Measure blood pressure seated after 5 minutes of rest with the cuff at heart level.',
      'Log readings before every clinical appointment.',
      'Refill monitoring strips and chronic medications ahead of running out.',
    ],
    targetCategory: 'Matériel médical',
  },
  {
    id: 'news-family-kit',
    tagFr: 'Premiers Secours',
    tagEn: 'First Aid',
    active: true,
    dateFr: 'Octobre 2026',
    dateEn: 'October 2026',
    readTime: '3 min',
    image: '/images/cat-medicaments.jpg',
    imageAltFr: 'Médicaments essentiels et plaquettes pharmaceutiques pour trousse familiale',
    imageAltEn: 'Essential blister packs and medicines for a family first-aid kit',
    titleFr: 'Composer une trousse d’urgence familiale fiable et à jour',
    titleEn: 'Building a Reliable, Up-to-Date Family First-Aid Kit',
    excerptFr: 'Antiseptique, sérum physiologique, compresses stériles, thermomètre et SRO constituent la base de prise en charge des petits incidents.',
    excerptEn: 'Antiseptics, saline vials, sterile gauze, a digital thermometer, and ORS form the core family emergency kit.',
    keyPointsFr: [
      'Contrôlez les dates de péremption tous les 6 mois.',
      'Conservez la trousse hors de portée des enfants, dans un endroit sec et tempéré.',
      'Gardez les numéros d’urgence (1313, 18, 17, HGRN) enregistrés sur votre téléphone.',
    ],
    keyPointsEn: [
      'Audit expiration dates every 6 months.',
      'Store out of children’s reach in a cool, dry place.',
      'Save local emergency numbers (1313, 18, 17, HGRN) in your phone contacts.',
    ],
    targetCategory: 'Hygiène',
  },
  {
    id: 'news-maternal-care',
    tagFr: 'Prévention',
    tagEn: 'Prevention',
    active: true,
    dateFr: 'Octobre 2026',
    dateEn: 'October 2026',
    readTime: '2 min',
    image: '/images/cat-hygiene.jpg',
    imageAltFr: 'Prévention vaccinale et suivi prénatal en milieu de soins sécurisé',
    imageAltEn: 'Clinical prevention and maternal antenatal care preparation',
    titleFr: 'Paludisme et grossesse : suivi prénatal et protection renforcée',
    titleEn: 'Malaria & Pregnancy: Antenatal Protection & Early Screening',
    excerptFr: 'Dormir sous moustiquaire imprégnée et respecter les visites prénatales réduisent fortement les complications maternelles et néonatales.',
    excerptEn: 'Insecticide-treated nets and scheduled antenatal visits significantly lower maternal and neonatal risk.',
    keyPointsFr: [
      'Consultez immédiatement devant toute fièvre, céphalée intense ou frissons.',
      'Ne prenez aucun antipaludéen ni antalgique sans validation médicale pendant la grossesse.',
      'Suivez le calendrier vaccinal et les supplémentations prescrites en centre de santé.',
    ],
    keyPointsEn: [
      'Seek prompt evaluation for any fever, chills, or severe headache.',
      'Avoid unprescribed medications during pregnancy.',
      'Follow prescribed antenatal supplementation and immunization visits.',
    ],
    targetCategory: 'Vitamines & bien-être',
  },
];
