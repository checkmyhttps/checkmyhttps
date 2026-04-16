# CheckMyHTTPS Mobile App Changelog

## 5.7.3 - 2026-04-16

- Removed hardcoded SHA256 of check server's certicate (cmh_sha256). If there is a MITM with a valid signature, the RSA-SHA256 signature verification would be OK but the signed body response will still contain the (right) SHA256 of the requested's website certificate. Hence, that last hash will be different from the (wrong) SHA256 of the certificate on client side and CMH status will be invalid
- Removed API query parameter 'sign'. Now, every request is signed, no need to specify this parameter
- When serverUnreachable (CMH server or host to check), it now displays the unknown logo instead of the warning one

## 5.7.2 - 2025-06-27

- Updates to current Flutter syntax
- Target SDK set to Android 15 (API level 35)
- Minimum SDK set to Android 14 (API level 34) as required by Google to publish on Play Store
- Small fixes of localization files

## 5.7.1 - 2023-02-06

- switch framework to Flutter
- add signature control on server response

## 1.3.0 - 2022-02-28
- Add IP getter and call API with, in order to avoid false negatives
- Update of dependencies
- Remove whitelist

## 1.2.0 - 2022-01-24
- Update of Ionic & Angular & npm packages
- Update CNS Logo & ESIEA Logo
- Update of the SHA256 fingerprint of the default check server (certificate renewal)
- Add alert if testing and unreachable server

## 1.1.5 - 2019-11-29
- Update of npm packages
- Update of the SHA256 fingerprint of the default check server (certificate renewal)

## 1.1.4 - 2019-08-25
- Upgrade of npm packages (lodash and mem).
- Update of the JSON-based translation function.
- Adding version information to the app.

## 1.1.1 - 2019-06-30
- Update of dependencies
- Target SDK set to Android 9 (API level 28)

## 1.0.0 - 2019-04-16
- Developed with Ionic and Cordova.
- Checks the certificates from the client and the check server.
