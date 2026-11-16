import 'package:flutter/material.dart';
import 'core/services/pharma_store.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_screen.dart';
import 'features/home/home_screen.dart';
import 'features/news/news_screen.dart';
import 'features/pharmacies/pharmacies_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/search/search_screen.dart';

class PharmaConnectApp extends StatefulWidget {
  const PharmaConnectApp({super.key});

  @override
  State<PharmaConnectApp> createState() => _PharmaConnectAppState();
}

class _PharmaConnectAppState extends State<PharmaConnectApp> {
  final PharmaStore _store = PharmaStore();

  @override
  void initState() {
    super.initState();
    _store.init();
  }

  @override
  void dispose() {
    _store.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _store,
        builder: (context, _) => MaterialApp(
          title: 'PharmaConnect',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          home: _AppGate(store: _store),
        ),
      );
}

class _AppGate extends StatefulWidget {
  const _AppGate({required this.store});
  final PharmaStore store;

  @override
  State<_AppGate> createState() => _AppGateState();
}

class _AppGateState extends State<_AppGate> {
  bool guestMode = false;

  @override
  Widget build(BuildContext context) {
    final enterApp = widget.store.isLoggedIn || guestMode;
    if (!enterApp) {
      return AuthScreen(
        store: widget.store,
        onAuthenticated: () => setState(() {}),
        onContinueGuest: () => setState(() => guestMode = true),
      );
    }

    return _MainShell(
      store: widget.store,
      onOpenAuth: () => setState(() => guestMode = false),
      onLogout: () async {
        await widget.store.logout();
        if (mounted) setState(() => guestMode = false);
      },
    );
  }
}

class _MainShell extends StatefulWidget {
  const _MainShell({
    required this.store,
    required this.onOpenAuth,
    required this.onLogout,
  });

  final PharmaStore store;
  final VoidCallback onOpenAuth;
  final Future<void> Function() onLogout;

  @override
  State<_MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<_MainShell> {
  int selectedIndex = 0;

  void _go(int index) => setState(() => selectedIndex = index);

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        store: widget.store,
        onSearch: () => _go(1),
        onPharmacies: () => _go(2),
        onNews: () => _go(3),
      ),
      SearchScreen(store: widget.store),
      PharmaciesScreen(store: widget.store),
      const NewsScreen(),
      ProfileScreen(
        store: widget.store,
        onOpenAuth: widget.onOpenAuth,
        onLogout: widget.onLogout,
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: IndexedStack(index: selectedIndex, children: screens),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: _go,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Accueil',
          ),
          NavigationDestination(
            icon: Icon(Icons.search),
            label: 'Produits',
          ),
          NavigationDestination(
            icon: Icon(Icons.location_on_outlined),
            selectedIcon: Icon(Icons.location_on),
            label: 'Pharmacies',
          ),
          NavigationDestination(
            icon: Icon(Icons.article_outlined),
            selectedIcon: Icon(Icons.article),
            label: 'Actualités',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
