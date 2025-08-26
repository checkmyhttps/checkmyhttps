import "dart:async";

import "package:flutter/material.dart";

import "package:connectivity_plus/connectivity_plus.dart";
import "package:provider/provider.dart";

import "package:checkmyhttps/routes/routes.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/services/services.dart";
import "package:checkmyhttps/settings/settings.dart";

class CmhApp extends StatefulWidget {
  const CmhApp({super.key});

  @override
  State<CmhApp> createState() => _CmhAppState();
}

class _CmhAppState extends State<CmhApp> {
  late IAppSettings _settings;
  late final StreamSubscription<List<ConnectivityResult>>
  _connectivitySubscription;

  @override
  void initState() {
    super.initState();

    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((
      listOfconnection,
    ) async {
      if (listOfconnection.contains(ConnectivityResult.other) ||
          listOfconnection.contains(ConnectivityResult.none)) {
        _settings.hasInternetConnection = false;
      } else {
        _settings.hasInternetConnection = true;
      }
    });
  }

  Locale? _handleLocale(Locale? locale, Iterable<Locale> supportedLocales) {
    return supportedLocales.firstWhere(
      (supportedLocale) => supportedLocale.languageCode == locale!.languageCode,
      orElse: () => _settings.defaultLanguage,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<IAppSettings>(
      builder: (context, settings, child) {
        _settings = settings;

        return MaterialApp(
          navigatorKey: NavigationService.navigatorKey,
          theme: _settings.theme.data,
          locale: _settings.language,
          localeResolutionCallback: _handleLocale,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          title: _settings.l10n.title,
          initialRoute: CmhAppRoutes.splash,
          onGenerateRoute: CmhAppRoutesGenerator.generateRoute,
        );
      },
    );
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    _settings.removeListener(() {});
    super.dispose();
  }
}
