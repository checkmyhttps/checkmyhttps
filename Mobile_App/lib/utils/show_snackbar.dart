import "package:flutter/material.dart";

ScaffoldFeatureController<SnackBar, SnackBarClosedReason>? showSnackBar(
  String message,
  BuildContext context,
) {
  return ScaffoldMessenger.of(
    context,
  ).showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      content: Text(message),
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(16),
      dismissDirection: DismissDirection.horizontal,
      duration: const Duration(seconds: 3),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
      ),
    ),
  );
}
