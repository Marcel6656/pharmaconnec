export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      pharmacies: 'Pharmacies',
      products: 'Produits',
      pricing: 'Formules',
      about: 'À propos',
      contact: 'Contact',
      spaceCaption: 'ESPACE PROFESSIONNEL',
      pharmacySpace: 'Espace pharmacie',
      myAccount: 'Mon compte',
      visitor: 'Visiteur',
      searchPlaceholder: 'Rechercher un produit ou une officine…'
    },
    hero: {
      kicker: 'VOTRE SANTÉ, NOTRE PRIORITÉ AU QUOTIDIEN',
      title1: 'Des Soins Proches,',
      title2: 'Une Vie Plus Saine.',
      handwriting: 'À vos côtés ♡',
      desc: 'Trouvez instantanément vos médicaments disponibles et les pharmacies agréées les plus proches. Un pont numérique transparent entre les officines de santé et les patients.',
      bookAppointment: 'Trouver une pharmacie',
      watchVideo: 'Voir le catalogue',
      trustCare: 'Officines Agréées',
      trustCareSub: 'Professionnels vérifiés',
      allAges: 'Toute la Famille',
      allAgesSub: 'Conseils & orientation',
      modernTech: 'Stocks en Direct',
      modernTechSub: 'Disponibilités réelles',
      bookingTitle: 'Recherche rapide d’officine',
      bookingDesc: 'Vérifiez vos soins et localisez une pharmacie ouverte près de vous.',
      fullName: 'Produit ou besoin recherché',
      phone: 'Ville ou quartier (ex. Moursal)',
      selectDate: 'Date souhaitée',
      selectService: 'Catégorie ou urgence',
      services: {
        general: 'Médicaments & Soins courants',
        orthodontics: 'Ordonnances & Traitements',
        pediatric: 'Bébé & Maternité',
        emergency: 'Garde & Urgences 24h/7j'
      },
      bookNow: 'Rechercher une pharmacie',
      secureInfo: 'Consultation publique sans compte ni paiement en ligne.'
    },
    services: {
      eyebrow: 'UN ACCOMPAGNEMENT COMPLET POUR CHAQUE PATIENT',
      title: 'Nos Services de Santé',
      desc: 'Une prise en charge globale pour vos soins, prescriptions et bien-être.',
      viewAll: 'Voir tout le catalogue',
      learnMore: 'En savoir plus',
      findOpen: 'Trouver de garde',
      items: [
        {
          title: 'Soins Généraux',
          desc: 'Médicaments essentiels, conseils & délivrance sécurisée.'
        },
        {
          title: 'Spécialités & Vitalité',
          desc: 'Suivi tensionnel, glycémie & vitamines énergétiques.'
        },
        {
          title: 'Matériel Médical',
          desc: 'Tensiomètres, thermomètres & matériel de maintien.'
        },
        {
          title: 'Dermatologie & Soins',
          desc: 'Parapharmacie, hygiène & dermo-cosmétique ciblée.'
        },
        {
          title: 'Bébé & Maternité',
          desc: 'Nutrition infantile, soins douceur & périnatalité.'
        },
        {
          title: 'Urgences & Gardes',
          desc: 'Permanence des soins et officines ouvertes 24h/7j.'
        }
      ]
    },
    approach: {
      kicker: 'UNE EXPÉRIENCE DE SOIN APAISANTE',
      title1: 'Des Soins Modernes.',
      title2: 'Une Approche Bienveillante.',
      desc: 'Nous combinons la transparence numérique avec une écoute chaleureuse pour rendre chaque recherche de soin simple, rapide et rassurante.',
      learnMore: 'En savoir plus',
      badge: 'Réseau d’Officines Agréées',
      quote: '« Trouver mon traitement en urgence un dimanche soir n’a jamais été aussi simple. Le service est rapide, fiable et très rassurant ! »',
      author: '— Jessica R.',
      role: 'Patiente suivie'
    },
    metrics: {
      patients: '100%',
      patientsLabel: 'Officines vérifiées',
      rating: '24h/7j',
      ratingLabel: 'Repérage de garde',
      experience: 'Temps réel',
      experienceLabel: 'Prix & stocks actualisés',
      futures: 'Sans commande',
      futuresLabel: 'Contact direct officine'
    },
    common: {
      quickTags: 'Recherches fréquentes :',
      verifiedPharmacies: 'Pharmacies partenaires agréées',
      verifiedPharmaciesDesc: 'Officines de santé vérifiées et contrôlées par notre équipe.',
      allPharmacies: 'Toutes les pharmacies',
      recentProducts: 'Derniers produits & soins actualisés',
      recentProductsDesc: 'Disponibilités déclarées par les officines.',
      allCatalog: 'Tout le catalogue',
      pharmacistTitle: 'Vous êtes titulaire d’une pharmacie agréée ?',
      pharmacistDesc: 'Rejoignez le réseau PharmaConnect pour digitaliser votre officine, publier vos disponibilités et renforcer votre visibilité auprès des patients.',
      registerPharmacy: 'Inscrire mon officine',
      viewPlans: 'Découvrir les formules',
      trialDays: '14 jours',
      trialOffered: 'd’essai offert'
    }
  },
  en: {
    nav: {
      home: 'Home',
      pharmacies: 'Pharmacies',
      products: 'Products',
      pricing: 'Plans',
      about: 'About',
      contact: 'Contact',
      spaceCaption: 'PROFESSIONAL PORTAL',
      pharmacySpace: 'Pharmacy Portal',
      myAccount: 'My Account',
      visitor: 'Visitor',
      searchPlaceholder: 'Search product or pharmacy…'
    },
    hero: {
      kicker: 'CARING TODAY FOR BRIGHTER TOMORROWS',
      title1: 'Verified Pharmacies,',
      title2: 'Healthier Lives.',
      handwriting: 'Close to You ♡',
      desc: 'Verified local pharmacy network & live stock directory for you and your family. Instantly locate medicines and certified pharmacies nearby.',
      bookAppointment: 'Find a Pharmacy',
      watchVideo: 'Browse Catalog',
      trustCare: 'Trusted Care',
      trustCareSub: 'Certified pharmacies',
      allAges: 'Whole Family',
      allAgesSub: 'Public access 24/7',
      modernTech: 'Live Inventory',
      modernTechSub: 'Fresh stock updates',
      bookingTitle: 'Quick Pharmacy Finder',
      bookingDesc: 'Check medicine availability and locate open pharmacies near you.',
      fullName: 'Medicine or product needed',
      phone: 'City or neighborhood',
      selectDate: 'Select Date',
      selectService: 'Select Category',
      services: {
        general: 'Essential Medicines & Care',
        orthodontics: 'Prescriptions & Treatments',
        pediatric: 'Pediatrics & Baby Care',
        emergency: 'Emergency & On-call 24/7'
      },
      bookNow: 'Search Pharmacies',
      secureInfo: 'Free public consultation with direct pharmacy contact.'
    },
    services: {
      eyebrow: 'COMPREHENSIVE PHARMACY SUPPORT',
      title: 'Our Categories',
      desc: 'Verified medications, daily care and real-time stock declarations.',
      viewAll: 'View All Products',
      learnMore: 'Learn More',
      findOpen: 'Find Open',
      items: [
        {
          title: 'General Healthcare',
          desc: 'Essential medicines, guidance & pharmacist contact.'
        },
        {
          title: 'Specialty & Vitality',
          desc: 'Blood pressure tracking, glucose & vitamins.'
        },
        {
          title: 'Medical Equipment',
          desc: 'Monitors, digital thermometers & home care.'
        },
        {
          title: 'Cosmetic & Derma',
          desc: 'Dermocosmetics, skincare & personal hygiene.'
        },
        {
          title: 'Pediatric & Baby',
          desc: 'Gentle care, infant nutrition & maternity.'
        },
        {
          title: 'Emergency Care',
          desc: 'On-duty pharmacies available when you need us most.'
        }
      ]
    },
    approach: {
      kicker: 'A CALMER PHARMACY & HEALTH EXPERIENCE',
      title1: 'Modern Care.',
      title2: 'A Kinder Approach.',
      desc: 'We combine advanced technology with a warm, friendly approach to make every visit comfortable and stress-free.',
      learnMore: 'Learn More',
      badge: 'Certified Pharmacy Network',
      quote: '“Checking stock availability and contacting the pharmacy before heading out made my visit so much easier!”',
      author: '— Patient Feedback',
      role: 'PharmaConnect User'
    },
    metrics: {
      patients: '100%',
      patientsLabel: 'Verified Pharmacies',
      rating: '24/7',
      ratingLabel: 'On-Duty Finder',
      experience: 'Live',
      experienceLabel: 'Fresh Stock Updates',
      futures: 'Direct',
      futuresLabel: 'Pharmacy Contact'
    },
    common: {
      quickTags: 'Trending searches:',
      verifiedPharmacies: 'Verified Partner Pharmacies',
      verifiedPharmaciesDesc: 'Certified healthcare establishments inspected by our team.',
      allPharmacies: 'All pharmacies',
      recentProducts: 'Latest Updated Products & Care',
      recentProductsDesc: 'Live availabilities declared by pharmacies.',
      allCatalog: 'Explore catalog',
      pharmacistTitle: 'Are you a licensed pharmacist?',
      pharmacistDesc: 'Join the PharmaConnect network to digitalize your pharmacy, publish availabilities, and expand patient reach.',
      registerPharmacy: 'Register my pharmacy',
      viewPlans: 'Explore plans',
      trialDays: '14 days',
      trialOffered: 'free trial'
    }
  }
};
