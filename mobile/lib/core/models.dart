// Plain Dart models matching the Supabase schema.

import 'package:flutter/foundation.dart';

@immutable
class Product {
  final int id;
  final String slug;
  final String name;
  final String nameKo;
  final String nameRu;
  final String category;
  final String description;
  final String descriptionKo;
  final String descriptionRu;
  final List<String> tags;
  final List<String> tagsKo;
  final List<String> tagsRu;
  final int price;
  final int? originalPrice;
  final String imageUrl;
  final String weight;
  final int stock;
  final bool bestseller;
  final bool isNew;
  final bool outOfStock;

  const Product({
    required this.id,
    required this.slug,
    required this.name,
    required this.nameKo,
    required this.nameRu,
    required this.category,
    required this.description,
    required this.descriptionKo,
    required this.descriptionRu,
    required this.tags,
    required this.tagsKo,
    required this.tagsRu,
    required this.price,
    required this.originalPrice,
    required this.imageUrl,
    required this.weight,
    required this.stock,
    required this.bestseller,
    required this.isNew,
    required this.outOfStock,
  });

  factory Product.fromJson(Map<String, dynamic> j) => Product(
        id: j['id'] as int,
        slug: j['slug'] as String? ?? '',
        name: j['name'] as String,
        nameKo: j['name_ko'] as String? ?? '',
        nameRu: j['name_ru'] as String? ?? '',
        category: j['category'] as String,
        description: j['description'] as String? ?? '',
        descriptionKo: j['description_ko'] as String? ?? '',
        descriptionRu: j['description_ru'] as String? ?? '',
        tags: List<String>.from(j['tags'] ?? const []),
        tagsKo: List<String>.from(j['tags_ko'] ?? const []),
        tagsRu: List<String>.from(j['tags_ru'] ?? const []),
        price: j['price'] as int,
        originalPrice: j['original_price'] as int?,
        imageUrl: j['image_url'] as String? ?? '',
        weight: j['weight'] as String? ?? '100g',
        stock: j['stock'] as int? ?? 0,
        bestseller: j['bestseller'] as bool? ?? false,
        isNew: j['is_new'] as bool? ?? false,
        outOfStock: j['out_of_stock'] as bool? ?? false,
      );

  String localizedName(String locale) =>
      locale == 'ko' ? nameKo : locale == 'ru' ? nameRu : name;
  String localizedDescription(String locale) =>
      locale == 'ko' ? descriptionKo : locale == 'ru' ? descriptionRu : description;
  List<String> localizedTags(String locale) =>
      locale == 'ko' ? tagsKo : locale == 'ru' ? tagsRu : tags;
}

@immutable
class GiftSet {
  final int id;
  final String name;
  final String nameKo;
  final String nameRu;
  final String description;
  final int price;
  final int? originalPrice;
  final List<String> includes;
  final String imageUrl;
  final bool bestseller;
  final int stock;
  final bool outOfStock;

  const GiftSet({
    required this.id,
    required this.name,
    required this.nameKo,
    required this.nameRu,
    required this.description,
    required this.price,
    required this.originalPrice,
    required this.includes,
    required this.imageUrl,
    required this.bestseller,
    required this.stock,
    required this.outOfStock,
  });

  factory GiftSet.fromJson(Map<String, dynamic> j) => GiftSet(
        id: j['id'] as int,
        name: j['name'] as String,
        nameKo: j['name_ko'] as String? ?? '',
        nameRu: j['name_ru'] as String? ?? '',
        description: j['description'] as String? ?? '',
        price: j['price'] as int,
        originalPrice: j['original_price'] as int?,
        includes: List<String>.from(j['includes'] ?? const []),
        imageUrl: j['image_url'] as String? ?? '',
        bestseller: j['bestseller'] as bool? ?? false,
        stock: j['stock'] as int? ?? 0,
        outOfStock: j['out_of_stock'] as bool? ?? false,
      );
}

enum CartItemType { product, giftSet }

@immutable
class CartItem {
  final CartItemType type;
  final int itemId;
  final String name;
  final int price;
  final String imageUrl;
  final int quantity;

  const CartItem({
    required this.type,
    required this.itemId,
    required this.name,
    required this.price,
    required this.imageUrl,
    required this.quantity,
  });

  CartItem copyWith({int? quantity}) => CartItem(
        type: type,
        itemId: itemId,
        name: name,
        price: price,
        imageUrl: imageUrl,
        quantity: quantity ?? this.quantity,
      );

  Map<String, dynamic> toEdgeFunctionItem() => {
        'item_type': type == CartItemType.product ? 'product' : 'gift_set',
        'item_id': itemId,
        'quantity': quantity,
      };

  String get key => '${type.name}:$itemId';
}

@immutable
class Address {
  final String? id;
  final String recipientName;
  final String phone;
  final String postalCode;
  final String address1;
  final String? address2;
  final bool isDefault;

  const Address({
    this.id,
    required this.recipientName,
    required this.phone,
    required this.postalCode,
    required this.address1,
    this.address2,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> j) => Address(
        id: j['id'] as String?,
        recipientName: j['recipient_name'] as String,
        phone: j['phone'] as String,
        postalCode: j['postal_code'] as String,
        address1: j['address1'] as String,
        address2: j['address2'] as String?,
        isDefault: j['is_default'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'recipient_name': recipientName,
        'phone': phone,
        'postal_code': postalCode,
        'address1': address1,
        if (address2 != null) 'address2': address2,
      };
}

@immutable
class Order {
  final String id;
  final String orderNo;
  final String status;
  final int total;
  final int subtotal;
  final int shipping;
  final List<Map<String, dynamic>> items;
  final DateTime createdAt;

  const Order({
    required this.id,
    required this.orderNo,
    required this.status,
    required this.total,
    required this.subtotal,
    required this.shipping,
    required this.items,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: j['id'] as String,
        orderNo: j['order_no'] as String,
        status: j['status'] as String,
        total: j['total'] as int,
        subtotal: j['subtotal'] as int,
        shipping: j['shipping'] as int,
        items: List<Map<String, dynamic>>.from(j['items'] ?? const []),
        createdAt: DateTime.parse(j['created_at'] as String),
      );
}

@immutable
class Promotion {
  final int id;
  final String title;
  final String body;
  final String? imageUrl;
  final int? discountPct;
  final DateTime? endsAt;

  const Promotion({
    required this.id,
    required this.title,
    required this.body,
    required this.imageUrl,
    required this.discountPct,
    required this.endsAt,
  });

  factory Promotion.fromJson(Map<String, dynamic> j, {String locale = 'en'}) => Promotion(
        id: j['id'] as int,
        title: locale == 'ko'
            ? (j['title_ko'] as String? ?? j['title'] as String)
            : locale == 'ru'
                ? (j['title_ru'] as String? ?? j['title'] as String)
                : j['title'] as String,
        body: locale == 'ko'
            ? (j['body_ko'] as String? ?? j['body'] as String)
            : locale == 'ru'
                ? (j['body_ru'] as String? ?? j['body'] as String)
                : j['body'] as String,
        imageUrl: j['image_url'] as String?,
        discountPct: j['discount_pct'] as int?,
        endsAt: j['ends_at'] != null ? DateTime.parse(j['ends_at'] as String) : null,
      );
}
