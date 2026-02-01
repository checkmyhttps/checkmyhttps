# CheckMyHTTPS

CheckMyHTTPS ensures that your secured WEB connections (HTTPS) are not intercepted (neither decrypted, nor listened, nor modified).
We have created several simple tools that use this method : Firefox & Chromium-based WEB browser add-ons and an Android app.

# Apps

<table>
  <tr>
    <td> <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png" alt="Firefox"> </td>
    <td> <a href="https://addons.mozilla.org/firefox/addon/checkmyhttps/"> Firefox extension </td>
  </tr>
      
  <tr>
    <td> <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png" alt="Chrome"> </td>
    <td> <a href="https://chrome.google.com/webstore/detail/checkmyhttps/jbnodnfpdcegpnflleanllmiihkinkio"> Chrome extension </td>
  </tr>
      
  <tr>
    <td> <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png" alt="Edge"> </td>
    <td> <a href="https://microsoftedge.microsoft.com/addons/detail/checkmyhttps/mmlpjbghilldlicldekojefgfckcpmbf"> Edge extension </td>
  </tr>
      
  <tr>
    <td> <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png" alt="Opera"> </td>
    <td> <a href="https://addons.opera.com/en/extensions/details/checkmyhttps/"> Opera extension </td>
  </tr>

  <tr>
    <td> <img src="https://developer.android.com/static/images/brand/android-head_flat.svg" alt="Android" width="48"> </td>
    <td> <a href="https://play.google.com/store/apps/details?id=fr.esiea.checkmyhttps"> <img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" alt="Download from Google Play" height="70"> </td>
  </tr>
</table>

# How it works?

When browsing on secured sites ("https://..." websites), you can check the security status by clicking on the extension icon <img src="Chromium/images/icon.png" width="16"/>.

- The icon is green <img src="Chromium/images/valid.png" width="16"/> : your connection is not compromised;
- The icon is red <img src="Chromium/images/invalid.png" width="16"/> : your connection is considered very risky (hijacked, modified, listened);
- The icon is gray <img src="Chromium/images/unknown.png" width="16"/> : the verification is impossible (check server is unreachable, network error);
- The icon is black <img src="Chromium/images/working.png" width="16"/> : the verification is in progress.

# Repository structure

```
.
├── Chromium/        # Chromium-based browser extension
├── Mobile_App/      # Android app
├── server-php/      # Check server (backend)
└── webextension/    # Firefox extension
```

# Respect for privacy:

The CheckMyHTTPS extension requires to send only two parameters to the check server :
- The domain name of the visited website;
- The IP address of the visited website.
You have free choice regarding the website to check.

Moreover, we give you the possibility to be free regarding the check server as you can make and host your own.

# More details:

A secure website (HTTPS) justifies its identity with your browser by sending a certificate validated by a recognized certification authority. Interception techniques, to be able to work, dynamically forge false certificates (a bit like a fake identity card).
The method we propose to you, verifies that the certificate you receive is the one issued by the server.

All explanations are detailed on the https://checkmyhttps.net project website.

________________________________________________________________________________

# CheckMyHTTPS

CheckMyHTTPS s'assure que vos connexions WEB sécurisées (protocole 'HTTPS') ne sont pas interceptées (ni déchiffrées, ni écoutées, ni modifiées).
Nous avons créé plusieurs outils simples utilisant cette méthode : des extensions pour navigateurs WEB Firefox et Chromium, ainsi qu’une application Android.

# Comment cette extension fonctionne-t-elle ?

Lors de votre navigation sur des sites sécurisés (sites en "https://..."), vous pouvez vérifier l’état de la sécurité en cliquant sur l'icône de l’extension.
L'icône est verte : votre connexion n’est pas compromise;
L'icône est rouge : votre connexion est considérée comme très risquée (détournement, modification, écoute)
L'icône est grise : la vérification est impossible (le serveur de vérification est injoignable, erreur réseau);
L'icône est noire : la vérification est en cours.

# Respect de la vie privée :

L’extension CheckMyHTTPS nécessite d'envoyer seulement deux paramètres au serveur de vérification:
- Le nom de domaine du site visité;
- L'adresse IP du site visité.
Vous avez le libre choix concernant le site web à vérifier.

De plus, nous vous offrons la possibilité de choisir librement le serveur de vérification, en créant et en hébergeant le vôtre.

# Plus de détails :

Un site web sécurisé (HTTPS) justifie son identité auprès de votre navigateur par l’envoi d’un certificat de sécurité validé par une autorité de certification reconnue. Les techniques d'interception, pour fonctionner, génèrent dynamiquement de faux certificats (un peu comme une fausse carte d'identité). La méthode que nous vous proposons vérifie que le certificat que vous recevez est bien celui qui a été émis par le serveur.

________________________________________________________________________________

# Authors

Original idea & project management: Richard REY (aka Rexy)

Previous developers : Sylvain BOUTEILLER, Adrien SCHNEIDER, Cyril LEBLAY, Raphaël PION, Hugo MEZIANI, Tom HOUDAYER, Catarina DE FARIA, Quentin COLLART, Mathis CADIO, Ghassen LAHDHIRI, Ahmed BOUSRIH, Mehdi BELAJOUZA

Logo: Clément SICCARDI

# LICENSE

GPL v3
