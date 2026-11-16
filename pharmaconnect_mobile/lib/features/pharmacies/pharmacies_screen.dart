import 'package:flutter/material.dart';
import '../../core/config/app_config.dart';
import '../../core/models/pharma_models.dart';
import '../../core/services/pharma_store.dart';
import '../../core/theme/app_theme.dart';

class PharmaciesScreen extends StatefulWidget {
  const PharmaciesScreen({super.key, required this.store});
  final PharmaStore store;

  @override
  State<PharmaciesScreen> createState() => _PharmaciesScreenState();
}

class _PharmaciesScreenState extends State<PharmaciesScreen> {
  bool showMap = false;
  String query = '';

  Future<void> _openMessageModal(PublicPharmacy p) async {
    final senderCtrl =
        TextEditingController(text: widget.store.currentUser?.name ?? '');
    final phoneCtrl =
        TextEditingController(text: widget.store.currentUser?.phone ?? '');
    final subjectCtrl =
        TextEditingController(text: 'Renseignement · ${p.name}');
    final bodyCtrl = TextEditingController();
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
                const SizedBox(height: 4),
                Text(
                  '${p.address} · ${p.phone}',
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
                const SizedBox(height: 14),
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
                  controller: subjectCtrl,
                  decoration: const InputDecoration(labelText: 'Objet *'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: bodyCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Message *'),
                ),
                const SizedBox(height: 14),
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
                              pharmacyId: p.id,
                              sender: senderCtrl.text,
                              phone: phoneCtrl.text,
                              subject: subjectCtrl.text,
                              body: bodyCtrl.text,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Message envoyé à l’officine.'),
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
                  child: Text(sending ? 'Envoi…' : 'Envoyer'),
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
    final q = query.trim().toLowerCase();
    final items = widget.store.pharmacies.where((p) {
      if (q.isEmpty) return true;
      return '${p.name} ${p.area} ${p.city} ${p.address}'
          .toLowerCase()
          .contains(q);
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 10),
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFEAF0ED),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _ModeButton(
                    label: 'Liste (${items.length})',
                    icon: Icons.list,
                    selected: !showMap,
                    onTap: () => setState(() => showMap = false),
                  ),
                ),
                Expanded(
                  child: _ModeButton(
                    label: 'Carte',
                    icon: Icons.map_outlined,
                    selected: showMap,
                    onTap: () => setState(() => showMap = true),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (!showMap)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: TextField(
              onChanged: (v) => setState(() => query = v),
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Nom de pharmacie, quartier ou ville…',
              ),
            ),
          ),
        Expanded(
          child: showMap
              ? _MapPlaceholder(
                  pharmacies: items,
                  onBackToList: () => setState(() => showMap = false),
                )
              : RefreshIndicator(
                  onRefresh: widget.store.refreshState,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    children: [
                      const Text(
                        'Pharmacies agréées',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Établissements vérifiés et actifs sur PharmaConnect.',
                        style: TextStyle(color: AppColors.muted, fontSize: 12),
                      ),
                      const SizedBox(height: 14),
                      if (items.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 28),
                          child: Center(
                            child: Text('Aucune pharmacie enregistrée trouvée.'),
                          ),
                        )
                      else
                        ...items.map((p) {
                          final coverUrl = AppConfig.resolveMediaUrl(p.coverImage);
                          final phBadges = widget.store.badgesForPharmacy(p);
                          return Container(
                            margin: const EdgeInsets.only(bottom: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (coverUrl.isNotEmpty)
                                  Image.network(
                                    coverUrl,
                                    height: 130,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                                  ),
                                Padding(
                                  padding: const EdgeInsets.all(15),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const CircleAvatar(
                                            backgroundColor: AppColors.mint,
                                            child: Icon(
                                              Icons.local_pharmacy_outlined,
                                              color: AppColors.green,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              p.name,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w800,
                                                fontSize: 15,
                                              ),
                                            ),
                                          ),
                                          const Icon(
                                            Icons.verified,
                                            color: AppColors.green,
                                            size: 18,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        '${p.area}, ${p.city} — ${p.address}',
                                        style: const TextStyle(
                                          color: AppColors.muted,
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          Text(
                                            '${p.productsCount} produit(s)',
                                            style: const TextStyle(
                                              color: AppColors.green,
                                              fontWeight: FontWeight.w700,
                                              fontSize: 12,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          const Text('•', style: TextStyle(color: AppColors.muted)),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              p.phone,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: AppColors.muted,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (phBadges.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Wrap(
                                          spacing: 6,
                                          runSpacing: 6,
                                          children: phBadges
                                              .take(2)
                                              .map(
                                                (b) => Chip(
                                                  label: Text(
                                                    b.name,
                                                    style: const TextStyle(fontSize: 11),
                                                  ),
                                                  visualDensity: VisualDensity.compact,
                                                ),
                                              )
                                              .toList(),
                                        ),
                                      ],
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          FilledButton.icon(
                                            onPressed: () => _openMessageModal(p),
                                            icon: const Icon(Icons.chat_bubble_outline, size: 16),
                                            label: const Text('Contacter'),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                    ],
                  ),
                ),
        ),
      ],
    );
  }
}

class _ModeButton extends StatelessWidget {
  const _ModeButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(11),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(
            color: selected ? AppColors.green : Colors.transparent,
            borderRadius: BorderRadius.circular(11),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: selected ? Colors.white : AppColors.muted,
              ),
              const SizedBox(width: 7),
              Text(
                label,
                style: TextStyle(
                  color: selected ? Colors.white : AppColors.muted,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      );
}

class _MapPlaceholder extends StatelessWidget {
  const _MapPlaceholder({
    required this.pharmacies,
    required this.onBackToList,
  });
  final List<PublicPharmacy> pharmacies;
  final VoidCallback onBackToList;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        decoration: BoxDecoration(
          color: const Color(0xFFEAF3EF),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
        ),
        child: Stack(
          children: [
            Positioned.fill(child: CustomPaint(painter: _MapGridPainter())),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.map_outlined, size: 54, color: AppColors.green),
                  const SizedBox(height: 12),
                  Text(
                    '${pharmacies.length} officine(s) localisée(s)',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  ...pharmacies.take(3).map(
                        (p) => Text(
                          '${p.name} (${p.lat?.toStringAsFixed(3) ?? '-'}, ${p.lng?.toStringAsFixed(3) ?? '-'})',
                          style: const TextStyle(color: AppColors.muted, fontSize: 12),
                        ),
                      ),
                ],
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: FilledButton.icon(
                onPressed: onBackToList,
                icon: const Icon(Icons.list),
                label: const Text('Revenir à la liste'),
              ),
            ),
          ],
        ),
      );
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFD5E6DE)
      ..strokeWidth = 2;
    for (double x = 20; x < size.width; x += 48) {
      canvas.drawLine(Offset(x, 0), Offset(x + 35, size.height), paint);
    }
    for (double y = 20; y < size.height; y += 48) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y + 20), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
