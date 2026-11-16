class VisitorUser {
  const VisitorUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.provider,
    this.phone,
  });

  final int id;
  final String email;
  final String name;
  final String role;
  final String provider;
  final String? phone;

  factory VisitorUser.fromJson(Map<String, dynamic> json) => VisitorUser(
        id: (json['id'] as num?)?.toInt() ?? 0,
        email: json['email']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        role: json['role']?.toString() ?? 'VISITOR',
        provider: json['provider']?.toString() ?? 'email',
        phone: json['phone']?.toString(),
      );
}

class PublicPharmacy {
  const PublicPharmacy({
    required this.id,
    required this.name,
    required this.city,
    required this.area,
    required this.address,
    required this.phone,
    required this.email,
    required this.responsible,
    required this.status,
    required this.badgeIds,
    required this.productsCount,
    required this.updated,
    this.lat,
    this.lng,
    this.coverImage,
  });

  final int id;
  final String name;
  final String city;
  final String area;
  final String address;
  final String phone;
  final String email;
  final String responsible;
  final String status;
  final List<int> badgeIds;
  final int productsCount;
  final String updated;
  final double? lat;
  final double? lng;
  final String? coverImage;

  factory PublicPharmacy.fromJson(Map<String, dynamic> json) => PublicPharmacy(
        id: (json['id'] as num?)?.toInt() ?? 0,
        name: json['name']?.toString() ?? '',
        city: json['city']?.toString() ?? '',
        area: json['area']?.toString() ?? '',
        address: json['address']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        responsible: json['responsible']?.toString() ?? '',
        status: json['status']?.toString() ?? '',
        badgeIds: (json['badgeIds'] as List<dynamic>? ?? [])
            .map((e) => (e as num).toInt())
            .toList(),
        productsCount: (json['products'] as num?)?.toInt() ?? 0,
        updated: json['updated']?.toString() ?? '',
        lat: (json['lat'] as num?)?.toDouble(),
        lng: (json['lng'] as num?)?.toDouble(),
        coverImage: json['coverImage']?.toString(),
      );
}

class PublicProduct {
  const PublicProduct({
    required this.id,
    required this.pharmacyId,
    required this.name,
    required this.category,
    required this.brand,
    required this.code,
    required this.price,
    required this.stock,
    required this.status,
    required this.updated,
    required this.description,
    this.stockUpdatedAt,
    this.imageDataUrl,
  });

  final int id;
  final int pharmacyId;
  final String name;
  final String category;
  final String brand;
  final String code;
  final int price;
  final int stock;
  final String status;
  final String updated;
  final String description;
  final String? stockUpdatedAt;
  final String? imageDataUrl;

  factory PublicProduct.fromJson(Map<String, dynamic> json) => PublicProduct(
        id: (json['id'] as num?)?.toInt() ?? 0,
        pharmacyId: (json['pharmacyId'] as num?)?.toInt() ?? 0,
        name: json['name']?.toString() ?? '',
        category: json['category']?.toString() ?? '',
        brand: json['brand']?.toString() ?? '',
        code: json['code']?.toString() ?? '',
        price: (json['price'] as num?)?.toInt() ?? 0,
        stock: (json['stock'] as num?)?.toInt() ?? 0,
        status: json['status']?.toString() ?? '',
        updated: json['updated']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        stockUpdatedAt: json['stockUpdatedAt']?.toString(),
        imageDataUrl: json['imageDataUrl']?.toString(),
      );
}

class VisitorMessage {
  const VisitorMessage({
    required this.id,
    required this.pharmacyId,
    required this.sender,
    required this.phone,
    required this.subject,
    required this.body,
    required this.date,
    required this.read,
    required this.direction,
    this.threadId,
    this.visitorId,
  });

  final int id;
  final int pharmacyId;
  final int? threadId;
  final String? visitorId;
  final String sender;
  final String phone;
  final String subject;
  final String body;
  final String date;
  final bool read;
  final String direction;

  factory VisitorMessage.fromJson(Map<String, dynamic> json) => VisitorMessage(
        id: (json['id'] as num?)?.toInt() ?? 0,
        pharmacyId: (json['pharmacyId'] as num?)?.toInt() ?? 0,
        threadId: (json['threadId'] as num?)?.toInt(),
        visitorId: json['visitorId']?.toString(),
        sender: json['sender']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        subject: json['subject']?.toString() ?? '',
        body: json['body']?.toString() ?? '',
        date: json['date']?.toString() ?? '',
        read: json['read'] == true,
        direction: json['direction']?.toString() ?? 'visitor',
      );
}

class PublicBadge {
  const PublicBadge({
    required this.id,
    required this.name,
    required this.description,
    required this.color,
    required this.icon,
  });

  final int id;
  final String name;
  final String description;
  final String color;
  final String icon;

  factory PublicBadge.fromJson(Map<String, dynamic> json) => PublicBadge(
        id: (json['id'] as num?)?.toInt() ?? 0,
        name: json['name']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        color: json['color']?.toString() ?? 'mint',
        icon: json['icon']?.toString() ?? 'shield',
      );
}
