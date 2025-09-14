/**
 * @file Certificates manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.certificatesManager = {}

/**
 * @name getCertTab
 * @function
 * @param {object} tab - Tab to check
 * Get the certificate of a tab.
 */
CMH.certificatesManager.getCertTab = async (tab) => {
  let cert = CMH.tabsManager.getTabCertificate(tab.id)
  if ((cert === null) && (true /* Allow check from an independant request */)) {
    // If certificate is not already stored, get it from a new request
    cert = await CMH.api.getCertFromUser(tab.url)
  }
  return cert
}


/**
 * @name formatCertificate
 * @function
 * @param {object} certificateChain - Array of every certificate in the chain
 * @param {number} [iteration] - Iteration of each certificate
 * @returns {object} - certificate chain formatted
 * Format a certificate.
 */
CMH.certificatesManager.formatCertificate = (certificateChain, iteration) => {
  if (certificateChain.length === 0) {
    return null
  }
  if (typeof iteration === 'undefined') {
    iteration = 0
  }

  let certificateFormatted = {
    fingerprints: {
      sha256: certificateChain[iteration].fingerprint.sha256.replace(/:/g, '').toUpperCase()
    }
  }

  if ((certificateChain.length-1) > iteration) {
    certificateFormatted.issuer = CMH.certificatesManager.formatCertificate(certificateChain, iteration+1)
  }

  return certificateFormatted
}