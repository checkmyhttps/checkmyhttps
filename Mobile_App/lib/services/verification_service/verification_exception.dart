enum VerificationExceptionType {
  invalid,
  unknown,
  warning,
  valid,
}

enum VerificationExceptionCause {
  platformNotSupported,
  noHttps,
  privateIp,
  serverUnreachable,
  danger,
  alertOnUnicodeIdnDomainNames,
  sslPeerUnverified,
  unknown,
  serverUnknown,
  sslPinning,
  notURL,
  checkServerPublicKey,
}

class VerificationException implements Exception {
  final VerificationExceptionType type;
  final VerificationExceptionCause cause;

  const VerificationException({
    required this.type,
    required this.cause,
  });

  @override
  String toString() {
    return "\n{type: ${type.name},\ncause: ${cause.name}\n,}\n";
  }
}