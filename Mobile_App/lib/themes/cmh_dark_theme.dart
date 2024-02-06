import "package:flutter/material.dart";

import "./i_cmh_theme.dart";
import "./cmh_light_theme.dart";

class CmhDarkTheme extends ICmhTheme {
  static const Color _cmhThemeBackgroundColor = Color(0XFF181A1B);
  static const Color _cmhThemeTextColor = Color(0xFFEEEEEE);

  static const Color _cmhThemePrimaryColor = Color(0xff7D65E2);

  @override
  ThemeType get type => ThemeType.dark;

  @override
  ThemeData get data => ThemeData.dark().copyWith(
        textTheme: CmhLightTheme().data.textTheme.apply(
              bodyColor: _cmhThemeTextColor,
              displayColor: _cmhThemeTextColor,
            ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: _cmhThemePrimaryColor,
          ),
        ),
        popupMenuTheme: ThemeData().popupMenuTheme.copyWith(
              color: _cmhThemeBackgroundColor,
              textStyle: const TextStyle(
                color: _cmhThemeTextColor,
              ),
            ),
        dividerColor: _cmhThemeTextColor,
        primaryColor: _cmhThemePrimaryColor,
        brightness: Brightness.dark,
        colorScheme: ThemeData.dark().colorScheme.copyWith(
              background: _cmhThemeBackgroundColor,
            ),
      );
}
