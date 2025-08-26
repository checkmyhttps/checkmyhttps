import "package:flutter/material.dart";
import "package:google_fonts/google_fonts.dart";

import "./i_cmh_theme.dart";

class CmhLightTheme extends ICmhTheme {
  static const Color _cmhThemeBackgroundColor = Color(0xFFEEEEEE);
  static const Color _cmhThemeTextColor = Color(0XFF181A1B);

  static const Color _cmhThemePrimaryColor = Color(0xff593ada);
  static final TextTheme _cmhThemeTextTheme = GoogleFonts.montserratTextTheme();

  @override
  ThemeType get type => ThemeType.light;

  @override
  ThemeData get data => ThemeData(
    textTheme: _cmhThemeTextTheme.apply(
      bodyColor: _cmhThemeTextColor,
      displayColor: _cmhThemeTextColor,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(backgroundColor: _cmhThemePrimaryColor),
    ),
    popupMenuTheme: ThemeData().popupMenuTheme.copyWith(
      color: _cmhThemeBackgroundColor,
      textStyle: const TextStyle(color: _cmhThemeTextColor),
    ),
    dividerColor: _cmhThemeTextColor,
    primaryColor: _cmhThemePrimaryColor,
    brightness: Brightness.light,
    colorScheme: ThemeData().colorScheme.copyWith(
      surface: _cmhThemeBackgroundColor,
    ),
  );
}
