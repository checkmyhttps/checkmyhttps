//######################IMPORT######################//

let {Cc, Ci} = require("chrome");
var buttons = require('sdk/ui/button/action');
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var notifications = require("sdk/notifications");
var { MatchPattern } = require("sdk/util/match-pattern");
var _ = require("sdk/l10n").get;

//######################GUI######################//

//regexp d'une adresse IP privée. Le serveur checkmyhttps ne pourra pas comparer les certificats.
var re_private_ip = /(^https:\/\/127\.)|(^https:\/\/10\.)|(^https:\/\/172\.1[6-9]\.)|(^https:\/\/172\.2[0-9]\.)|(^https:\/\/172\.3[0-1]\.)|(^https:\/\/192\.168\.)/;

//empreinte SHA256 du site https://checkmyhttps.net
//cette empreinte est codé en dure afin d'éviter que le MITM SSL modifie l'empreinte envoyée sur le serveur checkmyhttps.
var thumbprint_trusted = "E2:86:CE:78:31:7C:76:67:41:35:15:8D:A5:4D:F9:1F:67:AA:B6:AF:51:C1:FD:FA:6A:36:3E:65:7B:B8:1B:77";

//création du boutton de l'addon.
var button = buttons.ActionButton({
  id: "checkmyhttps-icon",
  label: _("l_inst"),
  icon: "./unknown.png",
  onClick: handleClick
});

//lorsque l'utilisateur clique sur le boutton de l'addon pour effectuer un test,
function handleClick(state) {
	//on prend l'url du site actuel 
	var url_tested = tabs.activeTab.url;
	button.icon = "./working.png";

	//checkmyhttps ne peut pas joindre une adresse IP d'un réseau privé
	if(url_tested.match(re_private_ip))
	{
		notifications.notify({
			title:  _("l_alert"),
			text:  _("l_privateip"),
		});
	}

	//le site testé doit etre en HTTPS
	if(url_tested.search("https://") != -1)
	{
		button.icon = "./working.png";
		Get_Current_Cert(url_tested); //commencement de la compraison des certificats
	}
	else
	{
	notifications.notify({
			title:  _("l_alert"),
			text:  _("l_nohttps"),
		});
	}
}

//######################REQUEST######################//

//requete HTTPS envoyée par l'addon au serveur de test (checkmyhttps.net) avec la méthode GET afin de recevoir le résultat de la comparaison
//url : l'url de checkmyhttps contenant les informations suivantes en GET :
//_("l_check") : URL de checkmyhttps en HTTPS dans la langue de l'utilisateur. (fichier présent dans le dossier 'locale')
//+url_tested : URL du site consulté
//+"&thumbprint=" + cert.sha1Fingerprint : empreinte SHA1 du certificat serveur
//+"&thumbprint_256=" + cert.sha256Fingerprint : empreinte SHA256 du certificat serveur
//+"&version=3.07 : version de l'addon
function request(url,second_time) {
	
	Request({
		url: url, //url de checkmyhttps contenant toutes les informations
		onComplete: function (response) { 
			//si le serveur est joignable, on récupère la réponse du serveur.
			if(response.status == 200)
			{
				//récupération de la réponse de checkmyhttps
				var page = response.text;
				//analyse de paterne spécifique de la page reçue
				if(page.search("<center><h1><font color=\"green\">") != -1) // si du vert est présent sur la page, alors la connection est sécurisée
				{
					button.icon = "./green.png"; 
				}
				else if(page.search("<font color=\"red\">") != -1) // si du rouge est présent sur la page, la connection est compromise
				{
					//maybe this HTTPS website has severals certificat (like google, youtube, outlook, exploit-db ...)
					//certains sites dispose de plusieurs certificat serveur. Il est possible d'avoir deux certificats différents sans pour autant avoir une connection sécurisé
					//pour cela nous avons listé quelques site HTTPS de confiance. La page whitelist.php permet d'en sélectionner un aléatoirement.
					random_trusted_https = "https://checkmyhttps.net/whitelist.php";
					//on effectue alors un second test.
					Request({
					url: random_trusted_https,
					onComplete: function (response) {
							if(response.status == 200 && !second_time)
							{
								//we test this random trusted website
								specific_test("https://"+response.text,1);			
							}
							else
							{
								button.icon = "./red.png";
								notifications.notify({
									title: _("l_alert"),
									text:  _("l_danger"),
									data: url,
									onClick: function (data) {
										tabs.open(data);
									}
								});
							}
						}
					}).get();
					
					}
					else
					{
						button.icon = "./unknown.png";
					}
		}
		else // sinon le serveur checkmyhttps n'est pas joignable. On avertis l'utilisateur.
		{
			notifications.notify({
				title: _("l_alert"),
				text: _("l_pbm"),
			});
		}		
	}}).get();

}

//######################TEST CURRENT WEBSITE######################//
	
