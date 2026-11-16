import 'package:flutter/material.dart';

class AppColors {
  static const green = Color(0xFF159B70);
  static const darkGreen = Color(0xFF075B46);
  static const mint = Color(0xFFDDF3EC);
  static const paleBlue = Color(0xFFEAF3FA);
  static const ink = Color(0xFF172B26);
  static const muted = Color(0xFF71817B);
  static const border = Color(0xFFE6ECE9);
  static const background = Color(0xFFF8FBF9);
  static const danger = Color(0xFFD94343);
  static const warning = Color(0xFFF2A93B);
}

class AppTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.green,
          primary: AppColors.green,
          surface: Colors.white,
          error: AppColors.danger,
        ),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          foregroundColor: AppColors.ink,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: AppColors.ink,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.green, width: 1.5),
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: AppColors.mint,
          labelTextStyle: WidgetStateProperty.resolveWith((states) => TextStyle(
                fontSize: 11,
                fontWeight: states.contains(WidgetState.selected)
                    ? FontWeight.w700
                    : FontWeight.w500,
              )),
        ),
      );
}
