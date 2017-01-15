#CheckMyHTTPS
We propose a user-friendly addon that allows you to check if your encrypted web traffic (SSL/TLS) towards secured Internet servers (HTTPS) is not intercepted (being listened to). 

#How it works ?

During the browser start up, a first test will be made on our website (checkmyhttps).
A green lock means a secured connection.
A red lock means that your connection might be listened to...
If you have any doubt, you are free to check your connection on other HTTPS website by clicking on the lock. Don't forget to make this test on HTTPS websites ! :)

#About my privacy?
The extension sends parameters to our server.
[+] URL of an HTTPS website
[+] SHA1/SHA256 fingerprint of the server certificate chosen by the extension.

We gave the possibility to be free concerning the HTTPS website to check. You just have to click. No one will access to your privacy! :)

#More detail !

Normally, a secured website has to prove its identity to your browser by sending a certificate validated by a recognized certificate authority. Interception techniques, to be able to work, generate dynamically forged certificates.
CheckMyHTTPS checks that the received certificate from a visited HTTPS website matches the certificate seen by a remote server, ensuring no interception is taking place within your local network. This is sufficient to prove the interception.

________________________________________________________________________________

#CheckMyHTTPS
Nous proposons une extension Firefox facile d'utilisation permettant de vérifier si vos connexions HTTPS sont sur-écoutes.

#Comment cette extension fonctionne ?

Un premier test va être effectué sur notre site (checkmyhttps) lors du démarrage de votre navigateur Firefox :
-Le cadenas est VERT : votre connexion SSL n'est pas compromise, tout va bien! :)
-Le cadenas est Rouge : votre connexion SSL est peut être sur écoute... :o
Si vous avez un doute lors de votre navigation, vous êtes libre de "checker" en cliquant sur le cadenas de l'extension.
N'oubliez pas de le faire sur un site HTTPS ("https://" visible dans l'URL)

#Concernant ma vie privé :
L'extension a besoin de ces paramètres :
[+] Le lien du site https
[+] L'empreinte SHA1/SHA256 du certificat serveur choisi par vous.

Vous avez le libre choix concernant le site à "checker". Comme ça personne n'aura accès à votre vie privée ! :)

#Plus de détails !

Normalement, un site Internet sécurisé se doit de prouver son identité à votre navigateur Firefox en envoyant son certificat. On peut voir ce certificat comme un genre de carte d'identité délivré par des autorités supérieurs (Certificate Authorities). Il existe une technique pour déchiffrer votre connexion sécurisée, il suffit de créer un faux certificat (fausse carte d'identité) afin de se faire passer pour le site que vous etes en train de visiter. Ainsi vos mot de passe et numéro de carte bancaire pourront être visible!

C'est très embêtant, néanmoins notre extension permet de déceler ce genre de pratique qui peut être mise en place au sein même de votre entreprise (SSL Inspection). Si tel est le cas, à vous de vous référer à sa charte informatique afin de vous renseigner sur la légalisation de cette pratique.

CheckmyHTTPS permet de comparer le certificat d'un site sécurisé vu par votre navigateur avec le certificat vu par un équipement réseau contrôlé sur Internet. Si les certificats diffèrent, alors votre connexion est sur écoute car l'identité du serveur est usurpé => cadenas ROUGE

________________________________________________________________________________

#Author
Design & development: Raphaël PION, Hugo MEZIANI & Tom HOUDAYER

Original idea & Supervision: Richard REY (aka Rexy)

Logo: Clément SICCARDI

#LICENSE
GPL v3