//Fonction permettant d'obtenir le certificat serveur du site courant visité par l'utilisateur. 
//On l'utilise lorsque l'utilisateur clique sur le boutton de checkmyhttps.net
//url_tested : URL du site internet actuellement consulté par l'utilisateur
function Get_Current_Cert(url_tested) {
	//initialisation
	var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	var mainWindow = wm.getMostRecentWindow("navigator:browser");
	
	try
	{
		var cert = get_valid_cert(mainWindow.gBrowser); //récupération du certificat serveur
		var root_issuer = cert.issuer;

		while (root_issuer && root_issuer.issuer) {
			root_issuer = root_issuer.issuer;
		}
		//send informations to compare server certificate seen by the client and the other seen by our server (checkmyhttps)	
		request(_("l_check")+url_tested+"&thumbprint=" + cert.sha1Fingerprint +"&thumbprint_256=" + cert.sha256Fingerprint + "&version=3.07", 0);
	}	
	catch(err) //si une erreur est survenue, on avertis l'utilisateur
	{
	notifications.notify({
		title: _("l_alert"),
		text: _("l_pbm"),
	});
	}
}

//check if the server certificate is valid ( = recognized by your Firefox browser)
//vérifie que le certificat serveur est reconnu par Firefox (dans le magasin de certifcat)
function get_valid_cert(gb) {
    var ui = gb.securityUI;
    try {
        ui.QueryInterface(Ci.nsISSLStatusProvider);
        if(!ui.SSLStatus) {
            return null;
        }
        return ui.SSLStatus.serverCert;
    }
    catch (e) {
        Pers_debug.d_print("error", "Perspectives Error: " + e);
        return null;
    }
}

//######################Démarrage de Firefox######################//
//Au démarrage de Firefox, on va tester comparer le certificat sur le site checkmyhttps.net


//obtenir le certificat serveur d'une URL spécifique
//xhr : XMLHttpRequest
//specific_url : notre URL
//second_time : indique si il s'agit du test effectué lors du démarrage. (second_time = 0, si oui. Sinon 1)
function Get_Specific_Cert(xhr,specific_url,second_time) {
	//initialisation afin de récupérer le certificat du serveur
	let channel = xhr.channel;
	let secInfo = channel.securityInfo;

	//Si le certificat de https://checkmyhttps.net n'est pas joignable, c'est qu'il est bloqué par le navigateur.
	//Cela signifie que le certificat n'est pas reconnu, donc nous sommes en présence d'un MITM SSL
	if (secInfo instanceof Ci.nsITransportSecurityInfo) {
		secInfo.QueryInterface(Ci.nsITransportSecurityInfo);
		try
		{
			if (secInfo instanceof Ci.nsISSLStatusProvider) 
			{
				//récupération du certificat serveur
				var cert = secInfo.QueryInterface(Ci.nsISSLStatusProvider).SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
				if(second_time) //si le test s'effectue pas au démarrage (cela est utile pour tester les faux positifs, cad lorsqu'il y a plusieurs certificats pour un meme site)
				{
					//send informations to compare server certificate seen by the client and the other seen by our server (checkmyhttps)		
					request(_("l_check")+specific_url+"&thumbprint=" + cert.sha1Fingerprint +"&thumbprint_256=" + cert.sha256Fingerprint + "&version=3.07", second_time);
				}
				else
				{	
					//si l'empreinte du certificat du site checkmyhttps.net diffère de celle inscrit en dure dans le code de l'addon (cf plus haut), alors il y a un MITM SSL.
					if(cert.sha256Fingerprint == thumbprint_trusted)
					{
						button.icon = "./green.png"; 
					}
					else
					{
						button.icon = "./red.png";
						notifications.notify({
							title: _("l_alert"),
							text:  _("l_danger"),
							data: _("l_mitm"),
							onClick: function (data) {
								tabs.open(data);
							}
						});
					}
				}
			}
	}
	catch(err) // si il y a une erreur lors de la récupération du certificat, il y a un MITM SSL
	{
		notifications.notify({
			title: _("l_alert"),
			text: _("l_pbm"),
			data: _("l_mitm"),
			onClick: function (data) {
			tabs.open(data);
			}
		});
	}
		
	}
	
}

//fonction permettant de le tester une URL HTTPS non visité par l'utilisateur (ici, c'est le site de checkmyhttps)
//specific_url : l'URL du site HTTPS à tester
//second_time : permet de savoir si il s'agit du démarrage de Firefox ou non.
function specific_test(specific_url,second_time)
{
	var httpRequest = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", specific_url, true);
	httpRequest.onload = function(e) {Get_Specific_Cert(httpRequest, specific_url, second_time);}; //récupération du certificat serveur
	httpRequest.send(null);
}

//Exécution de la fonction au démarrage
specific_test("https://checkmyhttps.net",0);


