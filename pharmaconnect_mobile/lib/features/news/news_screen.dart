import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/demo_data.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});
  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  String filter = 'Toutes';
  final filters = ['Toutes', 'Alertes', 'Conseils', 'Actualités'];

  @override
  Widget build(BuildContext context) {
    final items = demoNews
        .where(
          (n) =>
              filter == 'Toutes' ||
              (filter == 'Alertes' && n.urgent) ||
              (filter == 'Conseils' && n.category == 'Prévention') ||
              (filter == 'Actualités' && !n.urgent && n.category != 'Prévention'),
        )
        .toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 12),
          child: Row(
            children: [
              const Expanded(
                child: Text(
                  'Actualités & alertes',
                  style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800),
                ),
              ),
              IconButton(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Les notifications seront reliées au backend.'),
                  ),
                ),
                icon: const Icon(Icons.notifications_none),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: filters
                .map(
                  (f) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(f),
                      selected: filter == f,
                      onSelected: (_) => setState(() => filter = f),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = items[index];
              return InkWell(
                onTap: () => showModalBottomSheet(
                  context: context,
                  showDragHandle: true,
                  isScrollControlled: true,
                  builder: (_) => Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.category,
                          style: TextStyle(
                            color: item.urgent ? AppColors.danger : AppColors.green,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text('Source : ${item.source}'),
                        const SizedBox(height: 6),
                        Text(
                          item.date,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                        const SizedBox(height: 18),
                        const Text(
                          'Le contenu détaillé sera fourni par les publications vérifiées de la plateforme web.',
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(
                      color: item.urgent ? const Color(0xFFF2C8C3) : AppColors.border,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        backgroundColor:
                            item.urgent ? const Color(0xFFFFE5E1) : AppColors.mint,
                        child: Icon(
                          item.urgent
                              ? Icons.warning_amber_rounded
                              : Icons.article_outlined,
                          color: item.urgent ? AppColors.danger : AppColors.green,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.category.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                letterSpacing: .5,
                                fontWeight: FontWeight.w800,
                                color:
                                    item.urgent ? AppColors.danger : AppColors.green,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item.title,
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 7),
                            Text(
                              '${item.source} · ${item.date}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.muted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.muted),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
