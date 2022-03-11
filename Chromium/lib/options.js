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
  checkServerFingerprintsSha256: '6D9BBB554CE7CD4420C26F60DD0831D40C34BB07F93E874CF631C24AB9F08F57'
}

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
CMH.options.defaultCheckServer = {
  url: 'https://checkmyhttps.net/',
  fingerprints: {
    sha256: '6D9BBB554CE7CD4420C26F60DD0831D40C34BB07F93E874CF631C24AB9F08F57'
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
chrome.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'disableNotifications', 'checkServerUrl', 'checkServerFingerprintsSha256']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
}, (error) => { console.error(error) })

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, area) => {
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
