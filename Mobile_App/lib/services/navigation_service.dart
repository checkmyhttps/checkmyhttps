import "package:flutter/widgets.dart";

class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  static final NavigationService _navigationService =
      NavigationService._internal();

  NavigationService._internal();

  factory NavigationService() {
    return _navigationService;
  }

  void pop() {
    return navigatorKey.currentState?.pop();
  }

  void popUntil(bool Function(Route<dynamic>) predicate) {
    return navigatorKey.currentState?.popUntil(predicate);
  }

  Future<void>? pushNamedAndRemoveUntil(String routeName, {Object? arguments}) {
    return navigatorKey.currentState?.pushNamedAndRemoveUntil(
        routeName, (Route<dynamic> route) => false,
        arguments: arguments);
  }

  Future<void>? pushNamed(String routeName, {Object? arguments}) {
    return navigatorKey.currentState
        ?.pushNamed(routeName, arguments: arguments);
  }
}
