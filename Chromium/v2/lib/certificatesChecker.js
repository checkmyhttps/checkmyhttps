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

    datas_api = await CMH.api.requestFromUrl(tab.url)
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
  } else {
    if (!CMH.native.nativeAppInfo.connected) {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      CMH.ui.showNotification(browser.i18n.getMessage('__nativeAppNotConnected__'))
      return
    }
    try {
      const responseData = await CMH.native.postMessageAndWaitResponse({ action: 'check', params: { url: tab.url, tabId: tab.id }}, 'check')
      CMH.certificatesChecker.handleVerificationResult(responseData.CMHwholeServerResponse, responseData.result, responseData.url, responseData.tabId, showNotifications)
    } catch (e) {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__serverUnreachable__'))
      }
      return
    }
  }
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

    datas_api = await CMH.api.requestFromUrl(urlTested)
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
  } else {
    if (!CMH.native.nativeAppInfo.connected) {
      CMH.ui.showNotification(browser.i18n.getMessage('__nativeAppNotConnected__'))
      return
    }
    try {
      const responseData = await CMH.native.postMessageAndWaitResponse({ action: 'check', params: { url: urlTested }}, 'check')
      CMH.certificatesChecker.handleVerificationResult(responseData.CMHwholeServerResponse, responseData.result, responseData.url, null, showNotifications)
    } catch (e) {
      return
    }
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
  } else if (cmhCertificate.whitelisted) { // Check certificate whitelisted
    return 'WL'
  } else if ((userCertificate.issuer) && (cmhCertificate.issuer) && (CMH.certificatesChecker.compareCertificateFingerprints(userCertificate.issuer, cmhCertificate.issuer))) { // Compare issuer certificate
    return 'WL'
  } else {
    return 'KO'
  }
}

CMH.certificatesChecker.checkServerSignature = async (response_data) => {
	
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

  return signatureIsValid
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
CMH.certificatesChecker.handleVerificationResult = async (response_data, result, url, tabId, showNotifications) => {
  if (result === 'OK') {
    if (tabId !== null) {
	  
	  // Check server response signature
	  signatureIsValid = await CMH.certificatesChecker.checkServerSignature(response_data)
	  if (signatureIsValid !== true) {
        CMH.tabsManager.setTabStatus(tabId, CMH.common.status.INVALID)
	  }
	  else {
		CMH.tabsManager.setTabStatus(tabId, CMH.common.status.VALID)
	  }
    }
  } else if (result === 'IDN') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.VALID)
    }
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__IDNwarning__', url))
      }
    }
  } else if (result === 'WL') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.WARNING)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__severalCertificats__'))
    }
  } else if (result === 'ERR') {
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
