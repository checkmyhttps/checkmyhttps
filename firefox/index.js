//CheckmyHTTPS
//We propose a user-friendly that allow you to check if your encrypted web traffic (SSL/TLS) towards secured Internet servers (HTTPS) is not intercepted (being listened to). 
//
//Designed & developed : Raphaël PION and Hugo MEZIANI.
//Original idea & Supervision : ESIEA/CNS/Rexy
//website : http://checkmyhttps.net

//includes
const {components,Cc,Ci} = require("chrome");
var { setTimeout } = require("sdk/timers");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self"); 
var tabs = require("sdk/tabs");

//we enabled Test on page load by default
tabs.on("ready", checkMITM_onload);

//server certificate seen by the client SHA1 and SHA256
var server_cert = "";
var server_cert_256 = "";
var host = "checkmyhttps.net";


//get server certificate from client
function dumpSecurityInfo(xhr) {
	let channel = xhr.channel;
    let secInfo = channel.securityInfo;
	
    if (secInfo instanceof Ci.nsITransportSecurityInfo) {
      secInfo.QueryInterface(Ci.nsITransportSecurityInfo);
	  
		if (secInfo instanceof Ci.nsISSLStatusProvider) 
		{
		  var cert = secInfo.QueryInterface(Ci.nsISSLStatusProvider)
							.SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
		  server_cert = cert.sha1Fingerprint;
		  server_cert_256 = cert.sha256Fingerprint;
		}
	}
}

//check certificate client side from server response
function test(url) {
	
	var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	req.open('GET', url, true);
	req.onload = function(e) {dumpSecurityInfo(req);};

	
	button.icon = "./img/yellow-64.png";
	
	setTimeout(function id () {
	
		//get server certificate of checkmyhttps.
		dumpSecurityInfo(req);
		
		setTimeout(function id () 
		{
			//send client info to checkmyhttps.net
			var cli = new XMLHttpRequest();
			if((server_cert || server_cert_256) && host)
			{
				cli.open('GET', 'https://'+host+'/addon.php?url=https://'+host+'&thumbprint='+server_cert+'&thumbprint_256='+server_cert_256,true);
				cli.send();
			}
			
			setTimeout(function id () 
			{
				//check the answer of checkmyhttps.net
				if(cli.status == 200)
				{
					if(cli.responseText.search("<center><h1><font color=\"green\">Yes</font></h1></center>") != -1)
					{
						button.icon = "./img/green-64.png";
					}
					if(cli.responseText.search("<font color=\"red\">") != -1)
					{
						button.icon = "./img/red-64.png";
					}	
				}
				else
				{
					dump("Certificat impossible a obtenir :\n - Serveur de test injoignable\n - Résolution de DNS impossible\n - Certificat du serveur non reconnu par les autoritées de certification\n");
				}
							
			}, 2000);
			
		}, 2000);
		
	}, 4000);
	
	req.send();
}


//get thumbprint of checkmyhttps.net
function SendThumbprintFromServer(hostName){
	if( hostName != -1)
	{
		test("https://" + host);
	}
	else{
		dump("HTTP only.\n");
		server_cert = "";
		server_cert_256 = "";
	}
}
 


//enable/disable Test on page load
function checkMITM_onload(tab) {
	SendThumbprintFromServer(host);	
}



//GUI
var button = ToggleButton({
  id: "my-button",
  label: "CheckmyHTTPS",
  icon: "./img/yellow-64.png",
  onChange: handleChange
  
});

//panel creation
var panel = panels.Panel({
   contentURL: self.data.url("panel.html"),
  contentScriptFile: self.data.url("cs.js"),
  onHide: handleHide
});
panel.resize(250,300);

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}



//print details
panel.port.on("send_details", function(message) {
	tabs.open('https://'+host+'/addon.php?url=https://'+host+'&thumbprint='+server_cert+'&thumbprint_256='+server_cert_256);
});
