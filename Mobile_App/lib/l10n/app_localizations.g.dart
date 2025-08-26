import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.g.dart';
import 'app_localizations_fr.g.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.g.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('fr'),
  ];

  /// No description provided for @title.
  ///
  /// In en, this message translates to:
  /// **'CheckMyHTTPS'**
  String get title;

  /// No description provided for @menu.
  ///
  /// In en, this message translates to:
  /// **'Menu'**
  String get menu;

  /// No description provided for @noInternet.
  ///
  /// In en, this message translates to:
  /// **'No internet connection!'**
  String get noInternet;

  /// No description provided for @lightTheme.
  ///
  /// In en, this message translates to:
  /// **'Light Theme'**
  String get lightTheme;

  /// No description provided for @darkTheme.
  ///
  /// In en, this message translates to:
  /// **'Dark Theme'**
  String get darkTheme;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @intro.
  ///
  /// In en, this message translates to:
  /// **'Intro'**
  String get intro;

  /// No description provided for @how.
  ///
  /// In en, this message translates to:
  /// **'How'**
  String get how;

  /// No description provided for @about.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @switchTheme.
  ///
  /// In en, this message translates to:
  /// **'Switch Theme'**
  String get switchTheme;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @changeLanguage.
  ///
  /// In en, this message translates to:
  /// **'Change Language'**
  String get changeLanguage;

  /// No description provided for @defaultUrl.
  ///
  /// In en, this message translates to:
  /// **'Default URL'**
  String get defaultUrl;

  /// No description provided for @checkServer.
  ///
  /// In en, this message translates to:
  /// **'Check Server'**
  String get checkServer;

  /// No description provided for @checkServerAddress.
  ///
  /// In en, this message translates to:
  /// **'Check Server Address'**
  String get checkServerAddress;

  /// No description provided for @checkServerHash.
  ///
  /// In en, this message translates to:
  /// **'Check Server SHA256'**
  String get checkServerHash;

  /// No description provided for @checkServerPublicKey.
  ///
  /// In en, this message translates to:
  /// **'Check Server Public Key'**
  String get checkServerPublicKey;

  /// No description provided for @getFingerprints.
  ///
  /// In en, this message translates to:
  /// **'Get Fingerprints'**
  String get getFingerprints;

  /// No description provided for @getPublicKey.
  ///
  /// In en, this message translates to:
  /// **'Get Public Key'**
  String get getPublicKey;

  /// No description provided for @resetDefault.
  ///
  /// In en, this message translates to:
  /// **'Reset Default'**
  String get resetDefault;

  /// No description provided for @websiteUrl.
  ///
  /// In en, this message translates to:
  /// **'Website URL'**
  String get websiteUrl;

  /// No description provided for @check.
  ///
  /// In en, this message translates to:
  /// **'Check'**
  String get check;

  /// No description provided for @version.
  ///
  /// In en, this message translates to:
  /// **'Version'**
  String get version;

  /// No description provided for @titleAbout.
  ///
  /// In en, this message translates to:
  /// **'Check if your encrypted WEB traffic (HTTPS) is being intercepted'**
  String get titleAbout;

  /// No description provided for @descriptionAbout.
  ///
  /// In en, this message translates to:
  /// **'This mobile app allows you to check if your encrypted web traffic (SSL/TLS) towards secure Internet servers (HTTPS) is being intercepted.'**
  String get descriptionAbout;

  /// No description provided for @versionApp.
  ///
  /// In en, this message translates to:
  /// **'Version of the app'**
  String get versionApp;

  /// No description provided for @originalIdea.
  ///
  /// In en, this message translates to:
  /// **'Original idea & Supervision'**
  String get originalIdea;

  /// No description provided for @designDevProject.
  ///
  /// In en, this message translates to:
  /// **'Design and development of the CheckMyHTTPS project'**
  String get designDevProject;

  /// No description provided for @designDevApp.
  ///
  /// In en, this message translates to:
  /// **'Design and development of the mobile app'**
  String get designDevApp;

  /// No description provided for @explanation.
  ///
  /// In en, this message translates to:
  /// **'Explanation'**
  String get explanation;

  /// No description provided for @howText.
  ///
  /// In en, this message translates to:
  /// **'Normally, a secure website has to prove its identity to your browser by sending a certificate validated by a recognized certificate authority.\nInterception techniques generate dynamically forged certificates in order to fool the user into believing that his connection is secure.\nThis mobile app checks that the received certificate is the right one.\nThis app will compare that the certificate received by the client (1) from a visited HTTPS website matches the certificate seen by a remote check server* (2), ensuring that no interception is taking place.\nIf they are different, your connection might be listened to! This allows us to prove the interception.'**
  String get howText;

  /// No description provided for @defaultServer.
  ///
  /// In en, this message translates to:
  /// **'This server is by default « {defaultServerAddress} ». You can install your own server (see documentation on the CheckMyHTTPS\' GitHub).'**
  String defaultServer(String defaultServerAddress);

  /// No description provided for @howImageTitle.
  ///
  /// In en, this message translates to:
  /// **'Here is how CheckMyHTTPS works :'**
  String get howImageTitle;

  /// No description provided for @howImageLegend.
  ///
  /// In en, this message translates to:
  /// **'Here is what happens when CheckMyHTTPS checks your HTTPS connection'**
  String get howImageLegend;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @previous.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get previous;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @introTitle1.
  ///
  /// In en, this message translates to:
  /// **'Introduction'**
  String get introTitle1;

  /// No description provided for @intro1.
  ///
  /// In en, this message translates to:
  /// **'This app checks if your connection is secure when you provide the URL of a website'**
  String get intro1;

  /// No description provided for @introTitle2.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get introTitle2;

  /// No description provided for @intro2.
  ///
  /// In en, this message translates to:
  /// **'You can also launch the app from your web browser (Chrome, Firefox) by clicking on Share...'**
  String get intro2;

  /// No description provided for @introTitle3.
  ///
  /// In en, this message translates to:
  /// **'The Server Parameters'**
  String get introTitle3;

  /// No description provided for @intro3.
  ///
  /// In en, this message translates to:
  /// **'If you want to change the check server, please look at the documentation in the CheckMyHTTPS\' GitHub'**
  String get intro3;

  /// No description provided for @noHttps.
  ///
  /// In en, this message translates to:
  /// **'It is not a HTTPS website (check the URL)'**
  String get noHttps;

  /// No description provided for @serverUnreachable.
  ///
  /// In en, this message translates to:
  /// **'Server unreachable...'**
  String get serverUnreachable;

  /// No description provided for @danger.
  ///
  /// In en, this message translates to:
  /// **'Your connection might be listened to...'**
  String get danger;

  /// No description provided for @alertOnUnicodeIdnDomainNames.
  ///
  /// In en, this message translates to:
  /// **'The domain name is an international one and your browser shows it in Unicode'**
  String get alertOnUnicodeIdnDomainNames;

  /// No description provided for @sslPeerUnverified.
  ///
  /// In en, this message translates to:
  /// **'The requested domain name does not match the server\'s certificate.'**
  String get sslPeerUnverified;

  /// No description provided for @platformNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Browser-based apps not supported'**
  String get platformNotSupported;

  /// No description provided for @newCheckServer.
  ///
  /// In en, this message translates to:
  /// **'The new check server has been set.'**
  String get newCheckServer;

  /// No description provided for @privateIp.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t reach this IP from our check server (this is a private IP).'**
  String get privateIp;

  /// No description provided for @serverUnknown.
  ///
  /// In en, this message translates to:
  /// **'Server unknown...'**
  String get serverUnknown;

  /// No description provided for @sslPinning.
  ///
  /// In en, this message translates to:
  /// **'The requested check server is different. Your connection might be listened to...'**
  String get sslPinning;

  /// No description provided for @secureConnection.
  ///
  /// In en, this message translates to:
  /// **'Your HTTPS connection is secure.'**
  String get secureConnection;

  /// No description provided for @notURL.
  ///
  /// In en, this message translates to:
  /// **'It is not a URL.'**
  String get notURL;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
