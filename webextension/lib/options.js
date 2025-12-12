/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.options = {}

/**
 * @type {object}
 * Cache of extension options.
 * Default settings.
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
  url: CMH.options.settings.checkServerUrl,
  publicKey: CMH.options.settings.publicKey,
}

// Get settings values
browser.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'disableNotifications', 'checkServerUrl', 'publicKey']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
  
  CMH.options.verifyServerAtStartup(CMH.options.settings.checkServerUrl, CMH.options.settings.publicKey);
}, (error) => { console.error(error) })

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  const changedItems = Object.keys(changes)

  for (let item of changedItems)
    CMH.options.settings[item] = changes[item].newValue
})


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
 * @param {string} serverUrl - Check Server URL
 * @param {string} publicKey - Public key in PEM format
 * @param {string} type - Indicates that the function has been triggered from save button in options/options.js
 * @returns {object} - If type, returns response and errors from checkMITM()
 * Check if the API server is working at startup, verify the server's signature for a Man In The Middle
 * and imports the public key.
 */
CMH.options.verifyServerAtStartup = async (serverUrl, publicKey, type) => {
  try {
    CMH.options.importedPublicKey = await CMH.options.importPublicKey(publicKey)
  }
  catch (e)
  {
    CMH.options.importedPublicKey = 'PUBLIC_KEY_ERROR'
  }

  const response = await CMH.api.checkMITM(serverUrl+'api.php?info')

  if (type === "nostartup")
    return response

  if (response.error !== undefined && response.error.includes('CHECK_SERVER_ERROR'))
  {
    parts = response.error.split('.')
    error = parts[parts.length - 1]
    response.error = 'CHECK_SERVER_ERROR'
  }
  switch(response.error) {
    case 'PUBLIC_KEY':
      CMH.ui.showNotification(browser.i18n.getMessage('__invalidPublicKey__'), { openOptionsPage: 1 });
      break;
    case 'CHECK_SERVER_UNREACHABLE':
      CMH.ui.showNotification(browser.i18n.getMessage('__checkServerUnreachable__'));
      break;
    case 'CHECK_SERVER_ERROR':
      CMH.ui.showNotification(browser.i18n.getMessage('__checkServerError__', error));
      break;
    case 'SIGNATURE':
      CMH.ui.showNotification(browser.i18n.getMessage('__invalidServerSignature__'));
      break;
    case 'UNKNOWN_ISSUE':
      CMH.ui.showNotification(browser.i18n.getMessage('__unknownIssue__'));
      break;
    default:
      break;
  }
}