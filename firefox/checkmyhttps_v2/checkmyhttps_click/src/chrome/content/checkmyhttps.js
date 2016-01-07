/*CheckmyHTTPS
/*We propose a user-friendly that allow you to check if your encrypted web traffic (SSL/TLS) towards secured Internet servers (HTTPS) is not intercepted (being listened to). 
/*
/*Designed & developed : Raphaël PION and Hugo MEZIANI.
/*Original idea & Supervision : ESIEA/CNS/Rexy
/*website : http://checkmyhttps.net
*/

var StockWatcher = {

	startUp: function(url){
		this.refreshInformation(url);
	},
	
	refreshInformation: function(url){
	
		function infoReceived()
		{
			var output = httpRequest.responseText;
				
			if (output.length)
			{
				if(output.search("<center><h1><font color=\"green\">") != -1)
				{
					checkmyhttps._reason.textContent = "";
					checkmyhttps._secured.className =  checkmyhttps._secured.getAttribute("yes-value");
					checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("field") + checkmyhttps._secured.getAttribute("yes-field")+"\n"+"\n"+"\n";
					document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/green.png";
				}
				else if(output.search("<font color=\"red\">") != -1)
				{
					var domain_check = output.split("</center></h1><center><h2>");
					domain_check = domain_check[1].split("</h2>");
					
					if(checkmyhttps._domain_name.textContent.search(domain_check[0]) != -1)
					{
						checkmyhttps._secured.className =  checkmyhttps._secured.getAttribute("no-value");
						checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("field") + checkmyhttps._secured.getAttribute("no-field");
					
						checkmyhttps._reason.textContent = checkmyhttps._reason.getAttribute("field");
					
						document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/red.png";
					}
					else
					{
						checkmyhttps._secured.className =  checkmyhttps._secured.getAttribute("no-value");
						checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("fast");
						checkmyhttps._reason.textContent = "";
						document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/unknown.png";	
					}
				}
				else if(output.search("<font color=\"yellow\">") != -1)
				{
					checkmyhttps._secured.className =  checkmyhttps._secured.getAttribute("no-value");
					checkmyhttps._secured.textContent = checkmyhttps._secured.getAttribute("google-pbm");
					checkmyhttps._reason.textContent = "\n";
					document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/yellow.png";	
				}
				else
				{
					document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/unknown.png";	
				}
			}
		}
		
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", url, true);
		httpRequest.onload = infoReceived;
		httpRequest.send(null);
	}
}


var checkmyhttps = {


	// view details
	website: function() {
		openUILinkIn("https://www.checkmyhttps.net", "tab");
	},

	
	// left click on toolbar button 
	buttonPanel: function(event) {
		if (event.type == "click" && event.button == 0) { checkmyhttps.onPageUpdate(); }
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

	

	//we check in this function if your SSL is secure.
	onPageUpdate: function() {
	
	
	

	const cc = Components.classes;
	const ci = Components.interfaces;
	const gb = window.getBrowser();
	var currentBrowser = gb.selectedBrowser;
	var ui = currentBrowser.securityUI;
	var protocol_url = window.content.location.protocol;
	var c_domain_name = window.content.location.hostname;
   
   var panel_updateListener = {
		onSecurityChange: function(aWebProgress, aRequest, aState) { document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/unknown.png"; },
	};

	gb.addProgressListener(panel_updateListener);
   
  
   
	// if toolbar button unused
	if (document.getElementById("checkmyhttps-icon") == null ) return;

	//init strings
	checkmyhttps._domain_name.textContent = null;
	checkmyhttps._secured.className = null;
	checkmyhttps._secured.textContent = null;
	checkmyhttps._secured.className = null;
	checkmyhttps._reason.textContent = null; 
	checkmyhttps._secured.className = null;
	checkmyhttps._date.textContent = null;  
	checkmyhttps._secured.className = null;
	//loading icon
	document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/working.png";



	// if https connection
	if (protocol_url == "https:") {

		if (ui)  
		{
			ui.QueryInterface(ci.nsISSLStatusProvider);
			
			var status = ui.SSLStatus;
			if (!status) return;
			var c_ssl_cert = status.serverCert;
	
			if (!(c_ssl_cert)) return;
				var url = checkmyhttps._details.getAttribute("url-base") +c_domain_name+'&thumbprint='+c_ssl_cert.sha1Fingerprint+'&thumbprint_256='+c_ssl_cert.sha256Fingerprint;
				
				checkmyhttps._details.href = url;
				checkmyhttps._details.value = checkmyhttps._details.getAttribute("button-up");
				checkmyhttps._details.className = "text-link details";
				
				StockWatcher.startUp(url);
				
				checkmyhttps._domain_name.className = "blue";
				checkmyhttps._domain_name.textContent             =  "\n" + "\n" + (checkmyhttps._domain_name.getAttribute("field") + c_domain_name);
			
				
				checkmyhttps._date.textContent        = ("\n" + new Date());
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
		
		document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/unknown.png";
		checkmyhttps._date.textContent = (new Date());
	}
	else{
		checkmyhttps._details.href = "";		
		checkmyhttps._details.value = checkmyhttps._details.getAttribute("button-down");
		checkmyhttps._details.className = "gray-button";
		
		checkmyhttps._domain_name.className = "center";
		checkmyhttps._domain_name.textContent = "\n" + "\n" + checkmyhttps._domain_name.getAttribute("local")+"\n"+"\n"+"\n"+"\n";
		
		checkmyhttps._secured.className = "";
		
		document.getElementById("checkmyhttps-icon").image="chrome://checkmyhttps/skin/unknown.png";
	}
	 

   },

};




