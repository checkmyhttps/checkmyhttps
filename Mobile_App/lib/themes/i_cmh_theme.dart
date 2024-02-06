import "package:flutter/material.dart";

enum ThemeType {
  light,
  dark,
}

abstract class ICmhTheme {
  ThemeData get data;
  ThemeType get type;

  bool compareTo(ICmhTheme compareTheme) {
    return type == compareTheme.type;
  }
}
