import 'app_localizations.g.dart';

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get title => 'CheckMyHTTPS';

  @override
  String get menu => 'Menu';

  @override
  String get noInternet => 'No internet connection!';

  @override
  String get lightTheme => 'Light Theme';

  @override
  String get darkTheme => 'Dark Theme';

  @override
  String get home => 'Home';

  @override
  String get intro => 'Intro';

  @override
  String get how => 'How';

  @override
  String get about => 'About';

  @override
  String get settings => 'Settings';

  @override
  String get switchTheme => 'Switch Theme';

  @override
  String get language => 'Language';

  @override
  String get changeLanguage => 'Change Language';

  @override
  String get defaultUrl => 'Default URL';

  @override
  String get checkServer => 'Check Server';

  @override
  String get checkServerAddress => 'Check Server Address';

  @override
  String get checkServerHash => 'Check Server SHA256';

  @override
  String get checkServerPublicKey => 'Check Server Public Key';

  @override
  String get getFingerprints => 'Get Fingerprints';

  @override
  String get getPublicKey => 'Get Public Key';

  @override
  String get resetDefault => 'Reset Default';

  @override
  String get websiteUrl => 'Website URL';

  @override
  String get check => 'Check';

  @override
  String get version => 'Version';

  @override
  String get titleAbout => 'Check if your encrypted WEB traffic (HTTPS) is being intercepted';

  @override
  String get descriptionAbout => 'This mobile app allows you to check if your encrypted web traffic (SSL/TLS) towards secure Internet servers (HTTPS) is being intercepted.';

  @override
  String get versionApp => 'Version of the app';

  @override
  String get originalIdea => 'Original idea & Supervision';

  @override
  String get designDevProject => 'Design and development of the CheckMyHTTPS project';

  @override
  String get designDevApp => 'Design and development of the mobile app';

  @override
  String get explanation => 'Explanation';

  @override
  String get howText => 'Normally, a secure website has to prove its identity to your browser by sending a certificate validated by a recognized certificate authority.\nInterception techniques generate dynamically forged certificates in order to fool the user into believing that his connection is secure.\nThis mobile app checks that the received certificate is the right one.\nThis app will compare that the certificate received by the client (1) from a visited HTTPS website matches the certificate seen by a remote check server* (2), ensuring that no interception is taking place.\nIf they are different, your connection might be listened to! This allows us to prove the interception.';

  @override
  String defaultServer(String defaultServerAddress) {
    return 'This server is by default « $defaultServerAddress ». You can install your own server (see documentation on the CheckMyHTTPS Github).';
  }

  @override
  String get howImageTitle => 'Here is how CheckMyHTTPS works :';

  @override
  String get howImageLegend => 'Here is what happens when CheckMyHTTPS checks your HTTPS connection';

  @override
  String get next => 'Next';

  @override
  String get previous => 'Previous';

  @override
  String get close => 'Close';

  @override
  String get introTitle1 => 'Introduction';

  @override
  String get intro1 => 'This app checks if your connection is secure when you provide the URL of a website';

  @override
  String get introTitle2 => 'Share';

  @override
  String get intro2 => 'You can also launch the app from your web browser (Chrome, Firefox) by clicking on Share...';

  @override
  String get introTitle3 => 'The Server Parameters';

  @override
  String get intro3 => 'If you want to change the check server, please look at the documentation in the CheckMyHTTPS\' GitHub';

  @override
  String get noHttps => 'It is not a HTTPS website (check the URL)';

  @override
  String get serverUnreachable => 'Server unreachable...';

  @override
  String get danger => 'Your connection might be listened to...';

  @override
  String get alertOnUnicodeIdnDomainNames => 'The domain name is an international one and your browser shows it in Unicode';

  @override
  String get sslPeerUnverified => 'The requested domain name does not match the server\'s certificate.';

  @override
  String get platformNotSupported => 'Browser-based apps not supported';

  @override
  String get newCheckServer => 'The new check server has been set.';

  @override
  String get privateIp => 'We couldn\'t reach this IP from our check server (this is a private IP).';

  @override
  String get serverUnknown => 'Server unknown...';

  @override
  String get sslPinning => 'The requested check server is different. Your connection might be listened to...';

  @override
  String get secureConnection => 'Your HTTPS connection is secure.';

  @override
  String get notURL => 'It is not a URL.';

  @override
  String get save => 'Save';
}
