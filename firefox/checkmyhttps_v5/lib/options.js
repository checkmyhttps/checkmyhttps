/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.options = {}

/**
 * @type {object}
 * Cache of extension options.
 */
CMH.options.settings = {
  checkOnPageLoad:               false,
  alertOnUnicodeIDNDomainNames:  true,
  disableNotifications:          false, 
  checkServerUrl:                'https://checkmyhttps.net/',
  checkServerFingerprintsSha256: 'C8F129A6D02194583A6B205B27AB7A246651A9915857E8DB24C1909D6F54F324'
}

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
CMH.options.defaultCheckServer = {
  url: 'https://checkmyhttps.net/',
  fingerprints: {
    sha256: 'C8F129A6D02194583A6B205B27AB7A246651A9915857E8DB24C1909D6F54F324'
  }
}

/**
 * @name getCertUrl
 * @function
 * @param {string} url - URL to check
 * @returns {object} - fingerprints
 * Get the certificate fingerprints of an URL.
 */
CMH.options.getCertUrl = async (url) => {
  if (CMH.common.isWebExtTlsApiSupported()) {
    const { cert } = await CMH.certificatesManager.getCertUrl(url, true)
    return cert
  } else {
    try {
      const data = await CMH.native.postMessageAndWaitResponse({ action: 'getFingerprints', params: { url: url }}, 'resFingerprints')
      cert = {
        fingerprints: data.fingerprints
      }
      return cert
    } catch (e) {
      return { fingerprints: null }
    }
  }
}

// Get settings values
browser.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'disableNotifications', 'checkServerUrl', 'checkServerFingerprintsSha256']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
}, (error) => { console.error(error) })

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  const changedItems = Object.keys(changes)
  let needRefreshNativeApp = false

  for (let item of changedItems) {
    CMH.options.settings[item] = changes[item].newValue
    if ((!needRefreshNativeApp) && (['checkServerUrl', 'checkServerFingerprintsSha256'].includes(item))) {
      needRefreshNativeApp = true
    }
  }

  if (needRefreshNativeApp && (!CMH.common.isWebExtTlsApiSupported())) {
    CMH.native.port.postMessage({ action: 'setOptions', params: {
      checkServerUrl:                CMH.options.settings.checkServerUrl,
      checkServerFingerprintsSha256: CMH.options.settings.checkServerFingerprintsSha256
    }})
  }
})
