import "dart:convert";
import "dart:io";
import "package:fast_rsa/fast_rsa.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:flutter/cupertino.dart";
import "package:checkmyhttps/utils/utils.dart";
import "package:checkmyhttps/services/services.dart";
import "package:checkmyhttps/config/config.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/settings/settings.dart";
import "package:checkmyhttps/themes/themes.dart";
import "package:checkmyhttps/widgets/widgets.dart";
import "../services/verification_service/verification_exception.dart";

class InputField extends StatelessWidget {
  final bool withSuffix;
  final TextInputType keyboardType;
  final TextEditingController controller;
  final bool disabled;
  final void Function(String)? onSubmit;
  final double fontSize;

  const InputField({
    super.key,
    this.withSuffix = false,
    this.keyboardType = TextInputType.text,
    required this.controller,
    this.disabled = false,
    this.onSubmit,
    this.fontSize = 20,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: null,
      enabled: true,
      onSubmitted: onSubmit,
      decoration: InputDecoration(
        suffixIcon: withSuffix ? const Icon(Icons.abc) : null,
      ),
      style: TextStyle(fontSize: fontSize),
    );
  }
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final storageService = SharedPrefsStorageService();
  late TextEditingController defaultUrl;
  late TextEditingController checkServerAddress;
  late TextEditingController checkServerPublicKey;
  bool loading = false;

  @override
  void initState() {
    super.initState();
    defaultUrl = TextEditingController(text: storageService.getAppDefaultUrl());
    checkServerAddress = TextEditingController(
      text: storageService.getAppCheckServerAddress(),
    );
    checkServerPublicKey = TextEditingController(
      text: storageService.getAppCheckServerPublicKey(),
    );
  }

  /// Function to handle theme change in the application.
  void handleChangeTheme(bool isDark) async {
    await storageService.setDarkTheme(isDark);
    CmhAppSettings.instance.changeTheme();
  }

  /// Function to handle language change in the application.
  void handleLanguageChange(String? language) async {
    if (language != null) {
      await storageService.setAppLanguage(language);
      CmhAppSettings.instance.changeLanguage(language);
    }
  }

  /// Function to handle changes to the default URL in the application.
  void handleDefaultUrlChange(String value) async {
    if (value.isNotEmpty) {
      closeKeyboard();
      await storageService.setAppDefaultUrl(value);
      defaultUrl.value = defaultUrl.value.copyWith(text: value);
    }
  }

  /// Function to handle changes to the check server address in the application.
  void handleCheckServerAddressChange(String value) async {
    if (value.isNotEmpty) {
      await storageService.setAppCheckServerAddress(value);
      checkServerAddress.value = checkServerAddress.value.copyWith(text: value);
    }
  }

  /// Function to handle changes to the check server public key in the application.
  void handleCheckServerPublicKeyChange(String value) async {
    if (value.isNotEmpty) {
      await storageService.setAppCheckServerPublicKey(value);
      checkServerPublicKey.value = checkServerPublicKey.value.copyWith(
        text: value,
      );
    }
  }

  /// Function to save settings and perform verification.
  void save() async {
    closeKeyboard();
    setState(() {
      loading = true;
    });
    VerificationException? dataCertException;
    handleDefaultUrlChange(defaultUrl.text);
    handleCheckServerAddressChange(checkServerAddress.value.text);
    CheckServerFingerprints? checkServerData;
    checkServerData = await VerificationService.verifySignatureSettings(
      apiBaseUrl: Uri.parse(checkServerAddress.text).host,
    );
    var response = jsonToResponse(checkServerData.apiInfo);

    /// Perform RSA signature verification.
    bool result = await RSA.verifyPKCS1v15Bytes(
      base64.decode(checkServerData.apiInfo["signature"].toString()),
      Uint8List.fromList(response.codeUnits),
      Hash.SHA256,
      checkServerPublicKey.text.toString(),
    );

    /// Check verification result and handle accordingly.
    if (result == false) {
      dataCertException = const VerificationException(
        type: VerificationExceptionType.warning,
        cause: VerificationExceptionCause.checkServerPublicKey,
      );
    } else {
      /// Update check server public key if verification is successful.
      handleCheckServerPublicKeyChange(checkServerPublicKey.text);
    }

    /// Display verification exception alert if there is an exception.
    if (dataCertException != null) {
      showVerificationExceptionAlert(dataCertException, context);
    }
    setState(() {
      loading = false;
    });
  }

  void resetDefault() async {
    handleDefaultUrlChange(CmhConfig.defaultUrl);
    handleCheckServerAddressChange(CmhConfig.checkServerAddress);
    handleCheckServerPublicKeyChange(CmhConfig.checkServerPublicKey);
  }

  void getPublicKey() async {
    closeKeyboard();
    setState(() {
      loading = true;
    });

    bool withResponse = true;
    Uri url = Uri.parse("${checkServerAddress.value.text}download/public_key");
    try {
      if (kIsWeb == true) {
        throw const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.platformNotSupported,
        );
      }

      if (url.scheme.toUpperCase() != "HTTPS") {
        throw const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.noHttps,
        );
      }

