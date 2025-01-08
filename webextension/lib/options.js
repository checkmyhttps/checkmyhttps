/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.options = {}

/**
 * @name getCertUrl
 * @function
 * @param {string} url - URL to check
 * @returns {object} - fingerprints
 * Get the certificate fingerprints of an URL.
 */
CMH.options.getCertUrl = async (url) => {
    const { cert } = await CMH.certificatesManager.getCertUrl(url, true);
    return cert;
}


/**
 * @name str2ab
 * @function
 * @param {string} str - String to convert
 * @returns {ArrayBuffer} - ArrayBuffer containing the converted string
 * Convert a string to an ArrayBuffer.
 */
CMH.options.str2ab = function(str){
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++)
  {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


/**
 * @name importPublicKey
 * @function
 * @param {string} pem - Public key in PEM format
 * @returns {object} - CryptoKey object containing the public key
 * Converts a string to a CryptoKey object.
 */
CMH.options.importPublicKey = async (pem) => {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";

  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = CMH.options.str2ab(binaryDerString);

  return crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    true,
    ["verify"]
  );
}

/**
 * @name verifyServerAtStartup
 * @function
 * @param {string} serverUrl - Server URL
 * @param {string} publicKey - Public key in PEM format
 * @returns {int} - 1 if everything is OK, 0 if the server signature is not correct or if the message is intercepted, -1 if no response, -2 if invalid public key
 * Check if the API server is working at startup and imports the public key.
 */
CMH.options.verifyServerAtStartup = async (serverUrl, publicKey) => {
  const { cert, data:response_data, response } = await CMH.certificatesManager.getCertUrl(serverUrl+'api.php?info&sign')
  // Default check server unreachable ?
  if ((cert === null) || (response === null))
    return -1;
  server_signature = response_data.signature
  
  try{
    CMH.options.importedPublicKey = await CMH.options.importPublicKey(publicKey)
  }
  catch(e)
  {
    // Invalid public key
    CMH.options.importedPublicKey = 'PUBLIC_KEY_ERROR'
    return -2
  }

  response_to_verify = ""
  response_to_verify = response_to_verify + response_data.version + response_data.title + response_data.cmh_sha256
  response_to_verify = btoa(response_to_verify)

  server_signature = CMH.options.str2ab(atob(server_signature))

  response_to_verify = CMH.options.str2ab(atob(response_to_verify))

  signatureIsValid = await crypto.subtle.verify(
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    CMH.options.importedPublicKey,
    server_signature,
    response_to_verify
  );
  
  certificatesFingerprintsAreEqual = CMH.certificatesChecker.compareCertificateFingerprints(cert, { fingerprints: { sha256: response_data.cmh_sha256 } })
  
  if (signatureIsValid == true && !certificatesFingerprintsAreEqual)
	  return -3;
  
  // "SSL Pinning" alternative : just to check if there is a Man In The Middle, even if it is passive
  return (signatureIsValid && certificatesFingerprintsAreEqual) === true ? 1 : 0;
}

/**
 * @type {object}
 * Cache of extension options.
 */
