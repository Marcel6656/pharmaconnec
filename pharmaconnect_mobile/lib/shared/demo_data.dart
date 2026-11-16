class DemoProduct {
  const DemoProduct(this.name, this.subtitle, this.price, this.stock, this.category);
  final String name, subtitle, price, stock, category;
}

class DemoPharmacy {
  const DemoPharmacy(this.name, this.address, this.distance, this.hours, this.rating);
  final String name, address, distance, hours, rating;
}

class DemoNews {
  const DemoNews(this.category, this.title, this.source, this.date, this.urgent);
  final String category, title, source, date;
  final bool urgent;
}

const demoProducts = [
  DemoProduct('Paracétamol 500 mg', 'Boîte de 16 comprimés', '1 250 FCFA', 'Déclaré disponible', 'Douleurs et fièvre'),
  DemoProduct('Vitamine C 500 mg', 'Boîte de 20 comprimés', '1 800 FCFA', 'Déclaré disponible', 'Vitamines'),
  DemoProduct('Solution antiseptique', 'Flacon de 100 ml', '2 000 FCFA', 'Disponibilité à confirmer', 'Premiers soins'),
  DemoProduct('Sérum physiologique', 'Unidoses', '1 000 FCFA', 'Déclaré disponible', 'Premiers soins'),
];

const demoPharmacies = [
  DemoPharmacy('Pharmacie Centrale', 'Centre-ville', '1,2 km', 'Ouverte selon horaires déclarés', '4,6'),
  DemoPharmacy('Pharmacie Santé Plus', 'Quartier résidentiel', '1,8 km', 'Horaires à confirmer', '4,4'),
  DemoPharmacy('Pharmacie du Marché', 'Près du marché', '2,4 km', 'Horaires à confirmer', '4,2'),
];

const demoNews = [
  DemoNews('Alerte sanitaire', 'Suivez les recommandations officielles de prévention.', 'Source officielle à confirmer', 'Publication de démonstration', true),
  DemoNews('Prévention', 'Quelques gestes simples pour mieux prévenir les infections.', 'Contenu éducatif de démonstration', 'Publication de démonstration', false),
  DemoNews('Actualité santé', 'Retrouvez les informations sanitaires vérifiées.', 'Source officielle à confirmer', 'Publication de démonstration', false),
];
