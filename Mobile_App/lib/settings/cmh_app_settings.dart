import "dart:io";
import "dart:ui";

import "package:flutter/foundation.dart";
import "package:flutter/widgets.dart";

import "package:connectivity_plus/connectivity_plus.dart";
import "package:package_info_plus/package_info_plus.dart";
import "package:provider/provider.dart";

import "package:checkmyhttps/config/config.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/services/services.dart";
import "package:checkmyhttps/themes/themes.dart";

import "./i_app_settings.dart";

class CmhAppSettings with ChangeNotifier implements IAppSettings {
  CmhAppSettings._();

  static IAppSettings get instance {
    return Provider.of<IAppSettings>(
      NavigationService.navigatorKey.currentContext!,
      listen: false,
    );
  }

  late Locale? _language;
  late AppLocalizations? _l10n;
  late ICmhTheme _theme;
  late bool? _hasInternetConnection;

  @override
  late String versionNumber;

  @override
  AppLocalizations get l10n {
    if (_l10n != null) {
      return _l10n!;
    }

    return _language == const Locale("fr")
        ? AppLocalizationsFr()
        : AppLocalizationsEn();
  }

  @override
  Locale get language => _language ?? defaultLanguage;

  @override
  ICmhTheme get theme => _theme;

  @override
  bool get hasInternetConnection => _hasInternetConnection ?? false;

  @override
  Locale get defaultLanguage => AppLocalizations.supportedLocales.firstWhere(
      (locale) =>
          locale ==
          (kIsWeb ? window.locale : Locale(Platform.localeName.split("_")[0])),
      orElse: () => CmhConfig.defaultLanguage);

  @override
  Map<String, Locale> get languages => <String, Locale>{
        "English": const Locale("en"),
        "Français": const Locale("fr"),
      };

  @override
  Map<ThemeType, ICmhTheme> get themes => CmhThemes.themes;

  @override
  set language(Locale? newLanguage) {
    _language = newLanguage;
    _l10n = newLanguage == const Locale("fr")
        ? AppLocalizationsFr()
        : AppLocalizationsEn();
    notifyListeners();
  }

  @override
  set theme(ICmhTheme newTheme) {
    _theme = newTheme;

    notifyListeners();
  }

  @override
  set hasInternetConnection(bool newConnRes) {
    _hasInternetConnection = newConnRes;
    notifyListeners();
  }

  @override
  String getLanguageName({Locale? lang}) {
    return languages.keys.firstWhere(
      (currentLanguage) => languages[currentLanguage] == (lang ?? language),
    );
  }

  static Future<CmhAppSettings> init() async {
    CmhAppSettings appSettings = CmhAppSettings._();

    await PackageInfo.fromPlatform().then((PackageInfo packageInfo) {
      appSettings.versionNumber =
          "${packageInfo.version} (${packageInfo.buildNumber})";
    });

    final storageService = await SharedPrefsStorageService.init();

    if (storageService.getAppFirstRun()) {
      storageService.setAppDefaultUrl(
        CmhConfig.defaultUrl,
      );
      storageService.setAppCheckServerAddress(
        CmhConfig.checkServerAddress,
      );
      storageService.setAppCheckServerPublicKey(
        CmhConfig.checkServerPublicKey,
      );
    }

    appSettings.language =
        appSettings.languages[storageService.getAppLanguage()];

    appSettings.theme =
        storageService.isDarkTheme() == true ? CmhDarkTheme() : CmhLightTheme();
    await Connectivity().checkConnectivity().then(
      (connectivityResult) {
        appSettings.hasInternetConnection =
            connectivityResult != ConnectivityResult.none;
      },
    );

    return appSettings;
  }

  @override
  void changeLanguage(String languageName) {
    language = languages[languageName];
  }

  @override
  Future<ThemeType> changeTheme() async {
    theme = _theme.type == ThemeType.dark ? CmhLightTheme() : CmhDarkTheme();

    return theme.type;
  }
}
