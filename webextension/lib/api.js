/**
 * @file API communications.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.api = {}

/**
 * @name requestFromUrl
 * @function
 * @param {string} urlTested - URL to check
 * @param {string} ip - IP address to check
 * @returns {object} - certificates of resquested host and check server
 * Request certificate info of an URL.
 */
CMH.api.requestFromUrl = async (urlTested, ip) => {
  const { host, port } = CMH.common.parseURL(urlTested)
  
  // We won't send "ip=" to the verification server if it is empty
  
  if (ip === "")
  {
    arguments = {
        host: encodeURIComponent(host),
        port: port,
        sign: true
    }
  }
  else 
  {
    arguments = {
        host: encodeURIComponent(host),
        port: port,
        sign: true,
        ip:ip
    }
  }

  const { cert, data:response_data, response } = await CMH.certificatesManager.getCertUrl(CMH.options.settings.checkServerUrl+"api.php", false, arguments)
  if ((cert === null) || (response === null)) {
    return { error: 'SERVER_UNREACHABLE' }
  }
  
  server_signature = response_data.signature
  
  // Read the public key :
  if(CMH.options.importedPublicKey === 'PUBLIC_KEY_ERROR')
    return { error: 'PUBLIC_KEY' }
  else
    verifKey = CMH.options.importedPublicKey

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

  response_to_verify = btoa(response_to_verify)

  server_signature = CMH.options.str2ab(atob(server_signature))

  response_to_verify = CMH.options.str2ab(atob(response_to_verify))

  signatureIsValid = await crypto.subtle.verify(
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    verifKey,
    server_signature,
    response_to_verify
  );

  // "SSL Pinning" alternative : just to check if there is a Man In The Middle, even if it is passive
  if (!signatureIsValid || !CMH.certificatesChecker.compareCertificateFingerprints(cert, { fingerprints: { sha256: response_data.cmh_sha256 } })) {
      return { error: 'SSL' }
  }

  if (!response.ok) {
    return { error: response_data }
  }

  return { data: response_data, cert: cert }
}
