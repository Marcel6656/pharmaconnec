import 'package:flutter/material.dart';
import '../../core/config/app_config.dart';
import '../../core/services/pharma_store.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/demo_data.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    super.key,
    required this.store,
    required this.onSearch,
    required this.onPharmacies,
    required this.onNews,
  });

  final PharmaStore store;
  final VoidCallback onSearch;
  final VoidCallback onPharmacies;
  final VoidCallback onNews;

  @override
  Widget build(BuildContext context) {
    final greetingName = store.currentUser?.name.split(' ').first;
    final pharmacies = store.pharmacies;
    final products = store.products;

    return RefreshIndicator(
      onRefresh: store.refreshState,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PharmaConnect',
                      style: TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                        color: AppColors.darkGreen,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Base officielle connectée en direct',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: store.refreshState,
                tooltip: 'Actualiser',
                icon: const Icon(Icons.refresh_rounded, size: 24),
              ),
              IconButton(
                onPressed: onNews,
                icon: const Icon(Icons.notifications_none_rounded, size: 26),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            greetingName != null && greetingName.isNotEmpty
                ? 'Bonjour $greetingName 👋'
                : 'Bonjour 👋',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 5),
          Text(
            '${pharmacies.length} pharmacie(s) validée(s) · ${products.length} produit(s) publié(s)',
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 16),
          if (store.errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1EE),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Connexion API : ${store.errorMessage}',
                style: const TextStyle(color: AppColors.danger, fontSize: 12),
              ),
            ),
            const SizedBox(height: 14),
          ],
          InkWell(
            onTap: onSearch,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(17),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Row(
                children: [
                  Icon(Icons.search, color: AppColors.green),
                  SizedBox(width: 12),
                  Text(
                    'Rechercher un médicament ou produit…',
                    style: TextStyle(color: AppColors.muted),
                  ),
                  Spacer(),
                  Icon(Icons.arrow_forward, color: AppColors.green),
                ],
              ),
            ),
          ),
          const SizedBox(height: 22),
          const _SectionTitle('Explorer'),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _QuickAction(
                  icon: Icons.medication_outlined,
                  label: 'Produits (${products.length})',
                  onTap: onSearch,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickAction(
                  icon: Icons.local_pharmacy_outlined,
                  label: 'Pharmacies (${pharmacies.length})',
                  onTap: onPharmacies,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickAction(
                  icon: Icons.health_and_safety_outlined,
                  label: 'Conseils santé',
                  onTap: onNews,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _SectionTitle('Produits disponibles', action: 'Voir tout', onTap: onSearch),
          const SizedBox(height: 10),
          if (store.loading && products.isEmpty)
            const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
          else if (products.isEmpty)
            const Text('Aucun produit publié pour le moment.', style: TextStyle(color: AppColors.muted))
          else
            ...products.take(4).map((p) {
              final ph = store.pharmacyById(p.pharmacyId);
              final imgUrl = AppConfig.resolveMediaUrl(p.imageDataUrl);
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: imgUrl.isNotEmpty
                          ? Image.network(
                              imgUrl,
                              width: 54,
                              height: 54,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const _FallbackThumb(Icons.medication_outlined),
                            )
                          : const _FallbackThumb(Icons.medication_outlined),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${p.category} · ${ph?.name ?? 'Officine vérifiée'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12, color: AppColors.muted),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          formatFcfa(p.price),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 12,
                            color: AppColors.darkGreen,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          p.stock > 0 ? '${p.stock} en stock' : 'Rupture',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: p.stock > 0 ? AppColors.green : AppColors.danger,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: 18),
          _SectionTitle('Pharmacies vérifiées', action: 'Voir tout', onTap: onPharmacies),
          const SizedBox(height: 10),
          ...pharmacies.take(3).map(
                (p) => _PharmacyPreview(
                  name: p.name,
                  cityArea: '${p.area}, ${p.city}',
                  productsCount: p.productsCount,
                ),
              ),
          const SizedBox(height: 18),
          _SectionTitle('Actualités de santé', action: 'Voir tout', onTap: onNews),
          const SizedBox(height: 10),
          ...demoNews.take(2).map(
                (n) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor:
                        n.urgent ? const Color(0xFFFFE3DF) : AppColors.mint,
                    child: Icon(
                      n.urgent
                          ? Icons.warning_amber_rounded
                          : Icons.article_outlined,
                      color: n.urgent ? AppColors.danger : AppColors.green,
                    ),
                  ),
                  title: Text(
                    n.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    n.category,
                    style: const TextStyle(fontSize: 11, color: AppColors.muted),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                ),
              ),
        ],
      ),
    );
  }
}

class _FallbackThumb extends StatelessWidget {
  const _FallbackThumb(this.icon);
  final IconData icon;

  @override
  Widget build(BuildContext context) => Container(
        width: 54,
        height: 54,
        decoration: BoxDecoration(
          color: AppColors.mint,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.green),
      );
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title, {this.action, this.onTap});
  final String title;
  final String? action;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
            ),
          ),
          if (action != null) TextButton(onPressed: onTap, child: Text(action!)),
        ],
      );
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          height: 100,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: AppColors.green, size: 27),
              const SizedBox(height: 9),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      );
}

class _PharmacyPreview extends StatelessWidget {
  const _PharmacyPreview({
    required this.name,
    required this.cityArea,
    required this.productsCount,
  });

  final String name;
  final String cityArea;
  final int productsCount;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 9),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            const CircleAvatar(
              backgroundColor: AppColors.mint,
              child: Icon(Icons.local_pharmacy_outlined, color: AppColors.green),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text(
                    cityArea,
                    style: const TextStyle(color: AppColors.muted, fontSize: 12),
                  ),
                ],
              ),
            ),
            Text(
              '$productsCount prod.',
              style: const TextStyle(
                color: AppColors.green,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ],
        ),
      );
}
