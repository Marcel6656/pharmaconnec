import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ApiException implements Exception {
  ApiException(this.message, [this.statusCode]);
  final String message;
  final int? statusCode;
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();
  final http.Client _client;
  String? accessToken;

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('${AppConfig.apiBaseUrl}$path').replace(queryParameters: query);

  Future<dynamic> get(String path, {Map<String, String>? query}) async {
    final response = await _client.get(_uri(path, query), headers: _headers);
    return _decode(response);
  }

  Future<dynamic> post(String path, {Object? body}) async {
    final response = await _client.post(
      _uri(path),
      headers: _headers,
      body: jsonEncode(body ?? <String, dynamic>{}),
    );
    return _decode(response);
  }

  Future<dynamic> patch(String path, {Object? body}) async {
    final response = await _client.patch(
      _uri(path),
      headers: _headers,
      body: jsonEncode(body ?? <String, dynamic>{}),
    );
    return _decode(response);
  }

  Map<String, String> get _headers => {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        if (accessToken != null && accessToken!.isNotEmpty)
          'Authorization': 'Bearer $accessToken',
      };

  dynamic _decode(http.Response response) {
    final dynamic data =
        response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      String message = 'Une erreur est survenue (${response.statusCode}).';
      if (data is Map && data['message'] != null) {
        final raw = data['message'];
        message = raw is List ? raw.join(' · ') : raw.toString();
      }
      throw ApiException(message, response.statusCode);
    }
    return data;
  }
}
