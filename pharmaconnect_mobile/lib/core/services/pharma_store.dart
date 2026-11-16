import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/pharma_models.dart';
import '../network/api_client.dart';

class PharmaStore extends ChangeNotifier {
  PharmaStore({ApiClient? api}) : _api = api ?? ApiClient();

  static const _tokenKey = 'pharmaconnect_visitor_token';
  final ApiClient _api;

  VisitorUser? currentUser;
  List<PublicPharmacy> pharmacies = [];
  List<PublicProduct> products = [];
  List<VisitorMessage> messages = [];
  List<PublicBadge> badges = [];
  List<String> platformCategories = [
    'Médicaments',
    'Vitamines',
    'Hygiène',
    'Matériel médical',
    'Parapharmacie',
    'Bébé & maternité',
  ];
  int freshnessDays = 7;

  bool loading = false;
  bool initialized = false;
  String? errorMessage;

  bool get isLoggedIn => currentUser != null;

  PublicPharmacy? pharmacyById(int id) {
    for (final p in pharmacies) {
      if (p.id == id) return p;
    }
    return null;
  }

  List<PublicBadge> badgesForPharmacy(PublicPharmacy pharmacy) =>
      badges.where((b) => pharmacy.badgeIds.contains(b.id)).toList();

  Future<void> init() async {
    if (initialized) return;
    initialized = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedToken = prefs.getString(_tokenKey);
      if (savedToken != null && savedToken.isNotEmpty) {
        _api.accessToken = savedToken;
        try {
          final me = await _api.get('/api/auth/me');
          if (me is Map<String, dynamic> && me['role'] == 'VISITOR') {
            currentUser = VisitorUser.fromJson(me);
          } else {
            _api.accessToken = null;
            await prefs.remove(_tokenKey);
          }
        } catch (_) {
          _api.accessToken = null;
          await prefs.remove(_tokenKey);
        }
      }
    } catch (_) {
      // Ignore storage failures in test environments.
    }
    await refreshState();
  }

  Future<void> refreshState() async {
    loading = true;
    errorMessage = null;
    notifyListeners();
    try {
      final data = await _api.get('/api/state');
      if (data is Map<String, dynamic>) {
        pharmacies = (data['pharmacies'] as List<dynamic>? ?? [])
            .map((e) => PublicPharmacy.fromJson(e as Map<String, dynamic>))
            .toList();
        products = (data['products'] as List<dynamic>? ?? [])
            .map((e) => PublicProduct.fromJson(e as Map<String, dynamic>))
            .toList();
        messages = (data['messages'] as List<dynamic>? ?? [])
            .map((e) => VisitorMessage.fromJson(e as Map<String, dynamic>))
            .toList();
        badges = (data['badges'] as List<dynamic>? ?? [])
            .map((e) => PublicBadge.fromJson(e as Map<String, dynamic>))
            .toList();
        final cats = (data['platformCategories'] as List<dynamic>? ?? [])
            .map((e) => e.toString())
            .where((e) => e.isNotEmpty)
            .toList();
        if (cats.isNotEmpty) platformCategories = cats;
        freshnessDays = (data['freshnessDays'] as num?)?.toInt() ?? 7;
      }
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> loginVisitor({
    required String email,
    required String password,
  }) async {
    final res = await _api.post(
      '/api/auth/login',
      body: {
        'email': email.trim().toLowerCase(),
        'password': password,
        'role': 'VISITOR',
      },
    );
    await _persistSession(res);
    await refreshState();
  }

  Future<void> registerVisitor({
    required String name,
    required String email,
    required String password,
  }) async {
    final res = await _api.post(
      '/api/auth/register',
      body: {
        'name': name.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );
    await _persistSession(res);
    await refreshState();
  }

  Future<void> updateProfile({required String name, String? phone}) async {
    final res = await _api.patch(
      '/api/auth/me',
      body: {
        'name': name.trim(),
        if (phone != null) 'phone': phone.trim(),
      },
    );
    if (res is Map<String, dynamic>) {
      currentUser = VisitorUser.fromJson(res);
      notifyListeners();
    }
  }

  Future<void> sendMessage({
    required int pharmacyId,
    required String sender,
    required String phone,
    required String subject,
    required String body,
  }) async {
    await _api.post(
      '/api/messages',
      body: {
        'pharmacyId': pharmacyId,
        'sender': sender.trim(),
        'phone': phone.trim(),
        if (currentUser != null) 'visitorEmail': currentUser!.email,
        'subject': subject.trim(),
        'body': body.trim(),
      },
    );
    await refreshState();
  }

  Future<void> replyToThread({
    required int threadId,
    required String body,
  }) async {
    await _api.post(
      '/api/messages/$threadId/visitor-reply',
      body: {'body': body.trim()},
    );
    await refreshState();
  }

  Future<void> logout() async {
    _api.accessToken = null;
    currentUser = null;
    messages = [];
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
    } catch (_) {}
    notifyListeners();
    await refreshState();
  }

  Future<void> _persistSession(dynamic res) async {
    if (res is! Map<String, dynamic>) {
      throw ApiException('Réponse de connexion invalide.');
    }
    final token = res['accessToken']?.toString();
    final userJson = res['user'] as Map<String, dynamic>?;
    if (token == null || token.isEmpty || userJson == null) {
      throw ApiException('Jeton de session manquant.');
    }
    _api.accessToken = token;
    currentUser = VisitorUser.fromJson(userJson);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
    } catch (_) {}
    notifyListeners();
  }
}

String formatFcfa(int amount) {
  final raw = amount.toString();
  final buf = StringBuffer();
  for (int i = 0; i < raw.length; i++) {
    if (i > 0 && (raw.length - i) % 3 == 0) buf.write(' ');
    buf.write(raw[i]);
  }
  return '${buf.toString()} FCFA';
}
