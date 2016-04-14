//######################IMPORT######################//

let {Cc, Ci} = require("chrome");
var buttons = require('sdk/ui/button/action');
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var notifications = require("sdk/notifications");
var _ = require("sdk/l10n").get;

//######################GUI######################//

var button = buttons.ActionButton({
  id: "checkmyhttps-icon",
  label: _("l_inst"),
  icon: "./unknown.png",
  onClick: handleClick
});


function handleClick(state) {
	var url_tested = tabs.activeTab.url;

  
  if(url_tested.search("https://") != -1)
  {
  button.icon = "./working.png";
  Get_Current_Cert(url_tested);
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

function request(url,second_time) {
	Request({
		url: url,
		onComplete: function (response) {
			//console.log(url);
			if(response.status == 200)
			{
				var page = response.text;
				if(page.search("<center><h1><font color=\"green\">") != -1)
				{
					button.icon = "./green.png"; 
				}
				else if(page.search("<font color=\"red\">") != -1)
				{
					//maybe this HTTPS website has severals certificat (like google, youtube, outlook, exploit-db ...)
					random_trusted_https = "https://checkmyhttps.net/whitelist.php";
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
		else
		{
			notifications.notify({
				title: _("l_alert"),
				text: _("l_pbm"),
			});
		}		
	}}).get();

}

//######################TEST CURRENT WEBSITE######################//
	
//get the current serveur certificate
function Get_Current_Cert(url_tested) {
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser");
    var cert = get_valid_cert(mainWindow.gBrowser);
    
    
    var root_issuer = cert.issuer;
    while (root_issuer && root_issuer.issuer) {
        root_issuer = root_issuer.issuer;
    }
    //send informations to compare server certificate seen by the client and the other seen by our server (checkmyhttps)	
		request(_("l_check")+url_tested+"&thumbprint=" + cert.sha1Fingerprint +"&thumbprint_256=" + cert.sha256Fingerprint + "&version=3.00", 0);
}

//check if the server certificate is valid ( = recognized by your Firefox browser)
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

//######################START-UP######################//

//get server certificate from a specific website
function Get_Specific_Cert(xhr,specific_url,second_time) {
		let channel = xhr.channel;
	  let secInfo = channel.securityInfo;
		 
	  if (secInfo instanceof Ci.nsITransportSecurityInfo) {
	    secInfo.QueryInterface(Ci.nsITransportSecurityInfo);

		if (secInfo instanceof Ci.nsISSLStatusProvider) 
		{
			var cert = secInfo.QueryInterface(Ci.nsISSLStatusProvider).SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
			//send informations to compare server certificate seen by the client and the other seen by our server (checkmyhttps)		
			request(_("l_check")+specific_url+"&thumbprint=" + cert.sha1Fingerprint +"&thumbprint_256=" + cert.sha256Fingerprint + "&version=3.00", second_time);
		}
		
	}
	
}

function specific_test(specific_url,second_time)
{
	var httpRequest = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", specific_url, true);
	httpRequest.onload = function(e) {Get_Specific_Cert(httpRequest, specific_url, second_time);};
	httpRequest.send(null);
}

//quick test during the startup on checkmyhttps website
specific_test("https://checkmyhttps.net",0);


