import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LumiColors {
  static const pink = Color(0xFFE91E63);
  static const pinkSoft = Color(0xFFF8BBD0);
  static const ink = Color(0xFF1A1A1A);
  static const cream = Color(0xFFFFF8F4);
}

class LumiTheme {
  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: LumiColors.pink,
      brightness: Brightness.light,
    );
    return _build(scheme);
  }

  static ThemeData get dark {
    final scheme = ColorScheme.fromSeed(
      seedColor: LumiColors.pink,
      brightness: Brightness.dark,
    );
    return _build(scheme);
  }

  static ThemeData _build(ColorScheme scheme) {
    final base = ThemeData(useMaterial3: true, colorScheme: scheme);
    return base.copyWith(
      scaffoldBackgroundColor: scheme.brightness == Brightness.light
          ? LumiColors.cream
          : scheme.surface,
      textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
        headlineLarge: GoogleFonts.playfairDisplay(
          fontSize: 32, fontWeight: FontWeight.w700, color: scheme.onSurface,
        ),
        headlineMedium: GoogleFonts.playfairDisplay(
          fontSize: 24, fontWeight: FontWeight.w600, color: scheme.onSurface,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        foregroundColor: scheme.onSurface,
        centerTitle: true,
        titleTextStyle: GoogleFonts.playfairDisplay(
          fontSize: 20, fontWeight: FontWeight.w600, color: scheme.onSurface,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
