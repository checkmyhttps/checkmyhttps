import "package:flutter/widgets.dart";

export "./show_fullscreen_image.dart";
export "./show_alert.dart";
export "./show_snackbar.dart";

Color darken({
  required Color color,
  double percentage = .1,
}) {
  assert(percentage >= 0 && percentage <= 100);

  final hsl = HSLColor.fromColor(color);
  final hslDark =
      hsl.withLightness((hsl.lightness - percentage / 100).clamp(0.0, 1.0));

  return hslDark.toColor();
}

Color lighten({
  required Color color,
  double percentage = .1,
}) {
  assert(percentage >= 0 && percentage <= 100);

  final hsl = HSLColor.fromColor(color);
  final hslLight =
      hsl.withLightness((hsl.lightness + percentage / 100).clamp(0.0, 1.0));

  return hslLight.toColor();
}

void closeKeyboard() {
  return FocusManager.instance.primaryFocus?.unfocus();
}
