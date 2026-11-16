class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://pharmaconnect-api.vercel.app',
  );

  static const String webBaseUrl = String.fromEnvironment(
    'WEB_BASE_URL',
    defaultValue: 'https://pharmaconnect-ten.vercel.app',
  );

  static const bool useDemoData = bool.fromEnvironment(
    'USE_DEMO_DATA',
    defaultValue: false,
  );

  static const String appName = 'PharmaConnect';

  static String resolveMediaUrl(String? rawUrl) {
    if (rawUrl == null || rawUrl.trim().isEmpty) return '';
    final trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/uploads/')) {
      return '$apiBaseUrl$trimmed';
    }
    if (trimmed.startsWith('/')) {
      return '$webBaseUrl$trimmed';
    }
    return trimmed;
  }
}
