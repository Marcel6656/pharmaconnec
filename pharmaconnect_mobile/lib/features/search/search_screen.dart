import 'package:flutter/material.dart';
import '../../core/config/app_config.dart';
import '../../core/models/pharma_models.dart';
import '../../core/services/pharma_store.dart';
import '../../core/theme/app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.store});
  final PharmaStore store;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final controller = TextEditingController();
  String query = '';
  String category = 'Tous';

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> _openContactSheet(PublicProduct p, PublicPharmacy? ph) async {
    final senderCtrl =
        TextEditingController(text: widget.store.currentUser?.name ?? '');
    final phoneCtrl =
        TextEditingController(text: widget.store.currentUser?.phone ?? '');
    final bodyCtrl = TextEditingController(
      text: 'Bonjour, le produit "${p.name}" est-il disponible actuellement ?',
    );
    bool sending = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
            24,
            8,
            24,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  p.name,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(
                  '${ph?.name ?? 'Officine vérifiée'} · ${formatFcfa(p.price)}',
                  style: const TextStyle(color: AppColors.green, fontWeight: FontWeight.w700),
                ),
                if (p.description.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(p.description, style: const TextStyle(color: AppColors.muted, fontSize: 13)),
                ],
                const SizedBox(height: 16),
                TextField(
                  controller: senderCtrl,
                  decoration: const InputDecoration(labelText: 'Votre nom *'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Téléphone *'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: bodyCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Message à la pharmacie *'),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: sending
                      ? null
                      : () async {
                          if (senderCtrl.text.trim().isEmpty ||
                              phoneCtrl.text.trim().isEmpty ||
                              bodyCtrl.text.trim().isEmpty) {
                            return;
                          }
                          setSheetState(() => sending = true);
                          try {
                            await widget.store.sendMessage(
                              pharmacyId: p.pharmacyId,
                              sender: senderCtrl.text,
                              phone: phoneCtrl.text,
                              subject: 'Disponibilité : ${p.name}',
                              body: bodyCtrl.text,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Message envoyé à la pharmacie.'),
                                ),
                              );
                            }
                          } catch (e) {
                            setSheetState(() => sending = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                            }
                          }
                        },
                  child: Text(sending ? 'Envoi…' : 'Envoyer le message'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = ['Tous', ...widget.store.platformCategories];
    final q = query.trim().toLowerCase();
    final results = widget.store.products.where((p) {
      final ph = widget.store.pharmacyById(p.pharmacyId);
      final matchesCat = category == 'Tous' || p.category == category;
      final haystack =
          '${p.name} ${p.brand} ${p.category} ${ph?.name ?? ''}'.toLowerCase();
      return matchesCat && (q.isEmpty || haystack.contains(q));
    }).toList();

    return RefreshIndicator(
      onRefresh: widget.store.refreshState,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 12),
            child: TextField(
              controller: controller,
              onChanged: (v) => setState(() => query = v),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Médicament, marque ou pharmacie…',
                suffixIcon: query.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          controller.clear();
                          setState(() => query = '');
                        },
                        icon: const Icon(Icons.close),
                      ),
              ),
            ),
          ),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: categories
                  .map(
                    (c) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(c),
                        selected: category == c,
                        onSelected: (_) => setState(() => category = c),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          Expanded(
            child: results.isEmpty
                ? const Center(
                    child: Text('Aucun produit publié ne correspond à votre recherche.'),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                    itemCount: results.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final p = results[index];
                      final ph = widget.store.pharmacyById(p.pharmacyId);
                      final imgUrl = AppConfig.resolveMediaUrl(p.imageDataUrl);
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(vertical: 8),
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: imgUrl.isNotEmpty
                              ? Image.network(
                                  imgUrl,
                                  width: 54,
                                  height: 54,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => _ThumbBox(),
                                )
                              : _ThumbBox(),
                        ),
                        title: Text(
                          p.name,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        subtitle: Text(
                          '${ph?.name ?? 'Officine vérifiée'} · ${formatFcfa(p.price)}\n${p.stock > 0 ? '${p.stock} en stock' : 'Rupture'}',
                          style: const TextStyle(fontSize: 12, height: 1.5),
                        ),
                        isThreeLine: true,
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => _openContactSheet(p, ph),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ThumbBox extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
        width: 54,
        height: 54,
        decoration: BoxDecoration(
          color: AppColors.mint,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(
          Icons.medication_outlined,
          color: AppColors.green,
          size: 28,
        ),
      );
}