      HttpClient client = HttpClient();
      dynamic response;

      HttpClientRequest httpsConnectionRequest =
          await (withResponse == true
              ? client.getUrl(url)
              : client.openUrl("HEAD", url));

      HttpClientResponse httpsConnection = await httpsConnectionRequest.done
          .timeout(
            const Duration(milliseconds: 1000),
            onTimeout: () {
              return httpsConnectionRequest.close();
            },
          );
      if (withResponse == true) {
        final contents = StringBuffer();
        await for (var data in httpsConnection.transform(utf8.decoder)) {
          contents.write(data);
        }
        response = contents;
      }
      checkServerPublicKey.text = response.toString();
      client.close();
    } on HandshakeException catch (e) {
      if (e.message.toUpperCase().contains("HANDSHAKE ERROR")) {
        throw const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
      } else {
        throw const VerificationException(
          type: VerificationExceptionType.invalid,
          cause: VerificationExceptionCause.danger,
        );
      }
    }
    setState(() {
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SettingsGroup(
          items: [
            SettingsItem(
              icon:
                  Theme.of(context).brightness == Brightness.light
                      ? Icons.light_mode_rounded
                      : Icons.dark_mode_rounded,
              iconColor: CmhDarkTheme().data.colorScheme.surface,
              iconBackgroundColor: CmhLightTheme().data.colorScheme.surface,
              title:
                  Theme.of(context).brightness == Brightness.light
                      ? CmhAppSettings.instance.l10n.lightTheme
                      : CmhAppSettings.instance.l10n.darkTheme,
              subtitle: AppLocalizations.of(context).switchTheme,
              trailing: Switch.adaptive(
                activeColor: Theme.of(context).primaryColor,
                value: Theme.of(context).brightness == Brightness.dark,
                onChanged: handleChangeTheme,
              ),
            ),
            SettingsItem(
              icon: Icons.language,
              iconColor: CmhDarkTheme().data.colorScheme.surface,
              iconBackgroundColor: CmhLightTheme().data.colorScheme.surface,
              title: AppLocalizations.of(context).language,
              subtitle: AppLocalizations.of(context).changeLanguage,
              trailing: DropdownButton(
                dropdownColor: Theme.of(context).colorScheme.surface,
                isDense: true,
                value: CmhAppSettings.instance.getLanguageName(),
                icon: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Theme.of(context).primaryColor,
                ),
                elevation: 16,
                style: TextStyle(color: Theme.of(context).primaryColor),
                underline: const SizedBox.shrink(),
                onChanged: handleLanguageChange,
                items:
                    CmhAppSettings.instance.languages.keys.map((String value) {
                      return DropdownMenuItem(value: value, child: Text(value));
                    }).toList(),
              ),
            ),
            SettingsItem(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              icon: Icons.link_rounded,
              iconColor: CmhDarkTheme().data.colorScheme.surface,
              iconBackgroundColor: CmhLightTheme().data.colorScheme.surface,
              title: AppLocalizations.of(context).defaultUrl,
              trailingSubtitle: true,
              trailing: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: InputField(
                  keyboardType: TextInputType.url,
                  onSubmit: handleDefaultUrlChange,
                  controller: defaultUrl,
                ),
              ),
            ),
          ],
        ),
        SettingsGroup(
          title: AppLocalizations.of(context).checkServer,
          items: [
            SettingsItem(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              icon: CupertinoIcons.link,
              iconColor: CmhDarkTheme().data.colorScheme.surface,
              iconBackgroundColor: CmhLightTheme().data.colorScheme.surface,
              title: AppLocalizations.of(context).checkServerAddress,
              trailingSubtitle: true,
              trailing: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: InputField(
                  withSuffix: false,
                  keyboardType: TextInputType.url,
                  controller: checkServerAddress,
                  disabled: loading,
                ),
              ),
            ),
            SettingsItem(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              icon: Icons.key,
              iconColor: CmhDarkTheme().data.colorScheme.surface,
              iconBackgroundColor: CmhLightTheme().data.colorScheme.surface,
              title: AppLocalizations.of(context).checkServerPublicKey,
              trailingSubtitle: true,
              trailing: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: InputField(
                  withSuffix: false,
                  keyboardType: TextInputType.text,
                  controller: checkServerPublicKey,
                  disabled: true,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          alignment: WrapAlignment.center,
          spacing: 50,
          runSpacing: 10,
          children: [
            ActionButton(
              text: AppLocalizations.of(context).save,
              onPressed: save,
              loading: loading,
              textColor: Colors.white,
            ),
            ActionButton(
              text: AppLocalizations.of(context).resetDefault,
              onPressed: resetDefault,
              loading: loading,
              textColor: Colors.white,
            ),
            ActionButton(
              text: AppLocalizations.of(context).getPublicKey,
              onPressed:
                  getPublicKey, //(Uri.parse("https://checkmyhttps.net/download/public_key")),
              loading: loading,
              textColor: Colors.white,
            ),
            Container(margin: EdgeInsets.only(top: 10)),
          ],
        ),
      ],
    );
  }
}
