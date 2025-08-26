import "package:shared_preferences/shared_preferences.dart";

import "./i_storage_service.dart";

class SharedPrefsStorageService implements IStorageService {
  static const String _settingsLanguageKey = "settings_lang_key";
  static const String _settingsThemeKey = "settings_theme_key";
  static const String _appDefaultUrl = "app_default_url";
  static const String _appFirstRun = "app_first_run";
  static const String _appCheckServerAddress = "app_check_server_address";
  static const String _appCheckServerPublicKey = "app_check_server_publickey";

  static SharedPreferences? _prefs;

  static final SharedPrefsStorageService _sharedPreferencesService =
      SharedPrefsStorageService._internal();

  SharedPrefsStorageService._internal();

  factory SharedPrefsStorageService() {
    return _sharedPreferencesService;
  }

  /// Must be called before `SharedPrefsStorageService` is used:
  /// ```dart
  /// SharedPrefsStorageService.init();
  /// ```
  static Future<SharedPrefsStorageService> init() {
    if (_prefs == null) {
      return SharedPreferences.getInstance().then((prefsInstance) {
        _prefs = prefsInstance;
        return _sharedPreferencesService;
      });
    }
    return Future.value(_sharedPreferencesService);
  }

  @override
  bool getAppFirstRun() {
    return _prefs?.getBool(_appFirstRun) ?? true;
  }

  @override
  Future<bool>? setAppFirstRun(bool? value) {
    if (value != null) {
      return _prefs?.setBool(_appFirstRun, value);
    }
    return null;
  }

  @override
  Future<bool>? deleteAppFirstRun() {
    return _prefs?.remove(_appFirstRun);
  }

  @override
  String? getAppDefaultUrl() {
    return _prefs?.getString(_appDefaultUrl);
  }

  @override
  Future<bool>? setAppDefaultUrl(String? value) {
    if (value != null) {
      return _prefs?.setString(_appDefaultUrl, value);
    }
    return null;
  }

  @override
  Future<bool>? deleteAppDefaultUrl() {
    return _prefs?.remove(_appDefaultUrl);
  }

  @override
  String? getAppCheckServerAddress() {
    return _prefs?.getString(_appCheckServerAddress);
  }

  @override
  Future<bool>? setAppCheckServerAddress(String value) {
    return _prefs?.setString(_appCheckServerAddress, value);
  }

  @override
  Future<bool>? deleteAppCheckServerAddress() {
    return _prefs?.remove(_appCheckServerAddress);
  }

  @override
  String? getAppLanguage() {
    return _prefs?.getString(_settingsLanguageKey);
  }

  @override
  Future<bool>? setAppLanguage(String value) {
    return _prefs?.setString(_settingsLanguageKey, value);
  }

  @override
  Future<bool>? deleteAppLanguage() {
    return _prefs?.remove(_settingsLanguageKey);
  }

  @override
  bool isDarkTheme() {
    return _prefs?.getBool(_settingsThemeKey) ?? false;
  }

  @override
  Future<bool>? setDarkTheme(bool isDarkTheme) {
    return _prefs?.setBool(_settingsThemeKey, isDarkTheme);
  }

  @override
  Future<bool>? deleteAppTheme() {
    return _prefs?.remove(_settingsThemeKey);
  }

  @override
  Future<bool>? deleteAppSettings() async {
    bool? appLanguageDeleted = await deleteAppLanguage();
    bool? appThemeDeleted = await deleteAppTheme();
    bool? appCheckServerAddressDeleted = await deleteAppCheckServerAddress();
    bool? appDefaultUrlDeleted = await deleteAppDefaultUrl();
    return appLanguageDeleted != null &&
        appThemeDeleted != null &&
        appCheckServerAddressDeleted != null &&
        appDefaultUrlDeleted != null &&
        appCheckServerAddressDeleted &&
        appLanguageDeleted &&
        appLanguageDeleted &&
        appThemeDeleted &&
        appDefaultUrlDeleted;
  }

  @override
  String? getAppCheckServerPublicKey() {
    return _prefs?.getString(_appCheckServerPublicKey);
  }

  Future<bool>? setAppCheckServerPublicKey(String value) {
    return _prefs?.setString(_appCheckServerPublicKey, value);
  }
}