CMH.options.settings = {
  checkOnPageLoad:               false,
  alertOnUnicodeIDNDomainNames:  true,
  disableNotifications:          false, 
  checkServerUrl:                'https://checkmyhttps.net/',
  publicKey: `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvPk7sw/smaqXrF+glR1i
be/AjaxTnUCVwYJ+iSYxizBl5n42RGRaxhbbkJuM9esnFJd74bb9Uv5oM5rZWtSO
sedr49uY237V5C3z0PPSYPaJD290bJzwK4bOZim9cr8DT25KhRj5WoXbnuULVLAE
5DO55nUbhp51HisOUsZwtYNEE53D8Ev8wX2iwzAx4X0E2KvVpoyI23u4UVFdQxUJ
GVzI7Bs8OQyzFJBhalEjaylK3gDNDMFF3reNGgIEPIMIs9I6bUaOgaQsT/b65SR9
qxWyrOrQcYl42y8mpC7SN+8zPnxUuRQgIgvR1VDThJVf5+pRi+phPLaX5exEkoDZ
ISU8UiCquAfd0dgjNzo/wUvSykkJvAZHNtkn5kNeVE/cOYFw8jWZfX7oe2Gy5CGk
83abNDpkpdvDpDJwHA8oP8q/0Wzd1EJkGyPfr79eEwtUEblWXaYvVPrvcrBkuex0
F1MMQJ82WtAwP7DtwEvkHDezuMyjK2jO0cxcYfXh1mjuTRYuCZ4fdvVUpIyoDo8g
MoWqP4U0RmOXjG7GoqVVH89aFxtMYmXWolL08sYSOBG2R3sD/kMQq2I++DpDyxtX
8cxDdBxXrh+PNQTOLbuuQIesn/MTHSHMo8bHDVsooEVrgGDIad2/AK2seihhVMsj
17aoSfDrFx7OQi+0BmiZKzsCAwEAAQ==
-----END PUBLIC KEY-----`
}

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
CMH.options.defaultCheckServer = {
  url: 'https://checkmyhttps.net/',
  publicKey: `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvPk7sw/smaqXrF+glR1i
be/AjaxTnUCVwYJ+iSYxizBl5n42RGRaxhbbkJuM9esnFJd74bb9Uv5oM5rZWtSO
sedr49uY237V5C3z0PPSYPaJD290bJzwK4bOZim9cr8DT25KhRj5WoXbnuULVLAE
5DO55nUbhp51HisOUsZwtYNEE53D8Ev8wX2iwzAx4X0E2KvVpoyI23u4UVFdQxUJ
GVzI7Bs8OQyzFJBhalEjaylK3gDNDMFF3reNGgIEPIMIs9I6bUaOgaQsT/b65SR9
qxWyrOrQcYl42y8mpC7SN+8zPnxUuRQgIgvR1VDThJVf5+pRi+phPLaX5exEkoDZ
ISU8UiCquAfd0dgjNzo/wUvSykkJvAZHNtkn5kNeVE/cOYFw8jWZfX7oe2Gy5CGk
83abNDpkpdvDpDJwHA8oP8q/0Wzd1EJkGyPfr79eEwtUEblWXaYvVPrvcrBkuex0
F1MMQJ82WtAwP7DtwEvkHDezuMyjK2jO0cxcYfXh1mjuTRYuCZ4fdvVUpIyoDo8g
MoWqP4U0RmOXjG7GoqVVH89aFxtMYmXWolL08sYSOBG2R3sD/kMQq2I++DpDyxtX
8cxDdBxXrh+PNQTOLbuuQIesn/MTHSHMo8bHDVsooEVrgGDIad2/AK2seihhVMsj
17aoSfDrFx7OQi+0BmiZKzsCAwEAAQ==
-----END PUBLIC KEY-----`
}

// Get settings values
browser.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'disableNotifications', 'checkServerUrl', 'publicKey']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
  
  // Verify the server's signature AND if there is a passive Man In The Middle
	CMH.options.verifyServerAtStartup(CMH.options.settings.checkServerUrl, CMH.options.settings.publicKey).then((response) => {
	  switch(response) {
		case 1:
		  break;
		case -1:
		  CMH.ui.showNotification(browser.i18n.getMessage('__defaultServerUnreachable__'));
		  break;
		case -2:
		  CMH.ui.showNotification(browser.i18n.getMessage('__invalidPublicKey__'), { openOptionsPage: 1 });
		  break;
		case -3:
		  CMH.ui.showNotification(browser.i18n.getMessage('__serverHardcodedFingerprintNotCorresponding__'));
		  break;
		default:
		  CMH.ui.showNotification(browser.i18n.getMessage('__serverSignatureNotVerified__'));
		  break;
	  }
	});
  
}, (error) => { console.error(error) })

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  const changedItems = Object.keys(changes)

  for (let item of changedItems)
    CMH.options.settings[item] = changes[item].newValue
})
