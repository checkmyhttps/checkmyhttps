import "package:flutter/cupertino.dart";

import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/themes/themes.dart";

abstract class IAppSettings extends ChangeNotifier {
  static Future<IAppSettings>? init() => null;
  static IAppSettings get instance => IAppSettings.instance;

  late String versionNumber;

  AppLocalizations get l10n;
  Locale get language;
  ICmhTheme get theme;
  bool get hasInternetConnection;
  Locale get defaultLanguage;
  Map<String, Locale> get languages;
  Map<ThemeType, ICmhTheme> get themes;

  set language(Locale newLanguage);
  set theme(ICmhTheme newTheme);
  set hasInternetConnection(bool newConnRes);

  String getLanguageName({Locale? lang});
  void changeLanguage(String language);
  Future<ThemeType> changeTheme();
}
