/**
 * @file Certificates checker.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.certificatesChecker = {}

/**
 * @name isCheckableUrl
 * @function
 * @param {string}  urlTested         - URL to check
 * @param {boolean} showNotifications - Show notifications
 * @returns {boolean}
 * Check if an URL is checkable.
 */
CMH.certificatesChecker.isCheckableUrl = (urlTested, showNotifications) => {
  let protocol, host
  try {
    const url = new URL(urlTested)
    protocol = url.protocol.slice(0, -1)
    host     = url.hostname
  } catch (e) {
    if (e instanceof TypeError) {
      return false
    }
  }

  if (protocol !== 'https') {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__noHttps__'))
    }
    return false
  }

  if (host.match(/^((127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.))+[0-9\.]+$/)) { // Check private IP
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__privateHost__'))
    }
    return false
  }

  if (host.match("addons.mozilla.org")) {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__firefoxRestriction__'))
    }
    return false
  }

  return true
}


/**
 * @name checkTab
 * @function
 * @param {object}  tab               - Tab to check
 * @param {boolean} showNotifications - Show notifications
 * Check a tab.
 */
CMH.certificatesChecker.checkTab = async (tab, showNotifications) => {
  if (!CMH.certificatesChecker.isCheckableUrl(tab.url, showNotifications)) {
    return
  }

  CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.WORKING)

  // Get the certificate of tab.url from user's view
  let userCert = await CMH.certificatesManager.getCertTab(tab)
  if (userCert === null || userCert.error !== undefined) {
    CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__webServerToCheckUnreachable__'))
    }

    return
  }
  
  // Get the certificate of tab.url from check server's view
  let ip = CMH.tabsManager.getTabIp(tab.id)
  data_api = await CMH.api.getCertFromCheckServer(tab.url, ip)

  if (data_api.error) {
    if (data_api.error === 'PUBLIC_KEY') {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__invalidPublicKey__'), { openOptionsPage: 1 })
      } 
    } else if (data_api.error === 'CHECK_SERVER_UNREACHABLE') {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__checkServerUnreachable__'))
      }
    } else if (data_api.error === 'SIGNATURE') {
        CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.INVALID)
        if (showNotifications) {
          CMH.ui.showNotification(browser.i18n.getMessage('__invalidServerSignature__'), { priority: 2 })
        }
    } else if (data_api.error === 'FINGERPRINT') {
        CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.INVALID)
        if (showNotifications) {
          CMH.ui.showNotification(browser.i18n.getMessage('__serverHardcodedFingerprintNotCorresponding__'), { priority: 2 })
        }
    } else {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__unknownIssue__'))
      }
    }

    return
  }

  // Compare certificates from user's view and from check server's view
  const verificationRes = CMH.certificatesChecker.verifyCertificate(userCert, data_api.data)
  CMH.certificatesChecker.handleVerificationResult(verificationRes, tab.url, tab.id, showNotifications)
}


/**
 * @name verifyCertificate
 * @function
 * @param {object}  userCertificate - Certificate from the user
 * @param {object}  cmhCertificate  - Certificate from the CheckMyHTTPS server
 * @returns {string} - verification result
 * Check if the user's certificate is valid.
 */
CMH.certificatesChecker.verifyCertificate = (userCertificate, cmhCertificate) => {
  if (CMH.certificatesChecker.compareCertificateFingerprints(userCertificate.fingerprints.sha256, cmhCertificate.fingerprints.sha256)) {
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      // Check if the domain name is an IDN (Internationalized Domain Name) e.g. примеры.рф
      const domainName = cmhCertificate.host.split(':')[0]
      const names = domainName.split('.')
      for (let name of names) {
        if (name.startsWith('xn--')) {
          return 'IDN'
        }
      }
    }
    return 'OK'
  } else {
    return 'KO'
  }
}


/**
 * @name handleVerificationResult
 * @function
 * @param {string} result            - Verification result
 * @param {object} url               - URL to check
 * @param {object} [tabId]           - Tab to check
 * @param {boolean} showNotifications - Show notifications
 * Check if the user's certificate is valid.
 */
CMH.certificatesChecker.handleVerificationResult = (result, url, tabId, showNotifications) => {
  if (result === 'OK') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.VALID)
    }
  } else if (result === 'IDN') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.VALID)
    }
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__IDNwarning__', url), { openIDNInfoLinkPage: 1 })
      }
    }
  } else if (result === 'KO') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.INVALID)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { priority: 2 })
    }
  } else {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.UNKNOWN)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__unknownIssue__'))
    }
  }
}


/**
 * @name compareCertificateFingerprints
 * @function
 * @param {object} userCertificateFingerprint - SHA256 fingerprint of certificate from the user
 * @param {object} cmhCertificateFingerprint  - SHA256 fingerprint of certificate from the check server
 * @returns {boolean}
 * Compare fingerprints of two certificates.
 */
CMH.certificatesChecker.compareCertificateFingerprints = (userCertificateFingerprint, cmhCertificateFingerprint) => {
  //console.log(userCertificateFingerprint + " VS " + cmhCertificateFingerprint)
  return (userCertificateFingerprint === cmhCertificateFingerprint)
}
