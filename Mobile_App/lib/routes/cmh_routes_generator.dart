import "package:checkmyhttps/services/services.dart";
import "package:checkmyhttps/widgets/widgets.dart";
import "package:flutter/cupertino.dart";

import "package:checkmyhttps/helpers/helpers.dart";
import "package:checkmyhttps/screens/screens.dart";
import "package:checkmyhttps/settings/settings.dart";

import "./cmh_app_routes.dart";

class CmhAppRoutesGenerator {
  static Route<dynamic> generateRoute(RouteSettings routeSettings) {
    return FadeRoute(
      settings: routeSettings,
      builder: (context) {
        if (CmhAppSettings.instance.hasInternetConnection) {
          switch (routeSettings.name) {
            case CmhAppRoutes.splash:
              return PopScope(
                canPop: false,
                child: const PageScafold(
                  margin: EdgeInsets.symmetric(horizontal: 20),
                  withAppBar: false,
                  child: SplashScreen(),
                ),
              );

            case CmhAppRoutes.home:
              return const PageScafold(scrollable: true, child: HomeScreen());

            case CmhAppRoutes.intro:
              return PageScafold(
                withAppBar: !SharedPrefsStorageService().getAppFirstRun(),
                child: const IntroScreen(),
              );

            case CmhAppRoutes.how:
              return const PageScafold(scrollable: true, child: HowScreen());

            case CmhAppRoutes.about:
              return const PageScafold(scrollable: true, child: AboutScreen());

            case CmhAppRoutes.settings:
              return const PageScafold(
                scrollable: true,
                child: SettingsScreen(),
              );

            default:
              return const PageScafold(scrollable: true, child: HomeScreen());
          }
        } else {
          return ErrorScreen(
            title: CmhAppSettings.instance.l10n.noInternet,
            icon: CupertinoIcons.wifi_exclamationmark,
          );
        }
      },
    );
  }
}
