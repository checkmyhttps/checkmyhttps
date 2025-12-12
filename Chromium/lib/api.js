/**
 * @file API communications to Check Server.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.api = {}

/**
 * @name getCertFromCheckServer
 * @function
 * @param {string} urlTested - URL to check
 * @param {string} ip - IP address to check
 * @returns {object} - API body response containing the certificate of resquested host from check server's view
 * Get urlTested's certificate from the Check Server API.
 */
CMH.api.getCertFromCheckServer = async (urlTested, ip) => {
  const { host, port } = CMH.common.parseURL(urlTested)
  
  // We won't send "ip=" to the check server if it is empty
  if (ip === "")
  {
    args = {
      host: encodeURIComponent(host),
      port: port,
    }
  }
  else 
  {
    args = {
      host: encodeURIComponent(host),
      port: port,
      ip:ip
    }
  }

  fetchInit = { method: 'POST', headers: {"Content-Type": "application/json"}, cache: 'no-cache', body: JSON.stringify(args) }

  return CMH.api.checkMITM(CMH.options.settings.checkServerUrl+"api.php", fetchInit)
}


/**
 * @name checkMITM
 * @function
 * @param {string} checkServerUrl - URL of check server
 * @param {string} fetchInit - Request initialization parameters
 * SSL Pinning alternative : RSA-SHA256 signature verification to check if there is a Man In The Middle, even if it is passive.
 * @returns {object} - API body response from check server's view if everything is OK,
 * error: 'PUBLIC_KEY' if invalid public key,
 * error: 'CHECK_SERVER_UNREACHABLE' if no response from check server,
 * error: 'UNKNOWN_ISSUE' if idk,
 * error: 'CHECK_SERVER_ERROR' if the check server API sends an error,
 * error: 'SIGNATURE' if the server signature is not correct.
 */
CMH.api.checkMITM = async (checkServerUrl, fetchInit) => {
  if (CMH.options.importedPublicKey === 'PUBLIC_KEY_ERROR') {
    return { error: 'PUBLIC_KEY' }
  }
  
  const response = await CMH.api.sendRequest(checkServerUrl, fetchInit) // Retrieve Check Server API body response
  
  if (response === null)
    return { error: 'UNKNOWN_ISSUE' }
  
  if (response.error !== undefined)
    return { error: 'CHECK_SERVER_UNREACHABLE' }

  const response_data = response.data
  
  if (response_data.error !== undefined) {
    return { error: 'CHECK_SERVER_ERROR' + '.' + response_data.error }
  }

  if (checkServerUrl.includes("?info")) { // Signature pattern for verification in CMH.options.verifyServerAtStartup()
    response_to_verify = ""
    response_to_verify = response_to_verify + response_data.version + response_data.title
  }
  else
  {
    response_to_verify = ""
    response_to_verify = response_to_verify + response_data.fingerprints.sha256

    obj = response_data

    while(obj.issuer)
    {
      response_to_verify = response_to_verify + obj.issuer.fingerprints.sha256
      obj = obj.issuer
    }

    response_to_verify = response_to_verify + response_data.host + response_data.host_ip
  }

  response_to_verify = btoa(response_to_verify)

  const server_signature = CMH.options.str2ab(atob(response_data.signature))

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

  if (!signatureIsValid)
    return { error: 'SIGNATURE' };

  return response
}


/**
 * @name sendRequest
 * @function
 * @param {string} url - URL to send request to
 * @param {object} fetchInit - Request initialization parameters
 * @returns {object} - body response
 * Send a request to the Check Server API, either to fulfill getCertFromCheckServer's objective or 
 * to get the Check Server's public key or signature.
 */
CMH.api.sendRequest = async (url, fetchInit) => {
  let response      = null // Check Server HTTP response
  let response_data = null // Check Server API body response

  try {
    response = await fetch(url, fetchInit)

    const contentType = response.headers.get('content-type')
    if(contentType && contentType.includes('application/json')) {
      response_data = await response.json()
    } else {
      response_data = await response.text()
    }
  } catch (e) {
    return { error: 'SERVER_UNREACHABLE' };
  }
 
  if (!response.ok) {
    return { error: 'HTTP_ERROR' }
  }

  return { data: response_data }
}