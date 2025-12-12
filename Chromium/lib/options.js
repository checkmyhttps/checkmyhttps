/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.options = {}

/*
Function that sends a message to service_worker to get content of variables in DEFAULT_SETTINGS object
*/
async function askServiceWorkerAboutDataVariableInLocalStorage(variableMapStruct) {
  const response = await chrome.runtime.sendMessage({dataVariable : variableMapStruct});

  return response.response;
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
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = CMH.options.str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
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
      CMH.ui.showNotification(chrome.i18n.getMessage('__invalidPublicKey__'), { openOptionsPage: 1 });
      break;
    case 'CHECK_SERVER_UNREACHABLE':
      CMH.ui.showNotification(chrome.i18n.getMessage('__checkServerUnreachable__'));
      break;
    case 'CHECK_SERVER_ERROR':
      CMH.ui.showNotification(chrome.i18n.getMessage('__checkServerError__', error));
      break;
    case 'SIGNATURE':
      CMH.ui.showNotification(chrome.i18n.getMessage('__invalidServerSignature__'));
      break;
    case 'UNKNOWN_ISSUE':
      CMH.ui.showNotification(chrome.i18n.getMessage('__unknownIssue__'));
      break;
    default:
      break;
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  CMH.options.settings = {}

  let keys = await chrome.runtime.sendMessage({ type: 'GetDefaultSettings' })

  for (let key of Object.keys(keys)){
    await askServiceWorkerAboutDataVariableInLocalStorage([key]).then( (response) => {
      CMH.options.settings[key] = response
    })
  }
  CMH.options.verifyServerAtStartup(CMH.options.settings.checkServerUrl, CMH.options.settings.publicKey);

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes, area) => {
    const changedItems = Object.keys(changes)
    for (let item of changedItems)
      CMH.options.settings[item] = changes[item].newValue
  })

  // Once options are initialized, tell options/options.js to execute
  document.dispatchEvent(new CustomEvent('OptionsReady'))
});