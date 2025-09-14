# CheckMyHTTPS WebExtension Changelog

## 5.7.2 - 2025-09-14
- By default, the extension icon is icon.png, not unknown.png anymore.
- Visual improvement of Options page
- Removed unused code
- getCertUrl function was used to get the certificate of an URL from user's view (if httpHeadMethod=true) and from check server's view, which was confusing because 
it was used to get either the 1st or 2nd type of certificate described but not both at the same time. The 1st type of certificate is now retrieved by function getCertFromUser, the 2nd type of certificate is now retrieved by function getCertFromCheckServer
- getCertUrl function was used to get only the body response (data) to retrieve the check server's public key, now sendRequest function does it
- Created checkMITM function in order to regroup code from verifyServerAtStartup and getCertFromCheckServer (formerly requestFromUrl)
- Handle the case of checking addons.mozilla.org's certificate which is not possible due to a safety feature where Firefox prevents its extensions from manipulating the extension store website
- Improved error handling messages
- Reorganized and improved localization messages
- Removed severalCertificates 'SC' case handling. It is now considered invalid.
- Checking an IDN (Internationalized Domain Name) website is now considered valid (as long as both certificate fingerprints are equal). 
- Made the IDN warning notification clickable to redirect the user to wikipedia's IDN homograph attack page
- Removed Warning status as severalCertificates and IDN cases are no longer considered warning

## 5.7.1 - 2024-02-04
- Fix loading of options on browser startup (custom server and public key)
- Better error messages

## 5.7.0 - 2022-08-31
- Replace SSL Pinning with RSA-SHA256 signature verification (no more update needed when the check server certificate changes! Needs server API >= 1.6.0)
- Stop sending "ip=" to the verification server if it is empty
- Add more intelligible error messages
- Improve appearance of options
- Fix a minor issue with IP, causing reccurrent error logs
- Make the notification clickable when the "Invalid Public Key" message appears, to redirect the user to the options page easily

## 5.6.0 - 2022-01-28
- Add IP getter and call API with it, in order to avoid false negatives
- Improve appearance of options 

## 5.5.4 - 2022-01-05
- Update the fingerprint of the check server certificate

## 5.5.3 - 2021-01-07
- Update the fingerprint of the check server certificate

## 5.5.2 - 2020-07-28
- Set the "Tabs" permission again (in order to check HTTPS on all tabs)
- Change the minimum Firefox version compatibility to 62 (due to the function "webRequest.getSecurityInfo")

## 5.5.1 - 2020-05-25
- Remove polyfill to save data
- Verify the default check server's fingerprint while starting a new browser window
- Display the "warning padlock" when an IDN attack is detected
- Reduce permissions ("Tabs" to "activeTab")
- The browser icon is now entitled

## 5.5.0 - 2020-01-16
- Remove the native App (needed with FF < V62)
- Remove two useless permissions ("downloads" & "nativeMessaging")--> improving your privacy
- webextension-polyfill 0.6.0

## 5.4.1 - 2019-11-27
- Update the SHA256 fingerprint of the default check server (certificate renewal)

## 5.4.0 - 2019-08-25
- Add the option to disable notifications.

## 5.3.2 - 2019-05-30
- Fix the error message when the check server is down.

## 5.3.1 - 2019-05-06
- Fix a bug preventing the error message when checking the check server.

## 5.3.0 - 2019-03-15
- Fix potential false positives on unsecured pages blocked by Firefox.
- Remove SHA1 fingerprints comparison.
- Replace the icons

## 5.2.1 - 2019-02-01
- Fix SSL Pinning on Check Server.

## 5.2.0 - 2019-01-30
- Support the WebExtension TLS API (the Python script is now optional on Firefox > 62).
- Back on Firefox Mobile!
- Improved tab management.

## 5.1.1 - 2018-11-09
- Fix compatibility with Python 3.7 (migrate a depreciated function).

## 5.1.0 - 2018-11-08
- Add proxy support in Python script.
- Increase timeout to 10sec.

## 5.0.0 - 2018-05-06
- Migration to WebExtension!
- Use a Python script to perform a check (pending the WebExtension TLS API).

## 4.3.0 - 2017-11-09
- Check issuer certificate if the first check fails.
- Display an alert when check server API request fails.
- Add a slash at the end of check server URL if it is missing in the settings.

## 4.2.0 - 2017-10-20
- Add the ability to self-host the check server.
- Fix a bug on Android.

## 4.1.1 - 2017-06-25
- Add support to "Waterfox".

## 4.1.0 - 2017-06-09
- Show a warning message for international domain names printed in Unicode.

## 4.0.1 - 2017-05-14
- Remove update checker (not allowed by Firefox).

## 4.0.0 - 2017-03-15
- Code rewrite.
- Add Android support.
- New CheckMyHTTPS server API.
- Individual tab status.
- Add SSL pinning on CheckMyHTTPS server.
- Merge two requests (new version & SSL pinning) at start.
- Send only host&port of website to the CheckMyHTTPS server.
- Fix French l18n detection on Windows.
- Some spelling corrections.

## 3.2.1 - 2017-01-23
- Fix: get certificate of the correct tab.

## 3.2.0 - 2017-01-21
- Add automatic check on page loaded.

## 3.1.2 - 2017-01-13
- Fix update checker.

## 3.1.1 - 2017-01-08
- Fix: prevent to check certificate of private IPs.

## 3.1.0
- amélioration de la vérification de la version
- l'utilisateur est avertis lorsqu'il teste son HTTPS sur un site d'exception (site HTTPS présentant plusieurs certificats). La liste de ces exceptions se trouve ici : https://checkmyhttps.net/website_exception.txt)

## 3.0.8
- mise a jour de l'empreinte avec le nouveau certificat
- Prévenir l'utilisateur lorsqu'une mise à jour est disponible.

## 3.0.7
- thumbprint of server certificate is now hardcoded to avoid pirate's modifications (if there is a MITM SSL).

## 3.0.5
- author has been changed: ESIEA CNS -> ESIEA CNS-CVO 

## 3.0.4
- Now you can use checkmyhttps during your private browsing 

## 3.0.3
- We notify users when they are testing on private ip address because checkmyhttps server couldn't reach private ip !

## 3.0.1
- Logo has been changed for colorblind people

## 3.0.0
- need to be updated to SDK.
- left click on the addon to check your HTTPS on the consulting website.
- test on CheckMyHTTPS server certificate during start-up.

## 2.0.0
- switch SDK to Xul-based addon
- left click on the addon to check your HTTPS on the consulting website.
- show details : right click on the addon.

## 1.0.0
- developped using Firefox SDK
- comparaison des certificats vu par le client et le serveur
- test on CheckMyHTTPS server certificate only.
