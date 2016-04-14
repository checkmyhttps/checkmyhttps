/*CheckmyHTTPS
/*We propose a user-friendly that allow you to check if your encrypted web traffic (SSL/TLS) towards secured Internet servers (HTTPS) is not intercepted (being listened to). 
/*
/*Designed & developed : Raphaël PION and Hugo MEZIANI.
/*Original idea & Supervision : ESIEA/CNS/Rexy
/*website : http://checkmyhttps.net
*/


var checkmyhttps = {
	

	// view details
	website: function() {
		openUILinkIn("https://checkmyhttps.net", "tab");
	},

	
	// left click on toolbar button 
	buttonPanel: function(event) {
		if (event.type == "click" && event.button == 0) {checkmyhttps.onPageUpdate(); }
		if (event.type == "click" && event.button == 2) { this._panel.openPopup(this._panel_image, 'after_start'); }
	},

	//get xul element for the panel
	get _panel () { return document.getElementById("panel"); },
	get _panel_image () { return document.getElementById("checkmyhttps-icon"); },
	get _domain_name () { return document.getElementById("domain_name"); },
	get _secured () { return document.getElementById("is_secured"); },
	get _reason () { return document.getElementById("reason"); },
	get _date () { return document.getElementById("current_date"); },
	get _details () { return document.getElementById("details"); },
	get _auto () { return document.getElementById("auto"); },
	get _print_sha () { return document.getElementById("print_sha"); },
	get _version () { return 2.04; },
	//add listner on each page
	onPageLoad: function() {

		const ci = Components.interfaces;
		const cc = Components.classes;
		const gb = window.getBrowser();

		var panel_updateListener = {
			onSecurityChange: function(aWebProgress, aRequest, aState) { checkmyhttps.onPageUpdate(); },
		};
		
		gb.addTabsProgressListener(panel_updateListener);
		
	},
	
	
	//notification

  popUp: function(title, text) {
		try {
		  Components.classes['@mozilla.org/alerts-service;1']
		            .getService(Components.interfaces.nsIAlertsService)
		            .showAlertNotification(null, title, text, false, '', null);
		} catch(e) {
		  // prevents runtime error on platforms that don't implement nsIAlertsService
		}
	},


	//we check in this function if your SSL is secure.
	onPageUpdate: function() {
	
	const cc = Components.classes;
	const ci = Components.interfaces;
	const gb = window.getBrowser();
	var currentBrowser = gb.selectedBrowser;
	var ui = currentBrowser.securityUI;
	var protocol_url = window.content.location.protocol;
	var c_domain_name = window.content.location.hostname;
   
  // if toolbar button unused
	if (checkmyhttps._panel_image.image == null ) return;
   
   var panel_updateListener = {
		onSecurityChange: function(aWebProgress, aRequest, aState) { checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/unknown.png"; },
	};

	gb.addTabsProgressListener(panel_updateListener);
   

	//init strings
	checkmyhttps._domain_name.textContent = null;
	checkmyhttps._secured.className = null;
	checkmyhttps._secured.textContent = null;
	checkmyhttps._reason.textContent = null; 
	checkmyhttps._date.textContent = null;  
	//loading icon
	checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/working.png";
	
	


	// if https connection
	if (protocol_url == "https:") {

		if (ui)  
		{
			ui.QueryInterface(ci.nsISSLStatusProvider);
			
			var status = ui.SSLStatus;
			if (!status) return;
			var c_ssl_cert = status.serverCert;
	
			if (!(c_ssl_cert)) return;
				var url = checkmyhttps._details.getAttribute("url-base") +c_domain_name+'&thumbprint='+c_ssl_cert.sha1Fingerprint+'&thumbprint_256='+c_ssl_cert.sha256Fingerprint+'&version='+checkmyhttps._version;
				
				checkmyhttps._details.href = url;
				checkmyhttps._details.value = checkmyhttps._details.getAttribute("button-up");
				checkmyhttps._details.className = "text-link details";
				
				checkmyhttps.serverTestAnswer(url,0,c_ssl_cert.sha1Fingerprint,c_ssl_cert.sha256Fingerprint);
				
				checkmyhttps._domain_name.className = "blue";
				checkmyhttps._domain_name.textContent =  "\n" + "\n" + (checkmyhttps._domain_name.getAttribute("field") + c_domain_name );
				
				
			  
				checkmyhttps._date.textContent        = ("\n" + new Date() + " version : " + checkmyhttps._version);
		}

	}// if http connection
	else if (protocol_url == "http:") {
	
		checkmyhttps._details.href = "";		
		checkmyhttps._details.value = checkmyhttps._details.getAttribute("button-down");
		checkmyhttps._details.className = "gray-button";
		
		checkmyhttps._domain_name.className = "blue";
		checkmyhttps._domain_name.textContent   =  "\n" + "\n" + checkmyhttps._domain_name.getAttribute("field") + c_domain_name;
	
		
		checkmyhttps._secured.className = checkmyhttps._secured.getAttribute("http-value");
		checkmyhttps._secured.textContent = "\n"+checkmyhttps._secured.getAttribute("field") + "\n" + checkmyhttps._secured.getAttribute("http-field") + "\n" + "\n"  ;
		checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/unknown.png";
		checkmyhttps._date.textContent = (new Date());


		if(!checkmyhttps._auto.checked)
		{
			checkmyhttps.popUp("CheckMyHTTPS", checkmyhttps._secured.getAttribute("notif-http"));
		}
		
		
	}
	else{
		checkmyhttps._details.href = "";		
		checkmyhttps._details.value = checkmyhttps._details.getAttribute("button-down");
		checkmyhttps._details.className = "gray-button";
		
		checkmyhttps._domain_name.className = "center";
		checkmyhttps._domain_name.textContent = "\n" + "\n" + checkmyhttps._domain_name.getAttribute("local")+"\n"+"\n"+"\n"+"\n";
		
		checkmyhttps._secured.className = "";
		checkmyhttps._date.textContent = (new Date());
		//checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/unknown.png";
		
		if(!checkmyhttps._auto.checked)
		{
			checkmyhttps.popUp("CheckMyHTTPS", checkmyhttps._secured.getAttribute("notif-intern"));
		}
		
	}
	 
   },
   
   
   //send thumbprint to server
		serverTestAnswer: function(url,secondtry,c_sha1,c_sha256){
	
		checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("info-co");
		
		//get informations from the server about how secured is my connection (lock color)
		function infoReceived()
		{
			var output = httpRequest.responseText;
			
			if (output.length)
			{
				if(output.search("<center><h1><font color=\"green\">") != -1)
				{
					checkmyhttps._reason.textContent = "";
					checkmyhttps._secured.className =  checkmyhttps._secured.getAttribute("yes-value");
					checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("field") + checkmyhttps._secured.getAttribute("yes-field")+"\n"+"\n";
					
					checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/green.png";
					
					if(checkmyhttps._print_sha.checked)
					{
							checkmyhttps._secured.textContent +=  "SHA1 - client/server" + "\n" + c_sha1 + "\n" + output.split(": </br> ")[1].split("<br/>")[0] + "\n" + "SHA256 - client/server" + "\n" + c_sha256 + "\n" + output.split(": </br> ")[4].split("<br/>")[0];
							
					}
					
				}
				else if(output.search("<font color=\"red\">") != -1)
				{
						//if a website is using multiple certificates, thumbprints will be different. So we will check on another secured website randomly
						if(secondtry)
						{
							checkmyhttps._secured.className =  checkmyhttps._secured.getAttribute("no-value");
							checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("field") + checkmyhttps._secured.getAttribute("no-field");
							
							if(checkmyhttps._print_sha.checked)
							{
									checkmyhttps._secured.textContent += "\n" + "SHA1 - client/server" + "\n" + c_sha1 + "\n" + "" + "\n" + "SHA256 - client/server" + "\n" + c_sha256 + + "\n" + "" + "\n" ;
							}
							checkmyhttps._reason.textContent = checkmyhttps._reason.getAttribute("field");
							checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/red.png";
							checkmyhttps.popUp("CheckMyHTTPS", checkmyhttps._secured.getAttribute("field") + checkmyhttps._secured.getAttribute("no-field"));
							
						}
						else
						{
							checkmyhttps.whiteList();
						}
						
				}
				else
				{
					checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/yellow.png";	
					checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("hs");
				}
				
			}
			else
			{
  			checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/yellow.png";	
				checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("hs");
			}
		}
		
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", url, true);
		httpRequest.onload = infoReceived;
		httpRequest.send(null);
	},
   
 
	 
	//STARTUP : First of all, we will check the server certificate seen by the server on checkmyhttps.net

	//get server certificate from client of a specific website
	dumpSecurityInfo: function(xhr,website_visited,startup) {
	checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("info-co");
		let channel = xhr.channel;
		  let secInfo = channel.securityInfo;
			 
		  if (secInfo instanceof Ci.nsITransportSecurityInfo) {
		    secInfo.QueryInterface(Ci.nsITransportSecurityInfo);
	
			if (secInfo instanceof Ci.nsISSLStatusProvider) 
			{
				var cert = secInfo.QueryInterface(Ci.nsISSLStatusProvider)
								.SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
				var website_SHA1 = cert.sha1Fingerprint;
				var website_SHA256 = cert.sha256Fingerprint;
				
				var url = checkmyhttps._details.getAttribute("url-base") +website_visited+'&thumbprint='+website_SHA1+'&thumbprint_256='+website_SHA256+'&version='+checkmyhttps._version;
				
				
				if(!startup)
				{
					url += "&severalcert=1";
					
					checkmyhttps._domain_name.textContent =   "\n" + "\n" + checkmyhttps._domain_name.getAttribute("website-pbm") + "\n" + (checkmyhttps._domain_name.getAttribute("check-pbm") + website_visited) ;
				}
				else
				{
					checkmyhttps._domain_name.textContent =  "\n" + "\n" + (checkmyhttps._domain_name.getAttribute("startup") + website_visited);
					checkmyhttps.auto_check();
				}
				checkmyhttps.serverTestAnswer(url,1,website_SHA1,website_SHA256);
			
				checkmyhttps._details.href = url;
				checkmyhttps._details.value = checkmyhttps._details.getAttribute("button-up");
				checkmyhttps._details.className = "text-link details";

				
				checkmyhttps._domain_name.className = "blue";
				checkmyhttps._date.textContent        = ("\n" + new Date() + " version : " + checkmyhttps._version);
			  
			}
		}
	},

	//check certificate client side from server response
	testStartup : function(url,startup) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", "https://"+url, true);
		httpRequest.onload = function(e) {checkmyhttps.dumpSecurityInfo(httpRequest,url,startup);};
		httpRequest.send(null);
	},
	
	//test automatically on each website
	auto_check: function() {
	
		if(checkmyhttps._auto.checked)
		{
			checkmyhttps.onPageLoad();
		}	
		
	},
 
	whiteList: function(){
	var url = "https://checkmyhttps.net/whitelist.php";
	
	function getList()
		{
			var output = httpRequest.responseText;
			
			if (output.length)
			{
				checkmyhttps._domain_name.textContent =   "\n" + "\n" + checkmyhttps._domain_name.getAttribute("website-pbm") + "\n" + (checkmyhttps._domain_name.getAttribute("check-pbm") + output);
				checkmyhttps.testStartup(output,0);
			}
		}
		
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", url, true);
		httpRequest.onload = getList;
		httpRequest.send(null);
	
	},
 

};

//quick test during the startup on checkmyhttps
checkmyhttps.testStartup("checkmyhttps.net",1);
//checkmyhttps._panel_image.image="chrome://checkmyhttps/skin/unknown.png";

