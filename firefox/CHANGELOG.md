# CheckMyHTTPS changelog

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
