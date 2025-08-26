import "package:checkmyhttps/assets/assets.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:flutter/cupertino.dart";

import "package:checkmyhttps/services/services.dart";
import "package:checkmyhttps/widgets/widgets.dart";

import "../services/verification_service/verification_exception.dart";

Future<T?> showAlert<T>({
  required BuildContext context,
  required Alert alert,
  required bool barrierDismissible,
}) async {
  return showCupertinoDialog<T>(
    context: context,
    barrierDismissible: barrierDismissible,
    builder: (buildContext) => alert,
  );
}

Future<T?> showVerificationExceptionAlert<T>(
  VerificationException exception,
  BuildContext context,
) async {
  return showAlert(
    context: context,
    barrierDismissible: true,
    alert: Alert(
      image: () {
        switch (exception.type) {
          case VerificationExceptionType.warning:
            return const AssetImage(CmhAssets.warningLogo);
          case VerificationExceptionType.invalid:
            return const AssetImage(CmhAssets.invalidLogo);
          case VerificationExceptionType.unknown:
            return const AssetImage(CmhAssets.unknownLogo);
          case VerificationExceptionType.valid:
            return const AssetImage(CmhAssets.validLogo);
          default:
            return const AssetImage(CmhAssets.unknownLogo);
        }
      }(),
      subtitle: () {
        switch (exception.cause) {
          case VerificationExceptionCause.danger:
            return AppLocalizations.of(context).danger;
          case VerificationExceptionCause.alertOnUnicodeIdnDomainNames:
            return AppLocalizations.of(context).alertOnUnicodeIdnDomainNames;
          case VerificationExceptionCause.noHttps:
            return AppLocalizations.of(context).noHttps;
          case VerificationExceptionCause.platformNotSupported:
            return AppLocalizations.of(context).platformNotSupported;
          case VerificationExceptionCause.serverUnreachable:
            return AppLocalizations.of(context).serverUnreachable;
          case VerificationExceptionCause.sslPeerUnverified:
            return AppLocalizations.of(context).sslPeerUnverified;
          case VerificationExceptionCause.serverUnknown:
            return AppLocalizations.of(context).serverUnknown;
          case VerificationExceptionCause.sslPinning:
            return AppLocalizations.of(context).sslPinning;
          case VerificationExceptionCause.notURL:
            return AppLocalizations.of(context).notURL;
          case VerificationExceptionCause.checkServerPublicKey:
            return AppLocalizations.of(context).checkServerPublicKey;
          case VerificationExceptionCause.privateIp:
            return AppLocalizations.of(context).privateIp;
          default:
            return null;
        }
      }(),
    ),
  );
}

void hideAlert() {
  if (NavigationService.navigatorKey.currentContext != null) {
    return NavigationService().pop();
  }
}
