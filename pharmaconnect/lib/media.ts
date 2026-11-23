import { Pharmacy, Product } from '@/lib/shared';

const PHARMACY_COVERS = [
  '/images/pharmacy-1.jpg',
  '/images/pharmacy-2.jpg',
  '/images/pharmacy-3.jpg',
  '/images/pharmacy-interior.jpg',
];

const CATEGORY_IMAGES: Record<string, string> = {
  'Médicaments': '/images/cat-medicaments.jpg',
  'Vitamines': '/images/cat-vitamines.jpg',
  'Parapharmacie': '/images/cat-parapharmacie.jpg',
  'Hygiène': '/images/cat-hygiene.jpg',
  'Bébé & Maternité': '/images/cat-bebe.jpg',
  'Bébé & maternité': '/images/cat-bebe.jpg',
  'Matériel médical': '/images/cat-materiel.jpg',
};

/**
 * Returns the custom pharmacy cover image or a deterministic real photograph
 * from `/public/images` so every pharmacy card shows a crisp visual.
 */
export function getPharmacyCoverImage(pharmacy: Pick<Pharmacy, 'id' | 'coverImage'>): string {
  if (pharmacy.coverImage && pharmacy.coverImage.trim().length > 0) {
    return pharmacy.coverImage;
  }
  const index = Math.abs(Number(pharmacy.id) || 0) % PHARMACY_COVERS.length;
  return PHARMACY_COVERS[index];
}

/**
 * Returns the product photo or a curated real photograph matching its name or category.
 */
export function getProductImage(product: Pick<Product, 'id' | 'name' | 'category' | 'imageDataUrl'>): string {
  if (product.imageDataUrl && product.imageDataUrl.trim().length > 0) {
    return product.imageDataUrl;
  }

  const normalizedName = `${product.name || ''} ${product.category || ''}`.toLowerCase();
  if (normalizedName.includes('thermom')) return '/images/prod-thermometer.jpg';
  if (normalizedName.includes('masque')) return '/images/prod-masques.jpg';
  if (normalizedName.includes('sérum') || normalizedName.includes('serum')) return '/images/prod-serum.jpg';
  if (normalizedName.includes('gel')) return '/images/prod-gel.jpg';
  if (normalizedName.includes('crème') || normalizedName.includes('creme')) return '/images/prod-creme.jpg';
  if (normalizedName.includes('vitamin') || normalizedName.includes('vitamine')) return '/images/prod-vitaminc.jpg';
  if (normalizedName.includes('paracétamol') || normalizedName.includes('paracetamol') || normalizedName.includes('doliprane')) {
    return '/images/prod-paracetamol.jpg';
  }
  if (normalizedName.includes('bébé') || normalizedName.includes('bebe') || normalizedName.includes('maternit')) {
    return '/images/cat-bebe.jpg';
  }
  if (normalizedName.includes('matériel') || normalizedName.includes('materiel')) {
    return '/images/cat-materiel.jpg';
  }
  if (normalizedName.includes('hygi')) return '/images/prod-gel.jpg';
  if (normalizedName.includes('parapharm')) return '/images/prod-creme.jpg';
  if (normalizedName.includes('médicament') || normalizedName.includes('medicament')) {
    return '/images/prod-paracetamol.jpg';
  }

  return '/images/hero-cinema-medicines.jpg';
}

/**
 * Returns the real editorial photo matching a catalog category.
 */
export function getCategoryImage(category: string): string {
  if (CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }
  const lower = category.toLowerCase();
  if (lower.includes('vitamin')) return '/images/cat-vitamines.jpg';
  if (lower.includes('hygi')) return '/images/cat-hygiene.jpg';
  if (lower.includes('mat')) return '/images/cat-materiel.jpg';
  if (lower.includes('béb') || lower.includes('beb')) return '/images/cat-bebe.jpg';
  if (lower.includes('para')) return '/images/cat-parapharmacie.jpg';
  return '/images/cat-medicaments.jpg';
}
