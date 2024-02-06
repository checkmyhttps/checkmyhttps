import "dart:convert";
import "dart:io";

import "package:checkmyhttps/services/verification_service/verification_exception.dart";
import "package:flutter/foundation.dart";
import "package:convert/convert.dart";
import "package:crypto/crypto.dart";


class Fingerprints {
  final String? ip;
  final String sha256;
  final dynamic response;

  const Fingerprints({
    required this.ip,
    required this.sha256,
    required this.response,
  });

  @override
  String toString() {
    return "\n{sha256: $sha256,\nip: $ip,\nresponse: $response,\n}\n";
  }
}


class CheckServerFingerprints {
  final dynamic apiInfo;

  const CheckServerFingerprints({
    required this.apiInfo,
  });

  @override
  String toString() {
    return "\n{apiInfo: $apiInfo,\n}\n";
  }
}


class VerificationService {
  static Future<Fingerprints> getFingerprints(Uri url, {
    bool? withResponse,
  }) async {
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
      String? ip;

      HttpClientRequest httpsConnectionRequest = await (withResponse == true
          ? client.getUrl(url)
          : client.openUrl(
        "HEAD",
        url,
      ));

      HttpClientResponse httpsConnection =
      await httpsConnectionRequest.done.timeout(
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
        response = json.decode(contents.toString());
      }
      List<int>? cert = httpsConnection.certificate?.der.toList();
      Digest? mdSHA256 = cert != null ? sha256.convert(cert) : null;
      await InternetAddress.lookup(url.host).then(
            (addressList) {
          ip = addressList
              .firstWhere(
                (address) => address.type == InternetAddressType.IPv4,
          )
              .address;
        },
      );
      client.close();

      if (mdSHA256 == null) {
        throw const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.noHttps,
        );
      }
      return Fingerprints(
        sha256: hex.encode(mdSHA256.bytes).toUpperCase(),
        ip: ip,
        response: response,
      );
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
    } on FormatException catch (err) {
      throw const VerificationException(
        type: VerificationExceptionType.warning,
        cause: VerificationExceptionCause.alertOnUnicodeIdnDomainNames,
      );
    } on SocketException catch (e) {
      if (e.message.toUpperCase().contains("FAILED HOST LOOKUP")) {
        throw const VerificationException(
          type: VerificationExceptionType.warning,
          cause: VerificationExceptionCause.serverUnreachable,
        );
      }
      rethrow;
    } on CertificateException {
      throw const VerificationException(
        type: VerificationExceptionType.unknown,
        cause: VerificationExceptionCause.sslPeerUnverified,
      );
    } catch (e) {
      throw const VerificationException(
        type: VerificationExceptionType.unknown,
        cause: VerificationExceptionCause.unknown,
      );
    }
  }


  static Future<CheckServerFingerprints> getFingerprintsFromCheckServer({
    required String apiBaseUrl,
    required String host,
    required String port,
    required String? ip,
    required String sign
  }) async {
    final requestFingerprints = await getFingerprints(
      Uri(
        scheme: "https",
        host: apiBaseUrl,
        path: "api.php",
        queryParameters: {
          "host": host,
          "port": port,
          "ip": ip,
          "sign": sign
        },
      ),
      withResponse: true,
    );

    return CheckServerFingerprints(
      apiInfo: requestFingerprints.response,
    );
  }

  static Future<CheckServerFingerprints> VerifySignatureSettings({
    required String apiBaseUrl,
  }) async {
    final requestFingerprints = await getFingerprints(
      Uri(
        scheme: "https",
        host: apiBaseUrl,
        path: "api.php",
        queryParameters: {
          "info" : "",
          "sign": ""
        },
      ),
      withResponse: true,
    );
    return CheckServerFingerprints(
      apiInfo: requestFingerprints.response,
    );
  }
}

String JsonToResponse(dynamic json) {
  // Fonction récursive pour parcourir les valeurs JSON
  String parseValues(dynamic value, String key) {
    if (key == "signature") {
      // Ignore les valeurs avec les labels spécifiés
      return "";
    } else if (value is Map) {
      // Concatène les valeurs des sous-objets, sauf pour les labels spécifiés
      return value.entries.map((entry) => parseValues(entry.value, entry.key))
          .join();
    } else if (value is Iterable) {
      // Concatène les éléments des listes
      return value.map((item) => parseValues(item, "")).join();
    } else {
      // Convertit les valeurs "true" en "1" et "false" en "0"
      if (value.toString() == "true") {
        return "1";
      } else if (value.toString() == "false") {
        return "0";
      } else {
        // Retourne la valeur simple sous forme de chaîne
        return value.toString();
      }
    }
  }
  // Vérifie si l'objet JSON est un Map et appelle la fonction récursive
  if (json is Map) {
    return json.entries.map((entry) => parseValues(entry.value, entry.key))
        .join();
  } else {
    // Si json n'est pas un Map, retourne directement sa représentation sous forme de chaîne
    return json.toString();
  }
}

