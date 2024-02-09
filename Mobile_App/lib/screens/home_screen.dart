import "dart:async";
import "dart:io";
import 'dart:convert';
import "dart:typed_data";

import "package:flutter/material.dart";

import "package:checkmyhttps/assets/assets.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/utils/utils.dart";
import "package:checkmyhttps/widgets/widgets.dart";
import "package:checkmyhttps/services/services.dart";
import 'package:fast_rsa/fast_rsa.dart';

import "package:receive_sharing_intent/receive_sharing_intent.dart";

import "../services/verification_service/verification_exception.dart";

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final storageService = SharedPrefsStorageService();
  late TextEditingController defaultUrl;
  StreamSubscription? _intentDataStreamSubscription;
  bool loading = false;
  @override
  void initState() {
    super.initState();
    defaultUrl = TextEditingController(
      text: storageService.getAppDefaultUrl(),
    );
    if (Platform.isAndroid) {
      _intentDataStreamSubscription =
          ReceiveSharingIntent.getTextStream().listen((value) {
            if (value.isNotEmpty) {
              defaultUrl.value = defaultUrl.value.copyWith(
                text: value,
              );
            }
          });
      ReceiveSharingIntent.getInitialText().then((value) {
        if (value != null && value.isNotEmpty) {
          defaultUrl.value = defaultUrl.value.copyWith(
            text: value,
          );
        }
      });
    }
  }

  void handleUrlCheck([String? url]) async {
    closeKeyboard();
    var checkUrl = url ?? defaultUrl.value.text;
    var isValidUrl = await isCheckableUrl(checkUrl);
    ///if website URL is valid
    if (isValidUrl) {
      setState(() {
        loading = true;
      });
      showAlert(
        context: context,
        barrierDismissible: false,
        alert: Alert(
          image: const AssetImage(CmhAssets.loadLogo),
        ),
      );

      Fingerprints? dataCert;
      VerificationException? dataCertException;
      CheckServerFingerprints? checkServerData;

      try {
        dataCert = await VerificationService.getFingerprints(
          Uri.parse(checkUrl),
        );
      } on VerificationException catch (err) {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
        debugPrint("ERROR(dataCertException): $dataCertException");
      } catch (err) {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
        debugPrint("ERROR(dataCert): $err");
      }
      /// if no error about reaching the website we send api request
      if(dataCertException == null) {
        try {
          checkServerData =
          await VerificationService.getFingerprintsFromCheckServer(
              apiBaseUrl: Uri
                  .parse(storageService.getAppCheckServerAddress()!)
                  .host,
              host: Uri
                  .parse(checkUrl)
                  .host,
              port: Uri
                  .parse(checkUrl)
                  .port
                  .toString(),
              ip: dataCert?.ip,
              sign: ""
          );
        } catch (err) {
          dataCertException = const VerificationException(
            type: VerificationExceptionType.warning,
            cause: VerificationExceptionCause.serverUnreachable,
          );
          debugPrint("ERROR(checkServerData): $err");
        }
      }
      else{
        hideAlert();
        setState(() {
          loading = false;
        });
        showVerificationExceptionAlert(
          dataCertException,
          context,
        );
      }

      bool SignatureResult = false;
      if (checkServerData != null){
        var Response =  JsonToResponse(checkServerData.apiInfo);
        SignatureResult = await RSA.verifyPKCS1v15Bytes(
            base64.decode(checkServerData.apiInfo["signature"].toString()),
            Uint8List.fromList(Response.codeUnits),
            Hash.SHA256,
            storageService.getAppCheckServerPublicKey().toString()
        );
      }
      if (!SignatureResult) {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.invalid,
          cause: VerificationExceptionCause.sslPinning,
        );
      }
      if (dataCertException?.cause == VerificationExceptionCause.danger &&
          checkServerData?.apiInfo["error"] == "HOST_UNREACHABLE") {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
      } else if (dataCert == null &&
          checkServerData?.apiInfo["error"] == "HOST_UNREACHABLE") {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
      } else if (checkServerData!.sha256 == null) {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
      } else if (dataCert == null &&
          checkServerData?.apiInfo["error"] == "UNKNOWN_HOST") {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnknown,
        );
      } else if (checkServerData == null) {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
      }

      if (dataCert?.sha256 != checkServerData!.apiInfo["fingerprints"]["sha256"] ||
          checkServerData?.apiInfo?["issuer"] == null ||
          checkServerData!.sha256.toString() != checkServerData.apiInfo["cmh_sha256"]) {
        dataCertException = const VerificationException(
          type: VerificationExceptionType.invalid,
          cause: VerificationExceptionCause.danger,
        );
      }

      if (context.mounted) {
        hideAlert();
        if (dataCertException != null) {
          showVerificationExceptionAlert(
            dataCertException,
            context,
          );
        } else {
          showAlert(
            context: context,
            barrierDismissible: true,
            alert: Alert(
              image: const AssetImage(CmhAssets.validLogo),
              subtitle: AppLocalizations.of(context).secureConnection,
            ),
          );
        }
      }
    }
    setState(() {
      loading = false;
    });
  }

  void handleDefaultUrl() async {
    closeKeyboard();
    defaultUrl.value = defaultUrl.value.copyWith(
      text: storageService.getAppDefaultUrl(),
    );
  }

  Future<bool> isCheckableUrl(String urlString) async {
    var url = Uri.parse(urlString);
    if (url.scheme != "https") {
      if (context.mounted) {
        await showAlert(
          barrierDismissible: true,
          context: context,
          alert: Alert(
            image: const AssetImage(CmhAssets.unknownLogo),
            subtitle: AppLocalizations.of(context).noHttps,
          ),
        );
        setState(() {
          loading = false;
        });
        return false;
      }
    }
    if (RegExp(
        r"((127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.))+[0-9\.]+")
        .allMatches(url.host)
        .isNotEmpty) {
      if (context.mounted) {
        await showAlert(
          barrierDismissible: true,
          context: context,
          alert: Alert(
            image: const AssetImage(CmhAssets.unknownLogo),
            subtitle: AppLocalizations.of(context).privateIp,
          ),
        );
        setState(() {
          loading = false;
        });
        return false;
      }
    }
    return true;
  }



  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        (MediaQuery.of(context).size.width > MediaQuery.of(context).size.height) ?
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          alignment: WrapAlignment.center,
          spacing: 50,
          runSpacing: 10,
          children: [
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black,
                BlendMode.srcATop,
              ),
              child: Image(
                image: const AssetImage(CmhAssets.logoEsiea),
                width: MediaQuery.of(context).size.width / 3,
                height: MediaQuery.of(context).size.height / 6,
                fit: BoxFit.contain,
              ),
            ),
            Image(
              image: const AssetImage(CmhAssets.logo),
              width: MediaQuery.of(context).size.height / 6,
              fit: BoxFit.contain,
            ),
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black,
                BlendMode.srcATop,
              ),
              child: Image(
                image: const AssetImage(CmhAssets.logoCns),
                width: size.width / 3,
                height: MediaQuery.of(context).size.height / 6,
                fit: BoxFit.contain,
              ),
            ),
          ],
        )
            :
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          alignment: WrapAlignment.center,
          spacing: 50,
          runSpacing: 10,
          children: [
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black,
                BlendMode.srcATop,
              ),
              child: Image(
                image: const AssetImage(CmhAssets.logoEsiea),
                width: MediaQuery.of(context).size.width / 3,
                height: size.height / 6,
                fit: BoxFit.contain,
              ),
            ),
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black,
                BlendMode.srcATop,
              ),
              child: Image(
                image: const AssetImage(CmhAssets.logoCns),
                width: MediaQuery.of(context).size.width / 3,
                height: size.height / 6,
                fit: BoxFit.contain,
              ),
            ),
          ],
        ),
        (MediaQuery.of(context).size.width > MediaQuery.of(context).size.height) ?
        Image(
          image: const AssetImage(CmhAssets.logo),
          width: size.width / 4000000,
          fit: BoxFit.contain,
        ) : Image(
          image: const AssetImage(CmhAssets.logo),
          width: MediaQuery.of(context).size.width / 4,
          fit: BoxFit.contain,
        ) ,
        SettingsItem(
          title: AppLocalizations.of(context).websiteUrl,
          trailingSubtitle: true,
          trailing: Padding(
            padding: const EdgeInsets.only(
              top: 8,
              bottom: 20,
            ),
            child: (MediaQuery.of(context).size.width > MediaQuery.of(context).size.height) ?
            Row (
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 14.0),
                  child: FloatingActionButton(
                    onPressed: handleDefaultUrl,
                    backgroundColor: Colors.white60,
                    elevation: 10,
                    child: Image(
                      image: const AssetImage(CmhAssets.reset),
                      width: 40,
                      fit: BoxFit.contain,
                    ) ,
                  ),
                ),
                Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                          suffixIcon: IconButton(
                            icon: Icon(Icons.send),
                            onPressed: handleUrlCheck,
                          )
                      ),
                      keyboardType: TextInputType.url,
                      controller: defaultUrl,
                    )
                )
              ],
            )
                :
            InputField(
              disabled: loading,
              maxHeight: 60,
              keyboardType: TextInputType.url,
              withSuffix: false,
              onSubmit: handleUrlCheck,
              controller: defaultUrl,
            ),
          ),
        ),
        (MediaQuery.of(context).size.width > MediaQuery.of(context).size.height) ?
        Text(
          'Easter Egg',
          style: TextStyle(
            fontSize: 0.1,
            fontWeight: FontWeight.bold,
            color: Colors.white, // Vous pouvez personnaliser la couleur
          ),
        ) :
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          alignment: WrapAlignment.center,
          spacing: 50,
          runSpacing: 10,
          children: [
            ActionButton(
              text: AppLocalizations.of(context).defaultUrl,
              onPressed: handleDefaultUrl,
              backgroundColor: lighten(
                color: Theme.of(context).primaryColor,
                percentage: 30,
              ),
              textColor: Colors.black,
              disabled: loading,
            ),
            ActionButton(
              text: AppLocalizations.of(context).check,
              onPressed: handleUrlCheck,
              loading: loading,
            ),
          ],
        ),
      ],
    );
  }

  @override
  void dispose() {
    _intentDataStreamSubscription?.cancel();
    super.dispose();
  }
}
