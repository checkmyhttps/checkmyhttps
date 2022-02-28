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

  if (CMH.common.isWebExtTlsApiSupported()) {
    let cert = await CMH.certificatesManager.getCertTab(tab)
    if (cert === null) {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      return
    }

    let ip = CMH.tabsManager.getTabIp(tab.id)
    datas_api = await CMH.api.requestFromUrl(tab.url, ip)
    if (datas_api.error) {
      if (datas_api.error === 'SSL') {
        CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.INVALID)
        if (showNotifications) {
          CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { priority: 2 })
        }
      } else {
        CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
        if (showNotifications) {
          CMH.ui.showNotification(browser.i18n.getMessage('__serverUnreachable__'))
        }
      }
      return
    }

    const verificationRes = CMH.certificatesChecker.verifyCertificate(cert, datas_api.data)
    CMH.certificatesChecker.handleVerificationResult(verificationRes, tab.url, tab.id, showNotifications)
  }
  else
    return
}

/**
 * @name checkUrl
 * @function
 * @param {string}  urlTested         - URL to check
 * @param {boolean} showNotifications - Show notifications
 * Check an URL.
 */
CMH.certificatesChecker.checkUrl = async (urlTested, showNotifications) => {
  if (!CMH.certificatesChecker.isCheckableUrl(urlTested, showNotifications)) {
    return
  }

  if (CMH.common.isWebExtTlsApiSupported()) {
    const requestUrl = await CMH.certificatesManager.getCertUrl(urlTested, true)
    cert = requestUrl.cert
    if (cert === null) {
      return
    }

    let ip = ""
    datas_api = await CMH.api.requestFromUrl(urlTested, ip)
    if (datas_api.error) {
      if (datas_api.error === 'SSL') {
        if (showNotifications) {
          CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { priority: 2 })
        }
      }
      return
    }

    const verificationRes = CMH.certificatesChecker.verifyCertificate(cert, datas_api.data)
    CMH.certificatesChecker.handleVerificationResult(verificationRes, tab.url, tab.id, showNotifications)
  }
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
  if (CMH.certificatesChecker.compareCertificateFingerprints(userCertificate, cmhCertificate)) {
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      // Check if the domain name is an IDN
      const domainName = cmhCertificate.host.split(':')[0]
      const names = domainName.split('.')
      for (let name of names) {
        if (name.startsWith('xn--')) {
          return 'IDN'
        }
      }
    }
    return 'OK'
  } 
  else if ((userCertificate.issuer) && (cmhCertificate.issuer) && (CMH.certificatesChecker.compareCertificateFingerprints(userCertificate.issuer, cmhCertificate.issuer))) { // Compare issuer certificate
    return 'SC'
  } else {
    return 'KO'
  }
}

/**
 * @name handleVerificationResult
 * @function
 * @param {string}  result            - Verification result
 * @param {object}  url               - URL to check
 * @param {object}  [tabId]           - Tab to check
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
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.WARNING)
    }
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__IDNwarning__', url))
      }
    }
  } 
  else if (result === 'SC') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.WARNING)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__severalCertificats__'))
    }
  }
  else if (result === 'ERR') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.UNKNOWN)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__serverUnreachable__'))
    }
  } else if (result === 'SSLP') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.INVALID)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { priority: 2 })
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
      CMH.ui.showNotification(browser.i18n.getMessage('__serverUnreachable__'))
    }
  }
}

/**
 * @name compareCertificateFingerprints
 * @function
 * @param {object} userCertificate - Certificate from the user
 * @param {object} cmhCertificate  - Certificate from the server
 * @returns {boolean}
 * Compare fingerprints of two certificates.
 */
CMH.certificatesChecker.compareCertificateFingerprints = (userCertificate, cmhCertificate) => {
  return (userCertificate.fingerprints.sha256 === cmhCertificate.fingerprints.sha256)
}
