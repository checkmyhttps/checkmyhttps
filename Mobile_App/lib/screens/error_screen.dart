import "package:flutter/material.dart";

import "package:checkmyhttps/routes/routes.dart";
import "package:checkmyhttps/services/services.dart";

typedef ErrorScreenAction = void Function();

class ErrorScreen extends StatelessWidget {
  final String? title;
  final String? description;
  final Color color;
  final IconData? icon;
  final Widget? child;
  final ErrorScreenAction? action;
  final String? actionText;
  final bool? showSettings;

  const ErrorScreen({
    Key? key,
    this.title,
    this.description,
    this.child,
    this.action,
    this.actionText,
    this.color = const Color(0xffff4b47),
    this.icon = Icons.warning,
    this.showSettings,
  }) : super(key: key);

  void handleOpenSettings() {
    NavigationService navigationService = NavigationService();
    navigationService.pushNamed(CmhAppRoutes.settings);
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Padding(
          padding: EdgeInsets.only(
            bottom: size.height * 0.05,
          ),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: size.width * 0.1,
            ),
            margin: EdgeInsets.symmetric(
              vertical: size.height * 0.05,
            ),
            width: size.width,
            height: size.height * 0.2,
            child: child ??
                Padding(
                  padding: const EdgeInsets.only(
                    bottom: 10,
                  ),
                  child: FittedBox(
                    fit: BoxFit.cover,
                    child: Icon(
                      icon,
                      color: Colors.red,
                    ),
                  ),
                ),
          ),
        ),
        if (title != null)
          Padding(
            padding: const EdgeInsets.only(
              bottom: 16,
            ),
            child: Text(
              title!,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.48,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        if (description != null)
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
            ),
            child: Text(
              description!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w400,
                height: 1.036,
                letterSpacing: -0.25,
              ),
            ),
          ),
        if (actionText != null)
          Padding(
            padding: const EdgeInsets.symmetric(
              vertical: 52,
            ),
            child: MaterialButton(
              padding: const EdgeInsets.symmetric(
                horizontal: 40,
              ),
              color: Theme.of(context).textTheme.labelLarge?.color,
              onPressed: action,
              child: Text(
                actionText!,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
