import "package:flutter/material.dart";

import "./i_cmh_theme.dart";
import "./cmh_light_theme.dart";
import "./cmh_dark_theme.dart";

export "./i_cmh_theme.dart";
export "./cmh_light_theme.dart";
export "./cmh_dark_theme.dart";

extension CmhThemes on ICmhTheme {
  static Map<ThemeType, ICmhTheme> get themes {
    return {
      ThemeType.dark: CmhDarkTheme(),
      ThemeType.light: CmhLightTheme(),
    };
  }

  static ThemeData get lightTheme => CmhLightTheme().data;

  static ThemeData get darkTheme => CmhDarkTheme().data;
}
