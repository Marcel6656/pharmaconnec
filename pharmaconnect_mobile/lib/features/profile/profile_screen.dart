import 'package:flutter/material.dart';
import '../../core/services/pharma_store.dart';
import '../../core/theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({
    super.key,
    required this.store,
    required this.onOpenAuth,
    required this.onLogout,
  });

  final PharmaStore store;
  final VoidCallback onOpenAuth;
  final Future<void> Function() onLogout;

  Future<void> _editProfile(BuildContext context) async {
    final user = store.currentUser;
    if (user == null) {
      onOpenAuth();
      return;
    }
    final nameCtrl = TextEditingController(text: user.name);
    final phoneCtrl = TextEditingController(text: user.phone ?? '');
    bool saving = false;

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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Modifier mon profil visiteur',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Nom complet *'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Téléphone'),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: saving
                    ? null
                    : () async {
                        if (nameCtrl.text.trim().length < 2) return;
                        setSheetState(() => saving = true);
                        try {
                          await store.updateProfile(
                            name: nameCtrl.text,
                            phone: phoneCtrl.text,
                          );
                          if (ctx.mounted) Navigator.pop(ctx);
                        } catch (e) {
                          setSheetState(() => saving = false);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(e.toString())),
                            );
                          }
                        }
                      },
                child: Text(saving ? 'Enregistrement…' : 'Enregistrer'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _replyToThread(BuildContext context, int threadId) async {
    final replyCtrl = TextEditingController();
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Répondre à l’officine'),
        content: TextField(
          controller: replyCtrl,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Votre réponse…'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () async {
              if (replyCtrl.text.trim().isEmpty) return;
              await store.replyToThread(
                threadId: threadId,
                body: replyCtrl.text,
              );
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = store.currentUser;
    final rootThreads = store.messages.where((m) => m.threadId == null).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 30),
      children: [
        const Text(
          'Mon espace visiteur',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const CircleAvatar(
                radius: 29,
                backgroundColor: AppColors.mint,
                child: Icon(Icons.person_outline, color: AppColors.green, size: 30),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.name ?? 'Visiteur invité',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user != null
                          ? '${user.email}${user.phone != null && user.phone!.isNotEmpty ? ' · ${user.phone}' : ''}'
                          : 'Connectez-vous pour retrouver vos discussions.',
                      style: const TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        if (user == null)
          FilledButton.icon(
            onPressed: onOpenAuth,
            icon: const Icon(Icons.login_rounded),
            label: const Text('Se connecter / Créer un compte visiteur'),
          )
        else ...[
          const Text('Mes discussions', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          if (rootThreads.isEmpty)
            const Text(
              'Aucun échange pour le moment. Contactez une pharmacie depuis Produits ou Pharmacies.',
              style: TextStyle(color: AppColors.muted, fontSize: 12),
            )
          else
            ...rootThreads.map((thread) {
              final ph = store.pharmacyById(thread.pharmacyId);
              final replies = store.messages
                  .where((m) => m.threadId == thread.id)
                  .toList();
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            thread.subject,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                        Text(
                          thread.date,
                          style: const TextStyle(fontSize: 11, color: AppColors.muted),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ph?.name ?? 'Officine',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(thread.body, style: const TextStyle(fontSize: 13)),
                    if (replies.isNotEmpty) ...[
                      const Divider(height: 16),
                      ...replies.map(
                        (r) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(
                            '${r.direction == 'pharmacy' ? 'Officine' : 'Vous'} : ${r.body}',
                            style: const TextStyle(fontSize: 12, color: AppColors.ink),
                          ),
                        ),
                      ),
                    ],
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => _replyToThread(context, thread.id),
                        child: const Text('Répondre'),
                      ),
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: 12),
        ],
        const Text('Mon compte', style: TextStyle(fontWeight: FontWeight.w800)),
        _ProfileItem(
          icon: Icons.person_outline,
          title: 'Informations personnelles',
          subtitle: 'Nom, téléphone et adresse e-mail',
          onTap: () => _editProfile(context),
        ),
        _ProfileItem(
          icon: Icons.sync_rounded,
          title: 'Actualiser les données',
          subtitle: 'Synchroniser avec la base PharmaConnect',
          onTap: () => store.refreshState(),
        ),
        _ProfileItem(
          icon: Icons.info_outline,
          title: 'À propos de PharmaConnect',
          onTap: () => showAboutDialog(
            context: context,
            applicationName: 'PharmaConnect',
            applicationVersion: '1.0.0',
            applicationLegalese: 'Application mobile visiteur connectée à PharmaConnect.',
          ),
        ),
        if (user != null) ...[
          const SizedBox(height: 18),
          OutlinedButton.icon(
            onPressed: onLogout,
            icon: const Icon(Icons.logout, color: AppColors.danger),
            label: const Text(
              'Se déconnecter',
              style: TextStyle(color: AppColors.danger),
            ),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: Color(0xFFF0D2CE)),
            ),
          ),
        ],
      ],
    );
  }
}

class _ProfileItem extends StatelessWidget {
  const _ProfileItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon, color: AppColors.green),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        subtitle: subtitle == null
            ? null
            : Text(
                subtitle!,
                style: const TextStyle(fontSize: 11, color: AppColors.muted),
              ),
        trailing: const Icon(Icons.chevron_right, color: AppColors.muted),
        onTap: onTap,
      );
}
