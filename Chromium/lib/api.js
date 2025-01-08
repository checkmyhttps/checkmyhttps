/**
 * @file API communications.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.api = {}

/**
* @param {string} urlTested - URL to check
* @returns {object} - certificates of resquested host and check server
* Request certificate info of an URL.
*/
CMH.api.requestFromUrl = async (urlTested) => {
 const { host, port } = CMH.common.parseURL(urlTested)

 const { data:response_data, response } = await CMH.certificatesManager.getCertUrl(CMH.options.settings.checkServerUrl+'api.php?host='+encodeURIComponent(host)+'&port='+port)
 if ( response === null ) {
   return { error: 'SERVER_UNREACHABLE' }
 }

 return { data: response_data }
}


/**
 * @name checkCheckServerApi
 * @function
//  * @param {object} checkServer - Check server to check
 * @returns {boolean}
 * Check if a check server API is valid,  --> actually not used
 */
// CMH.api.checkCheckServerApi = async (checkServer) => {
//   try {
//     const url = new URL(checkServer.server)
//   } catch (e) {
//     if (e instanceof TypeError) {      
//       return false
//     }
//   }

//   const { host:defaultCheckServerHost, port:defaultCheckServerPort } = CMH.common.parseURL(CMH.options.defaultCheckServer.url)
//   const { cert, data:response_data, response } = await CMH.certificatesManager.getCertUrl(checkServer.server+'api.php?host='+encodeURIComponent(defaultCheckServerHost)+'&port='+defaultCheckServerPort)
//   if ((cert === null) || (response === null)) {
//     return false
//   }

//   if (!response.ok) {
//     return false
//   }

//   if (!CMH.certificatesChecker.compareCertificateFingerprints(cert, { fingerprints: { sha256: checkServer.sha256 } })) {
//     return false
//   }

//   if ((response_data === null) || (typeof response_data.error !== 'undefined') || (!CMH.certificatesChecker.compareCertificateFingerprints(response_data, CMH.options.defaultCheckServer))) {
//     return false
//   }

//   return true
// }
