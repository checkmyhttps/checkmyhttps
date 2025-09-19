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
      sign: true
    }
  }
  else 
  {
    args = {
      host: encodeURIComponent(host),
      port: port,
      sign: true,
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
 * error: 'SIGNATURE' if the server signature is not correct,
 * error: 'FINGERPRINT' if Check Server's certificates from user's view and from check server's hardcoded SHA256 are different.
 */
CMH.api.checkMITM = async (checkServerUrl, fetchInit) => {
  if (CMH.options.importedPublicKey === 'PUBLIC_KEY_ERROR') {
    return { error: 'PUBLIC_KEY' }
  }

  const response = await CMH.api.sendRequest(checkServerUrl, fetchInit) // Retrieve Check Server certificate from its body response (cmh_sha256)
  const cert = await CMH.api.getCertFromUser(checkServerUrl) // Get Check Server certificate via webRequest.getSecurityInfo()
  if ((cert.error !== undefined) || (response.error !== undefined))
    return { error: 'CHECK_SERVER_UNREACHABLE' }

  if ((cert === null) || (response === null))
    return { error: 'UNKNOWN_ISSUE' }

  const response_data = response.data
  
  if (checkServerUrl.includes("?info")) { // Signature pattern for verification in CMH.options.verifyServerAtStartup()
    response_to_verify = ""
    response_to_verify = response_to_verify + response_data.version + response_data.title + response_data.cmh_sha256
  }
  else
  {
    response_to_verify = ""
    response_to_verify = response_to_verify + response_data.fingerprints.sha1 + response_data.fingerprints.sha256

    obj = response_data

    while(obj.issuer)
    {
      response_to_verify = response_to_verify + obj.issuer.fingerprints.sha1 + obj.issuer.fingerprints.sha256
      obj = obj.issuer
    }

    response_to_verify = response_to_verify + response_data.host + response_data.host_raw
    response_to_verify = response_to_verify + (response_data.whitelisted ? 1 : 0)
    response_to_verify = response_to_verify + response_data.cmh_sha256
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

  certificatesFingerprintsAreEqual = CMH.certificatesChecker.compareCertificateFingerprints(cert.fingerprints.sha256, response_data.cmh_sha256 )
  hardcodedCertificatesFingerprintsAreEqual = CMH.certificatesChecker.compareCertificateFingerprints(CMH.options.settings.sha256, cert.fingerprints.sha256)

  if ( !certificatesFingerprintsAreEqual || !hardcodedCertificatesFingerprintsAreEqual )
	  return { error: 'FINGERPRINT' };

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


/**
 * @name getCertFromUser
 * @function
 * @param {string} urlTested - URL from which to check the certificate
 * @returns {object} - certificate of resquested host from user's view
 * Get the certificate of urlTested from user's view.
 */
CMH.api.getCertFromUser = async (urlTested) => {
  let cert = null

  const listener = async (details) => {
    browser.webRequest.onHeadersReceived.removeListener(listener)
    const securityInfo = await browser.webRequest.getSecurityInfo(details.requestId, { certificateChain: true })
    if (securityInfo.state === 'secure' || securityInfo.state === 'weak') {
      cert = CMH.certificatesManager.formatCertificate(securityInfo.certificates)
    }
  }
  browser.webRequest.onHeadersReceived.addListener(listener,
    { urls: [urlTested], types: ['xmlhttprequest'] },
    ['blocking']
  )

  let response;
  try {
    response = await fetch(urlTested, { method: 'HEAD' })
    if (response.status === 405)
    {
      response = await fetch(urlTested, { method: 'GET' })
    }
  } catch (e) {
    return { error: 'SERVER_UNREACHABLE' };
  }
 
  if (!response.ok) {
    return { error: 'HTTP_ERROR' }
  }
  
  return (cert)
}